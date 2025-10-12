import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { fromBuffer } from 'pdf2pic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export type AIProvider = 'gemini' | 'openai'

export async function askLLM(question: string, context: string[], aiProvider: AIProvider = 'gemini') {
  const prompt = `Answer the question based only on the following course content:\n\n${context.join('\n\n')}\n\nQuestion: ${question}`

  try {
    if (aiProvider === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that answers questions based on the provided course content. Only use information from the provided content to answer questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || 'No response generated'
    } else {
      // Default to Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      })

      return result.response.text()
    }
  } catch (error) {
    console.error(`Error with ${aiProvider}:`, error)
    throw new Error(`Failed to get response from ${aiProvider}`)
  }
}

export type PDFFile = {
  fileName: string
  mimeType: string
  base64Data: string
  aiProvider: AIProvider
  uploadedAt: string
}

export async function askLLMWithPDFs(question: string, pdfFiles: PDFFile[], aiProvider: AIProvider = 'gemini') {
  try {
    if (aiProvider === 'openai') {
      // OpenAI PDF processing using vision model
      const prompt = `Answer the question based only on the content from the uploaded PDF documents. Please provide a comprehensive answer using information from the documents.\n\nQuestion: ${question}`

      // For OpenAI, we'll use the vision model to process PDFs
      const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
        { type: 'text', text: prompt }
      ]

      // Add PDF images to the content
      for (const pdfFile of pdfFiles) {
        // Convert PDF to images for OpenAI vision model
        const pdfImages = await convertPDFToImages(pdfFile.base64Data)
        
        for (const imageBase64 of pdfImages) {
          userContent.push({
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${imageBase64}`
            }
          })
        }
      }

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that answers questions based on the provided PDF documents. Only use information from the provided documents to answer questions.'
        },
        {
          role: 'user',
          content: userContent
        }
      ]

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || 'No response generated'
    } else {
      // Gemini PDF processing (existing code)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      // Prepare the prompt
      const prompt = `Answer the question based only on the content from the uploaded PDF documents. Please provide a comprehensive answer using information from the documents.\n\nQuestion: ${question}`

      // Prepare the parts array with text and PDF data
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: prompt }]

      // Add each PDF file to the parts
      for (const pdfFile of pdfFiles) {
        parts.push({
          inlineData: {
            mimeType: pdfFile.mimeType,
            data: pdfFile.base64Data
          }
        })
      }

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: parts
          }
        ]
      })

      return result.response.text()
    }
  } catch (error) {
    console.error(`Error processing PDFs with ${aiProvider}:`, error)
    throw new Error(`Failed to process PDF documents with ${aiProvider}`)
  }
}

// Helper function to convert PDF to images for OpenAI
async function convertPDFToImages(pdfBase64: string): Promise<string[]> {
  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')
    
    // Convert PDF to images using pdf2pic
    const convert = fromBuffer(pdfBuffer, {
      density: 100,           // Output resolution
      saveFilename: "page",   // Output filename
      savePath: "./temp",     // Output path
      format: "png",          // Output format
      width: 2000,           // Output width
      height: 2000           // Output height
    })
    
    const results = await convert.bulk(-1) // Convert all pages
    
    const imageBase64Array: string[] = []
    
    for (const result of results) {
      // Check if result has base64 data
      if (result && typeof result === 'object' && 'base64' in result) {
        imageBase64Array.push(result.base64 as string)
      }
    }
    
    return imageBase64Array
  } catch (error) {
    console.error('Error converting PDF to images:', error)
    // Fallback: return empty array if conversion fails
    return []
  }
}