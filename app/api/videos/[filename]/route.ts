import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    

    // Path to uploaded videos directory
    const videoPath = join(process.cwd(), "uploads", "videos", filename);
    
    try {
      const videoBuffer = await readFile(videoPath);
      
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

      return new NextResponse(new Uint8Array(videoBuffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Length": videoBuffer.length.toString(),
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch {
      console.error("File not found:", videoPath);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error serving video:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}