/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { createReadStream } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Path to uploaded videos directory
    const videoPath = join(process.cwd(), "uploads", "videos", filename);
    
    try {
      // Check if file exists and get stats
      const stats = await stat(videoPath);
      const fileSize = stats.size;
      
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
        default:
          contentType = "video/mp4";
      }

      // Check for range request header
      const range = request.headers.get('range');
      
      if (range) {
        // Parse range header
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        
        // Ensure end doesn't exceed file size
        const endPos = Math.min(end, fileSize - 1);
        const chunkSize = (endPos - start) + 1;
        
        // Create read stream for the requested range
        const stream = createReadStream(videoPath, { start, end: endPos });
        
        // Create response with range headers
        const headers = {
          "Content-Range": `bytes ${start}-${endPos}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        };
        
        return new NextResponse(stream as any, {
          status: 206,
          headers,
        });
      } else {
        // No range request - serve entire file
        const videoBuffer = await readFile(videoPath);
        
        return new NextResponse(new Uint8Array(videoBuffer), {
          headers: {
            "Content-Type": contentType,
            "Content-Length": videoBuffer.length.toString(),
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000",
          },
        });
      }
    } catch (error) {
      console.error("File not found:", videoPath, error);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error serving video:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}