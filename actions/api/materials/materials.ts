"use server";

import { readFile, stat } from "fs/promises";
import { join } from "path";

export interface MaterialFileInfo {
  filename: string;
  contentType: string;
  size: number;
  lastModified: Date;
  exists: boolean;
}

export interface MaterialFileData {
  filename: string;
  contentType: string;
  data: string; // base64 encoded
  size: number;
}

// Get material file information
export async function getMaterialFileInfo(filename: string): Promise<{
  success: boolean;
  data?: MaterialFileInfo;
  error?: string;
}> {
  try {
    if (!filename) {
      return { success: false, error: "Filename is required" };
    }

    const materialPath = join(process.cwd(), "uploads", "materials", filename);
    
    try {
      const stats = await stat(materialPath);
      
      // Determine content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = "application/octet-stream";
      
      switch (ext) {
        case "pdf":
          contentType = "application/pdf";
          break;
        case "doc":
          contentType = "application/msword";
          break;
        case "docx":
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          break;
        case "ppt":
          contentType = "application/vnd.ms-powerpoint";
          break;
        case "pptx":
          contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
          break;
        case "xls":
          contentType = "application/vnd.ms-excel";
          break;
        case "xlsx":
          contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        case "txt":
          contentType = "text/plain";
          break;
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg";
          break;
        case "png":
          contentType = "image/png";
          break;
        case "gif":
          contentType = "image/gif";
          break;
        default:
          contentType = "application/octet-stream";
      }

      return {
        success: true,
        data: {
          filename,
          contentType,
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
          contentType: "application/octet-stream",
          size: 0,
          lastModified: new Date(),
          exists: false,
        },
      };
    }
  } catch (error) {
    console.error("Error getting material file info:", error);
    return { success: false, error: "Failed to get file information" };
  }
}

// Get material file data (for small files only)
export async function getMaterialFileData(filename: string): Promise<{
  success: boolean;
  data?: MaterialFileData;
  error?: string;
}> {
  try {
    if (!filename) {
      return { success: false, error: "Filename is required" };
    }

    const materialPath = join(process.cwd(), "uploads", "materials", filename);
    
    try {
      const fileBuffer = await readFile(materialPath);
      
      // Only allow small files (< 10MB) to be loaded into memory
      if (fileBuffer.length > 10 * 1024 * 1024) {
        return { success: false, error: "File too large for direct loading" };
      }
      
      // Determine content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = "application/octet-stream";
      
      switch (ext) {
        case "pdf":
          contentType = "application/pdf";
          break;
        case "doc":
          contentType = "application/msword";
          break;
        case "docx":
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          break;
        case "ppt":
          contentType = "application/vnd.ms-powerpoint";
          break;
        case "pptx":
          contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
          break;
        case "xls":
          contentType = "application/vnd.ms-excel";
          break;
        case "xlsx":
          contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        case "txt":
          contentType = "text/plain";
          break;
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg";
          break;
        case "png":
          contentType = "image/png";
          break;
        case "gif":
          contentType = "image/gif";
          break;
        default:
          contentType = "application/octet-stream";
      }

      return {
        success: true,
        data: {
          filename,
          contentType,
          data: fileBuffer.toString('base64'),
          size: fileBuffer.length,
        },
      };
    } catch {
      return { success: false, error: "File not found" };
    }
  } catch (error) {
    console.error("Error getting material file data:", error);
    return { success: false, error: "Failed to get file data" };
  }
}

// List all material files
export async function listMaterialFiles(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const { readdir } = await import("fs/promises");
    const materialDir = join(process.cwd(), "uploads", "materials");
    
    try {
      const files = await readdir(materialDir);
      return {
        success: true,
        data: files.filter(file => !file.startsWith('.')),
      };
    } catch {
      return {
        success: true,
        data: [],
      };
    }
  } catch (error) {
    console.error("Error listing material files:", error);
    return { success: false, error: "Failed to list files" };
  }
}

