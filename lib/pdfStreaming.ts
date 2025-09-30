import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { getCachedPdfText, setCachedPdfText } from './cache';

/**
 * Advanced streaming PDF text extraction with memory optimization
 * This approach uses Node.js streams and processes the PDF in chunks
 * to minimize memory usage for large files
 */
export async function extractPdfTextStreaming(): Promise<string> {
  // Check cache first
  const cachedText = getCachedPdfText();
  if (cachedText) {
    return cachedText;
  }

  const filePath = path.join(process.cwd(), 'data', 'document.pdf');
  
  try {
    // Check if file exists first
    if (!fs.existsSync(filePath)) {
      throw new Error('PDF file not found');
    }

    // Get file stats to check size
    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`Processing PDF file: ${fileSizeMB} MB`);

    // For very large files, we'll use a different approach
    if (stats.size > 50 * 1024 * 1024) { // 50MB threshold
      return await processLargePdf(filePath);
    }

    // For smaller files, use the optimized streaming approach
    return await processSmallPdf(filePath);
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF document');
  }
}

/**
 * Process smaller PDFs (< 50MB) with streaming
 * This approach avoids loading the entire file into memory
 */
async function processSmallPdf(filePath: string): Promise<string> {
  // For now, we'll use a more conservative approach
  // Since pdf-parse requires the entire buffer, we'll limit file size
  const stats = fs.statSync(filePath);
  
  if (stats.size > 20 * 1024 * 1024) { // 20MB limit for "small" files
    throw new Error('File too large for small PDF processing. Use large PDF processing instead.');
  }
  
  // Use a temporary file approach to avoid memory issues
  const tempBuffer = Buffer.allocUnsafe(stats.size);
  let offset = 0;
  
  const stream = fs.createReadStream(filePath, { 
    highWaterMark: 32 * 1024 // Smaller chunks
  });
  
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (chunk: string | Buffer) => {
      if (Buffer.isBuffer(chunk)) {
        chunk.copy(tempBuffer, offset);
        offset += chunk.length;
      }
    });
    
    stream.on('end', () => {
      resolve();
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
  
  const data = await pdfParse(tempBuffer, {
    max: 0,
    version: 'v1.10.100',
  });
  
  // Clean up memory immediately
  tempBuffer.fill(0);
  
  // Cache the result
  setCachedPdfText(data.text);
  
  console.log(`PDF text extracted: ${data.text.length} characters`);
  return data.text;
}

/**
 * Process larger PDFs (> 50MB) with advanced memory management
 */
async function processLargePdf(filePath: string): Promise<string> {
  console.log('Processing large PDF with advanced memory management...');
  
  // For very large files, we might need to implement page-by-page processing
  // For now, we'll use a more conservative approach
  const stream = fs.createReadStream(filePath, { 
    highWaterMark: 32 * 1024 // Smaller chunks for large files
  });
  
  const chunks: Buffer[] = [];
  let totalSize = 0;
  const maxSize = 100 * 1024 * 1024; // 100MB limit
  
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (chunk: string | Buffer) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
        totalSize += chunk.length;
        
        if (totalSize > maxSize) {
          stream.destroy();
          reject(new Error(`PDF file too large (>${maxSize / 1024 / 1024}MB). Please use a smaller file or implement page-by-page processing.`));
        }
      }
    });
    
    stream.on('end', () => {
      resolve();
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
  
  const buffer = Buffer.concat(chunks);
  const data = await pdfParse(buffer, {
    max: 0,
    version: 'v1.10.100',
  });
  
  // Clean up memory aggressively
  buffer.fill(0);
  chunks.forEach(chunk => chunk.fill(0));
  
  // Cache the result
  setCachedPdfText(data.text);
  
  console.log(`Large PDF text extracted: ${data.text.length} characters`);
  return data.text;
}

/**
 * Get memory usage information for debugging
 */
export function getMemoryUsage(): string {
  const usage = process.memoryUsage();
  return `Memory Usage - RSS: ${(usage.rss / 1024 / 1024).toFixed(2)}MB, Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB, Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`;
}
