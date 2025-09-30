import { extractPdfTextTempFile } from './pdfTempFile';

/**
 * Main PDF text extraction function using minimal memory approach
 * This is a wrapper around the temp file implementation for maximum memory efficiency
 */
export async function extractPdfText(): Promise<string> {
  return await extractPdfTextTempFile();
}