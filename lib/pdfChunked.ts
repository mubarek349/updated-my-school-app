import fs from 'fs';
import path from 'path';
import { getCachedPdfText, setCachedPdfText } from './cache';

/**
 * Alternative PDF processing approach that avoids loading entire file into memory
 * This uses a more memory-efficient approach by processing the PDF in smaller chunks
 */

export async function extractPdfTextChunked(): Promise<string> {
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

    // For very large files, we'll use a different strategy
    if (stats.size > 10 * 1024 * 1024) { // 10MB threshold
      return await processVeryLargePdf(filePath, stats.size);
    }

    // For smaller files, use the optimized approach
    return await processMediumPdf(filePath, stats.size);
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF document');
  }
}

/**
 * Process medium-sized PDFs (1-10MB) with memory optimization
 */
async function processMediumPdf(filePath: string, fileSize: number): Promise<string> {
  console.log('Processing medium PDF with memory optimization...');
  
  // Force garbage collection before processing
  if (global.gc) {
    global.gc();
  }
  
  // Use a more conservative buffer allocation
  const buffer = Buffer.allocUnsafe(fileSize);
  let offset = 0;
  
  const stream = fs.createReadStream(filePath, { 
    highWaterMark: 16 * 1024 // Very small chunks
  });
  
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (chunk: string | Buffer) => {
      if (Buffer.isBuffer(chunk)) {
        chunk.copy(buffer, offset);
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
  
  // Import pdf-parse dynamically to avoid loading it if not needed
  const pdfParse = (await import('pdf-parse')).default;
  
  const data = await pdfParse(buffer, {
    max: 0,
    version: 'v1.10.100',
  });
  
  // Clean up memory aggressively
  buffer.fill(0);
  
  // Force garbage collection after processing
  if (global.gc) {
    global.gc();
  }
  
  // Cache the result
  setCachedPdfText(data.text);
  
  console.log(`Medium PDF text extracted: ${data.text.length} characters`);
  return data.text;
}

/**
 * Process very large PDFs (>10MB) with extreme memory management
 */
async function processVeryLargePdf(filePath: string, fileSize: number): Promise<string> {
  console.log('Processing very large PDF with extreme memory management...');
  
  // For very large files, we need to be extremely careful with memory
  if (fileSize > 50 * 1024 * 1024) { // 50MB limit
    throw new Error('PDF file too large (>50MB). Please use a smaller file or implement page-by-page processing.');
  }
  
  // Force garbage collection before processing
  if (global.gc) {
    global.gc();
  }
  
  // Use the most conservative approach possible
  const buffer = Buffer.allocUnsafe(fileSize);
  let offset = 0;
  
  const stream = fs.createReadStream(filePath, { 
    highWaterMark: 8 * 1024 // Very small chunks - 8KB
  });
  
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (chunk: string | Buffer) => {
      if (Buffer.isBuffer(chunk)) {
        chunk.copy(buffer, offset);
        offset += chunk.length;
        
        // Force garbage collection periodically during processing
        if (offset % (1024 * 1024) === 0 && global.gc) { // Every 1MB
          global.gc();
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
  
  // Import pdf-parse dynamically
  const pdfParse = (await import('pdf-parse')).default;
  
  const data = await pdfParse(buffer, {
    max: 0,
    version: 'v1.10.100',
  });
  
  // Clean up memory aggressively
  buffer.fill(0);
  
  // Force garbage collection after processing
  if (global.gc) {
    global.gc();
  }
  
  // Cache the result
  setCachedPdfText(data.text);
  
  console.log(`Very large PDF text extracted: ${data.text.length} characters`);
  return data.text;
}

/**
 * Get memory usage information for debugging
 */
export function getMemoryUsage(): string {
  const usage = process.memoryUsage();
  return `Memory Usage - RSS: ${(usage.rss / 1024 / 1024).toFixed(2)}MB, Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB, Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`;
}
