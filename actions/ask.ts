"use server";

import { extractPdfText } from '../lib/pdf';
import { getAnswerFromOpenAI } from '../lib/openai';
import { getMemoryUsage } from '../lib/pdfTempFile';

export async function askQuestion(question: string) {
  try {
    if (!question) {
      return { success: false, error: 'Missing question' };
    }

    console.log('Memory before PDF extraction:', getMemoryUsage());
    const pdfText = await extractPdfText();
    console.log('Memory after PDF extraction:', getMemoryUsage());

    const answer = await getAnswerFromOpenAI(question, pdfText);
    console.log('Memory after OpenAI processing:', getMemoryUsage());

    return { success: true, answer };
  } catch (error: unknown) {
    console.error('Server Action Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.',
          retryAfter: 60
        };
      }

      if (error.message.includes('too large to process')) {
        return {
          success: false,
          error: 'The document is too large to process. Please try a more specific question.'
        };
      }
    }

    return {
      success: false,
      error: 'Failed to process your question. Please try again.'
    };
  }
}