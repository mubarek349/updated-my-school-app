"use server";

import { readFile, stat } from "fs/promises";
import { join } from "path";

export interface VideoFileInfo {
  filename: string;
  contentType: string;
  size: number;
  lastModified: Date;
  exists: boolean;
}

export interface VideoFileData {
  filename: string;
  contentType: string;
  data: string; // base64 encoded
  size: number;
}

// Get video file information
export async function getVideoFileInfo(filename: string): Promise<{
  success: boolean;
  data?: VideoFileInfo;
  error?: string;
}> {
  try {
    if (!filename) {
      return { success: false, error: "Filename is required" };
    }

    const videoPath = join(process.cwd(), "uploads", "videos", filename);
    
    try {
      const stats = await stat(videoPath);
      
      // Determine content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = "video/mp4";
      
      switch (ext) {
        case "mp4":
          contentType = "video/mp4";
          break;
        case "avi":
          contentType = "video/x-msvideo";
          break;
        case "mov":
          contentType = "video/quicktime";
          break;
        case "webm":
          contentType = "video/webm";
          break;
        case "mkv":
          contentType = "video/x-matroska";
          break;
        case "flv":
          contentType = "video/x-flv";
          break;
        default:
          contentType = "video/mp4";
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
          contentType: "video/mp4",
          size: 0,
          lastModified: new Date(),
          exists: false,
        },
      };
    }
  } catch (error) {
    console.error("Error getting video file info:", error);
    return { success: false, error: "Failed to get file information" };
  }
}

// Get video file data (for small files only - not recommended for videos)
export async function getVideoFileData(filename: string): Promise<{
  success: boolean;
  data?: VideoFileData;
  error?: string;
}> {
  try {
    if (!filename) {
      return { success: false, error: "Filename is required" };
    }

    const videoPath = join(process.cwd(), "uploads", "videos", filename);
    
    try {
      const fileBuffer = await readFile(videoPath);
      
      // Only allow small video files (< 5MB) to be loaded into memory
      if (fileBuffer.length > 5 * 1024 * 1024) {
        return { success: false, error: "Video file too large for direct loading" };
      }
      
      // Determine content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = "video/mp4";
      
      switch (ext) {
        case "mp4":
          contentType = "video/mp4";
          break;
        case "avi":
          contentType = "video/x-msvideo";
          break;
        case "mov":
          contentType = "video/quicktime";
          break;
        case "webm":
          contentType = "video/webm";
          break;
        case "mkv":
          contentType = "video/x-matroska";
          break;
        case "flv":
          contentType = "video/x-flv";
          break;
        default:
          contentType = "video/mp4";
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
      return { success: false, error: "Video file not found" };
    }
  } catch (error) {
    console.error("Error getting video file data:", error);
    return { success: false, error: "Failed to get video data" };
  }
}

// List all video files
export async function listVideoFiles(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const { readdir } = await import("fs/promises");
    const videoDir = join(process.cwd(), "uploads", "videos");
    
    try {
      const files = await readdir(videoDir);
      const videoExtensions = ['.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv'];
      return {
        success: true,
        data: files.filter(file => 
          videoExtensions.some(ext => file.toLowerCase().endsWith(ext)) && 
          !file.startsWith('.')
        ),
      };
    } catch {
      return {
        success: true,
        data: [],
      };
    }
  } catch (error) {
    console.error("Error listing video files:", error);
    return { success: false, error: "Failed to list video files" };
  }
}

// Get video streaming URL (for large files)
export async function getVideoStreamUrl(filename: string): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    if (!filename) {
      return { success: false, error: "Filename is required" };
    }

    // For now, return the API route URL
    // In a real implementation, you might want to generate signed URLs
    const url = `/api/videos/${encodeURIComponent(filename)}`;
    
    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("Error getting video stream URL:", error);
    return { success: false, error: "Failed to get video URL" };
  }
}

