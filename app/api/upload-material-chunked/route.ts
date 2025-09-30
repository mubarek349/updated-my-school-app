import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 1000MB max file size

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get("chunk") as File;
    const filename = formData.get("filename") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const fileId = formData.get("fileId") as string; // Unique ID for the entire file

    if (!chunk || !filename || isNaN(chunkIndex) || isNaN(totalChunks) || !fileId) {
      return NextResponse.json({ error: "Missing or invalid chunk data" }, { status: 400 });
    }

    // Create a temporary directory for chunks using the fileId
    const tempChunkDir = join(process.cwd(), "tmp", "materials-chunks", fileId);
    await mkdir(tempChunkDir, { recursive: true });

    const chunkPath = join(tempChunkDir, `chunk_${chunkIndex}`);
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(chunkPath, chunkBuffer);

    // If this is the last chunk, combine them
    if (chunkIndex === totalChunks - 1) {
      const finalFileDir = join(process.cwd(), "uploads", "materials");
      await mkdir(finalFileDir, { recursive: true }); // Ensure target directory exists

      const finalFilePath = join(finalFileDir, filename);
      const writeStream = (await import("fs")).createWriteStream(finalFilePath);

      for (let i = 0; i < totalChunks; i++) {
        const currentChunkPath = join(tempChunkDir, `chunk_${i}`);
        const chunkData = await readFile(currentChunkPath);
        writeStream.write(chunkData);
      }
      writeStream.end();

      await new Promise<void>((resolve, reject) => {
        writeStream.on("finish", async () => {
          // Clean up temporary chunks
          await (await import("fs/promises")).rm(tempChunkDir, { recursive: true, force: true });
          resolve();
        });
        writeStream.on("error", reject);
      });

      return NextResponse.json({ success: true, message: "File uploaded and combined successfully", filename });
    }

    return NextResponse.json({ success: true, message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded` });
  } catch (error) {
    console.error("Chunked material upload error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload chunk" }, { status: 500 });
  }
}
