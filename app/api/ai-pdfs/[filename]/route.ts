import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.filename;
    const filePath = join(process.cwd(), "docs", "ai-pdfs", filename);

    const fileBuffer = await readFile(filePath);

    return new NextResponse(Buffer.from(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error serving AI PDF:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}
