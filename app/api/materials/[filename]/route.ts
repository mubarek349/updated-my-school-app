import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const materialPath = join(process.cwd(), "uploads", "materials", filename);
    
    try {
      const fileBuffer = await readFile(materialPath);
      
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
        default:
          contentType = "application/octet-stream";
      }

      // Check if download is requested
      const url = new URL(request.url);
      const isDownload = url.searchParams.get('download') === 'true';
      
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Length": fileBuffer.length.toString(),
          "Content-Disposition": isDownload 
            ? `attachment; filename="${filename}"` 
            : `inline; filename="${filename}"`,
          "Cache-Control": "public, max-age=31536000",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error serving material:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}