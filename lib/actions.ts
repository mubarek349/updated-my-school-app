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
} from '@/lib/cache'
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

export async function askQuestion(question: string, aiProvider?: AIProvider) {
  try {
    // Read all files from data folder and process them
    const dataFolder = join(process.cwd(), 'data')
    const files = await readdir(dataFolder)
    
    if (files.length === 0) {
      return { success: false, error: 'No files uploaded yet. Please upload a file first.' }
    }
    
    // Process all files and get their content
    let allContent = ''
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
    
    if (!file) {
      return { success: false, error: 'No file provided' }
    }
    
    let text: string
    let fileName: string
    
    // Handle PDF files - convert to base64 for both Gemini and OpenAI
    if (file.type === 'application/pdf') {
      // For both Gemini and OpenAI, we'll store the PDF as base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      
      // Store PDF metadata for processing
      const pdfMetadata = {
        fileName: file.name,
        mimeType: file.type,
        base64Data: base64,
        aiProvider: aiProvider,
        uploadedAt: new Date().toISOString()
      }
      
      const dataFolder = join(process.cwd(), 'data')
      fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf.json`
      const filePath = join(dataFolder, fileName)
      
      await writeFile(filePath, JSON.stringify(pdfMetadata), 'utf-8')
      
      return { 
        success: true, 
        message: `PDF file saved successfully as ${fileName}. You can now ask questions about it using ${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} AI.`
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
      const dataFolder = join(process.cwd(), 'data')
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