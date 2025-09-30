import type { NextApiRequest, NextApiResponse } from 'next';
import { extractPdfText } from '../../lib/pdf';
import { getAnswerFromOpenAI } from '../../lib/openai';
import { getMemoryUsage } from '../../lib/pdfTempFile';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    console.log('Memory before PDF extraction:', getMemoryUsage());
    const pdfText = await extractPdfText();
    console.log('Memory after PDF extraction:', getMemoryUsage());
    
    const answer = await getAnswerFromOpenAI(question, pdfText);
    console.log('Memory after OpenAI processing:', getMemoryUsage());

    res.status(200).json({ answer });
  } catch (error: unknown) {
    console.error('API Error:', error);
    
    // Return appropriate error messages to the client
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again in a moment.',
          retryAfter: 60 
        });
      }
      
      if (error.message.includes('too large to process')) {
        return res.status(413).json({ 
          error: 'The document is too large to process. Please try a more specific question.' 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process your question. Please try again.' 
    });
  }
}