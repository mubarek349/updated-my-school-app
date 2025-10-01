"use server";

import { readFile, stat } from "fs/promises";
import { join } from "path";

export interface AiPdfFileInfo {
  filename: string;
  size: number;
  lastModified: Date;
  exists: boolean;
}

export interface AiPdfFileData {
  filename: string;
  data: string; // base64 encoded
  size: number;
}

// Get AI PDF file information
export async function getAiPdfFileInfo(filename: string): Promise<{
  success: boolean;
  data?: AiPdfFileInfo;
  error?: string;
}> {
  try {
    if (!filename) {
      return { success: false, error: "Filename is required" };
    }

    const filePath = join(process.cwd(), "docs", "ai-pdfs", filename);
    
    try {
      const stats = await stat(filePath);

      return {
        success: true,
        data: {
          filename,
          size: stats.size,
          lastModified: stats.mtime,
          exists: true,
        },
      };
    } catch {
      return {
        success: true,
        data: {
          filename,
          size: 0,
          lastModified: new Date(),
          exists: false,
        },
      };
    }
  } catch (error) {
    console.error("Error getting AI PDF file info:", error);
    return { success: false, error: "Failed to get file information" };
  }
}

// Get AI PDF file data (for small files only)
export async function getAiPdfFileData(filename: string): Promise<{
  success: boolean;
  data?: AiPdfFileData;
  error?: string;
}> {
  try {
    if (!filename) {
      return { success: false, error: "Filename is required" };
    }

    const filePath = join(process.cwd(), "docs", "ai-pdfs", filename);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      // Only allow small files (< 10MB) to be loaded into memory
      if (fileBuffer.length > 10 * 1024 * 1024) {
        return { success: false, error: "File too large for direct loading" };
      }

      return {
        success: true,
        data: {
          filename,
          data: fileBuffer.toString('base64'),
          size: fileBuffer.length,
        },
      };
    } catch {
      return { success: false, error: "File not found" };
    }
  } catch (error) {
    console.error("Error getting AI PDF file data:", error);
    return { success: false, error: "Failed to get file data" };
  }
}

// List all AI PDF files
export async function listAiPdfFiles(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const { readdir } = await import("fs/promises");
    const aiPdfDir = join(process.cwd(), "docs", "ai-pdfs");
    
    try {
      const files = await readdir(aiPdfDir);
      return {
        success: true,
        data: files.filter(file => file.endsWith('.pdf') && !file.startsWith('.')),
      };
    } catch {
      return {
        success: true,
        data: [],
      };
    }
  } catch (error) {
    console.error("Error listing AI PDF files:", error);
    return { success: false, error: "Failed to list files" };
  }
}

