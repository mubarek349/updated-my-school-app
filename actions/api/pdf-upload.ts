"use server";

import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

interface UploadResult {
  success: boolean;
  message?: string;
  filename?: string;
  error?: string;
}

export async function uploadPdfChunk(formData: FormData): Promise<UploadResult> {
  try {
    const chunk = formData.get("chunk") as File;
    const filename = formData.get("filename") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const fileId = formData.get("fileId") as string; // Unique ID for the entire file

    if (!chunk || !filename || isNaN(chunkIndex) || isNaN(totalChunks) || !fileId) {
      return { success: false, error: "Missing or invalid chunk data" };
    }

    // Create a temporary directory for chunks using the fileId
    const tempChunkDir = join(process.cwd(), "tmp", "chunks", fileId);
    await mkdir(tempChunkDir, { recursive: true });

    const chunkPath = join(tempChunkDir, `chunk_${chunkIndex}`);
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(chunkPath, chunkBuffer);

    // If this is the last chunk, combine them
    if (chunkIndex === totalChunks - 1) {
      const finalFilePath = join(process.cwd(), "docs", "ai-pdfs", filename);
      const finalFileDir = join(process.cwd(), "docs", "ai-pdfs");
      await mkdir(finalFileDir, { recursive: true }); // Ensure target directory exists

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

      return { success: true, message: "File uploaded and combined successfully", filename };
    }

    return { success: true, message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded` };
  } catch (error) {
    console.error("Chunked PDF upload error:", error);
    return { success: false, error: "Failed to upload chunk" };
  }
}
