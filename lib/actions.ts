'use server'

import { embedQuery, embedChunks } from '@/lib/embed'
import { queryRelevantChunks, saveChunks } from '@/lib/chroma'
import { askLLM, askLLMWithPDFs, AIProvider, PDFFile } from '@/lib/ask'
import { 
  getCachedEmbeddings, 
  setCachedEmbeddings, 
  getCachedResponse, 
  setCachedResponse,
  getCachedContent,
  setCachedContent
} from '@/lib/cache copy'
import { writeFile, readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'

// Simple text chunking function
function chunkText(text: string, chunkSize: number = 10000): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

export async function askQuestionFromPackage(question: string, packageId: string) {
  try {
    // Get package data from database
    const prisma = (await import('@/lib/db')).default
    const coursePackage = await prisma.coursePackage.findUnique({
      where: { id: packageId },
      select: { aiPdfData: true, aiProvider: true }
    })
    
    if (!coursePackage || !coursePackage.aiPdfData) {
      return { success: false, error: 'No AI PDF data found for this package. Please upload a file first.' }
    }
    
    const aiProvider = (coursePackage.aiProvider as AIProvider) || 'gemini'
    const aiPdfDataFileName = coursePackage.aiPdfData
    
    // Read the PDF data from file
    const dataFolder = join(process.cwd(), 'docs/ai-pdfs')
    const filePath = join(dataFolder, aiPdfDataFileName)
    
    try {
      const fileContent = await readFile(filePath, 'utf-8')
      let pdfData
      
      try {
        pdfData = JSON.parse(fileContent)
      } catch (parseError) {
        console.error('Error parsing PDF data JSON:', parseError)
        return { success: false, error: 'Failed to parse PDF data. The file may be corrupted.' }
      }
      
      if (!pdfData.base64Data || !pdfData.fileName) {
        return { success: false, error: 'Invalid PDF data format. Missing required fields.' }
      }
      
      // Check base64 data size (approximate PDF size in MB)
      const base64SizeMB = (pdfData.base64Data.length * 0.75) / (1024 * 1024) // base64 is ~33% larger than binary
      console.log(`PDF size: ${base64SizeMB.toFixed(2)}MB`)
      
      if (base64SizeMB > 15) {
        return { 
          success: false, 
          error: `PDF file is too large (${base64SizeMB.toFixed(2)}MB). Please upload a PDF smaller than 15MB for better performance.` 
        }
      }
      
      // Use the package's current AI provider (from database) - this takes priority over the stored file provider
      // This allows admins to change AI provider without re-uploading PDFs
      const finalAiProvider = aiProvider || pdfData.aiProvider
      
      // Generate content hash for caching
      const contentHash = createHash('md5').update(pdfData.base64Data.substring(0, 100)).digest('hex')
      
      // Check cache first
      const cachedResponse = await getCachedResponse(question, contentHash, finalAiProvider)
      if (cachedResponse) {
        console.log('Using cached response for question:', question.substring(0, 50) + '...')
        return { success: true, answer: cachedResponse, aiProvider: finalAiProvider }
      }
      
      // Validate base64 data
      if (!pdfData.base64Data || pdfData.base64Data.length < 100) {
        return { 
          success: false, 
          error: 'PDF data is empty or too small. The file may be corrupted. Please re-upload the PDF.' 
        }
      }
      
      // Create PDF file object
      const pdfFile: PDFFile = {
        fileName: pdfData.fileName,
        mimeType: pdfData.mimeType,
        base64Data: pdfData.base64Data,
        aiProvider: finalAiProvider,
        uploadedAt: pdfData.uploadedAt
      }
      
      console.log(`Asking question to ${finalAiProvider} with PDF: ${pdfFile.fileName}`)
      console.log(`PDF data length: ${pdfFile.base64Data.length} chars`)
      
      // Ask question with the PDF
      const answer = await askLLMWithPDFs(question, [pdfFile], finalAiProvider)
      
      console.log(`Received answer from ${finalAiProvider}, length: ${answer.length} chars`)
      
      // Cache the response
      await setCachedResponse(question, contentHash, finalAiProvider, answer)
      
      return { success: true, answer, aiProvider: finalAiProvider }
    } catch (fileError) {
      console.error('Error reading PDF file:', fileError)
      console.error('File path attempted:', filePath)
      console.error('File exists check needed for:', aiPdfDataFileName)
      
      // More specific error message
      if ((fileError as NodeJS.ErrnoException).code === 'ENOENT') {
        return { success: false, error: `PDF file not found: ${aiPdfDataFileName}. Please re-upload the PDF.` }
      }
      
      return { success: false, error: `Failed to read AI PDF data file: ${(fileError as Error).message || 'Unknown error'}` }
    }
  } catch (error) {
    console.error('Error asking question:', error)
    return { success: false, error: 'Failed to process question' }
  }
}

export async function askQuestion(question: string, aiProvider?: AIProvider, aiPdfData?: string) {
  try {
    // Read all files from data folder and process them
    const dataFolder = join(process.cwd(), 'docs/ai-pdfs')
    const files = await readdir(dataFolder)
    
    if (files.length === 0) {
      return { success: false, error: 'No files uploaded yet. Please upload a file first.' }
    }
    
    // Process all files and get their content
    let allContent = ''
    if (aiPdfData) {
      allContent = aiPdfData
    }
    let detectedAiProvider: AIProvider = 'gemini' // default
    const pdfFiles: PDFFile[] = []
    let contentHash = ''
    
    for (const file of files) {
      const filePath = join(dataFolder, file)
      
      // Handle PDF files (stored as JSON with base64 data)
      if (file.endsWith('.pdf.json')) {
        const pdfData = JSON.parse(await readFile(filePath, 'utf-8'))
        pdfFiles.push(pdfData)
        detectedAiProvider = pdfData.aiProvider || 'gemini'
        contentHash += pdfData.base64Data.substring(0, 100) // Use first 100 chars for hash
      }
      // Handle text files
      else {
        const content = await readFile(filePath, 'utf-8')
        
        // Extract AI provider from metadata if present
        if (content.startsWith('AI_PROVIDER:')) {
          const lines = content.split('\n')
          const providerLine = lines[0]
          const provider = providerLine.replace('AI_PROVIDER:', '').trim() as AIProvider
          if (provider === 'gemini' || provider === 'openai') {
            detectedAiProvider = provider
          }
          // Remove metadata line from content
          allContent += lines.slice(2).join('\n') + '\n\n'
        } else {
          allContent += content + '\n\n'
        }
        contentHash += content.substring(0, 100) // Use first 100 chars for hash
      }
    }
    
    // Use provided AI provider or detected one
    const finalAiProvider = aiProvider || detectedAiProvider
    
    // Generate content hash for caching
    const fullContentHash = createHash('md5').update(contentHash).digest('hex')
    
    // Check cache for AI response first
    const cachedResponse = await getCachedResponse(question, fullContentHash, finalAiProvider)
    if (cachedResponse) {
      console.log('Using cached response for question:', question.substring(0, 50) + '...')
      return { success: true, answer: cachedResponse, aiProvider: finalAiProvider }
    }
    
    // If we have PDF files, process them directly with the selected AI provider
    if (pdfFiles.length > 0) {
      const answer = await askLLMWithPDFs(question, pdfFiles, finalAiProvider)
      
      // Cache the response
      await setCachedResponse(question, fullContentHash, finalAiProvider, answer)
      
      return { success: true, answer, aiProvider: finalAiProvider }
    }
    
    // For text files or OpenAI, use the traditional embedding approach with caching
    if (allContent.trim()) {
      // Check cache for embeddings
      const cachedEmbeddings = await getCachedEmbeddings(allContent)
      let embeddings: number[][]
      
      if (cachedEmbeddings) {
        console.log('Using cached embeddings for content')
        embeddings = cachedEmbeddings
      } else {
        console.log('Generating new embeddings for content')
        // Create embeddings for the content
        const chunks = chunkText(allContent)
        embeddings = await embedChunks(chunks)
        
        // Cache the embeddings
        await setCachedEmbeddings(allContent, embeddings)
      }
      
      await saveChunks(chunkText(allContent), embeddings)
      
      // Now answer the question
      const queryEmbedding = await embedQuery(question)
      const contextChunks = await queryRelevantChunks(queryEmbedding)
      const answer = await askLLM(question, contextChunks.filter(Boolean) as string[], finalAiProvider)
      
      // Cache the response
      await setCachedResponse(question, fullContentHash, finalAiProvider, answer)
      
      return { success: true, answer, aiProvider: finalAiProvider }
    }
    
    return { success: false, error: 'No readable content found in uploaded files.' }
  } catch (error) {
    console.error('Error asking question:', error)
    return { success: false, error: 'Failed to process question' }
  }
}

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const aiProvider = (formData.get('aiProvider') as AIProvider) || 'gemini'
    const packageId = formData.get('packageId') as string
    
    if (!file) {
      return { success: false, error: 'No file provided' }
    }
    
    if (!packageId) {
      return { success: false, error: 'No package ID provided' }
    }
    
    let text: string
    let fileName: string
    
    // Handle PDF files - convert to base64 for both Gemini and OpenAI
    if (file.type === 'application/pdf') {
      // Check file size before processing
      const fileSizeMB = file.size / (1024 * 1024)
      console.log(`Uploading PDF: ${file.name}, Size: ${fileSizeMB.toFixed(2)}MB`)
      
      if (fileSizeMB > 15) {
        return { 
          success: false, 
          error: `PDF file is too large (${fileSizeMB.toFixed(2)}MB). Please upload a PDF smaller than 15MB for optimal AI processing.` 
        }
      }
      
      // For both Gemini and OpenAI, we'll store the PDF as base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      
      console.log(`Base64 size: ${(base64.length / (1024 * 1024)).toFixed(2)}MB`)
      
      // Store PDF metadata for processing
      const pdfMetadata = {
        fileName: file.name,
        mimeType: file.type,
        base64Data: base64,
        aiProvider: aiProvider,
        uploadedAt: new Date().toISOString()
      }
      
      const dataFolder = join(process.cwd(), 'docs/ai-pdfs')
      // Remove .pdf extension from original filename to avoid .pdf.pdf.json
      const cleanFileName = file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9.-]/g, '_')
      fileName = `${Date.now()}-${cleanFileName}.pdf.json`
      const filePath = join(dataFolder, fileName)
      
      // Ensure directory exists
      const { mkdir } = await import('fs/promises')
      try {
        await mkdir(dataFolder, { recursive: true })
      } catch {
        // Directory already exists
      }
      
      await writeFile(filePath, JSON.stringify(pdfMetadata), 'utf-8')
      
      // Update database with filename
      const prisma = (await import('@/lib/db')).default
      await prisma.coursePackage.update({
        where: { id: packageId },
        data: { aiPdfData: fileName }
      })
      
      return { 
        success: true, 
        message: `PDF file saved successfully as ${fileName}. You can now ask questions about it using ${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} AI.`,
        fileName
      }
    }
    // Handle text files
    else if (file.type === 'text/plain') {
      text = await file.text()
      
      // Process the extracted text
      if (!text || text.trim().length === 0) {
        return { 
          success: false, 
          error: 'The file appears to be empty or contains no readable text.'
        }
      }
      
      // Generate file hash for caching
      const fileHash = createHash('md5').update(text).digest('hex')
      
      // Check if we already have this content cached
      const cachedContent = await getCachedContent(fileHash)
      if (cachedContent) {
        console.log('Using cached content for file:', file.name)
        text = cachedContent
      } else {
        // Cache the content
        await setCachedContent(fileHash, text)
      }
      
      // Save file to data folder with AI provider metadata
      const dataFolder = join(process.cwd(), 'docs/ai-pdfs')
      fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.txt`
      const filePath = join(dataFolder, fileName)
      
      // Add AI provider metadata to the content
      const contentWithMetadata = `AI_PROVIDER: ${aiProvider}\n\n${text}`
      
      await writeFile(filePath, contentWithMetadata, 'utf-8')
      
      return { 
        success: true, 
        message: `Text file saved successfully as ${fileName}. You can now ask questions about it using ${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} AI.`
      }
    }
    // Unsupported file type
    else {
      return { 
        success: false, 
        error: `Unsupported file type: ${file.type}. Please upload a PDF (.pdf) or text (.txt) file.`
      }
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { success: false, error: 'Failed to process file' }
  }
}