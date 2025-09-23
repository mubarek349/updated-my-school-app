import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "fuad");
const COURSE_DIR = path.join(UPLOAD_DIR, "course");

function getTimestampUUID(ext: string) {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const chunk = formData.get("chunk") as File;
    const filename = formData.get("filename") as string;
    const chunkIndex = formData.get("chunkIndex") as string;
    const totalChunks = formData.get("totalChunks") as string;

    if (!chunk) {
      return NextResponse.json(
        { error: "Chunk file missing" },
        { status: 400 }
      );
    }

    let finalFilename = filename;
    if (!finalFilename || finalFilename === "") {
      const ext = chunk.name.split('.').pop() || "mp4";
      finalFilename = getTimestampUUID(ext);
    }

    const chunkFolder = path.join(
      COURSE_DIR,
      finalFilename.replace(/\.[^/.]+$/, "") + "_chunks"
    );
    
    if (!fs.existsSync(chunkFolder)) {
      fs.mkdirSync(chunkFolder, { recursive: true });
    }

    const chunkPath = path.join(chunkFolder, `chunk_${chunkIndex}`);
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    fs.writeFileSync(chunkPath, chunkBuffer);

    if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
      const baseName = finalFilename.replace(/\.[^/.]+$/, "");
      const videoPath = path.join(COURSE_DIR, `${baseName}.mp4`);
      
      try {
        const chunks = [];
        for (let i = 0; i < parseInt(totalChunks); i++) {
          const chunkFilePath = path.join(chunkFolder, `chunk_${i}`);
          if (fs.existsSync(chunkFilePath)) {
            chunks.push(fs.readFileSync(chunkFilePath));
          }
        }
        
        const finalBuffer = Buffer.concat(chunks);
        fs.writeFileSync(videoPath, finalBuffer);
        fs.rmSync(chunkFolder, { recursive: true, force: true });
        
        return NextResponse.json({ success: true, filename: `${baseName}.mp4` });
      } catch (err) {
        console.error("Error joining chunks:", err);
        return NextResponse.json(
          { error: "Error joining chunks" },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ success: true, filename: finalFilename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
