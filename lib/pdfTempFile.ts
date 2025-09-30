import fs from 'fs';
import path from 'path';
import { getCachedPdfText, setCachedPdfText } from './cache';

/**
 * PDF processing using temporary files to minimize memory usage
 * This approach writes the PDF to a temporary file and processes it from there
 */

export async function extractPdfTextTempFile(): Promise<string> {
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
    if (stats.size > 25 * 1024 * 1024) { // 25MB threshold
      throw new Error(`PDF file too large (${fileSizeMB}MB). Maximum supported size is 25MB.`);
    }

    // Use the most memory-efficient approach possible
    return await processWithMinimalMemory(filePath, stats.size);
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF document');
  }
}

/**
 * Process PDF with minimal memory usage
 */
async function processWithMinimalMemory(filePath: string, fileSize: number): Promise<string> {
  console.log('Processing PDF with minimal memory usage...');
  
  // Force garbage collection before processing
  if (global.gc) {
    global.gc();
  }
  
  // Use the most conservative buffer allocation
  const buffer = Buffer.allocUnsafe(fileSize);
  let offset = 0;
  
  const stream = fs.createReadStream(filePath, { 
    highWaterMark: 4 * 1024 // Very small chunks - 4KB
  });
  
  await new Promise<void>((resolve, reject) => {
    stream.on('data', (chunk: string | Buffer) => {
      if (Buffer.isBuffer(chunk)) {
        chunk.copy(buffer, offset);
        offset += chunk.length;
        
        // Force garbage collection periodically during processing
        if (offset % (512 * 1024) === 0 && global.gc) { // Every 512KB
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
  
  console.log(`PDF text extracted: ${data.text.length} characters`);
  return data.text;
}

/**
 * Get memory usage information for debugging
 */
export function getMemoryUsage(): string {
  const usage = process.memoryUsage();
  return `Memory Usage - RSS: ${(usage.rss / 1024 / 1024).toFixed(2)}MB, Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB, Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`;
}
