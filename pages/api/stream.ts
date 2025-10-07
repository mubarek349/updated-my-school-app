import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { file } = req.query;

  if (!file || typeof file !== "string") {
    res.status(400).send("Missing or invalid file parameter");
    return;
  }

  const safeFile = path.basename(file);
  const videoPath = path.resolve("./uploads/videos", safeFile);

  if (!fs.existsSync(videoPath)) {
    res.status(404).send("File not found");
    return;
  }

  const videoSize = fs.statSync(videoPath).size;
  const range = req.headers.range;

  // Add CORS headers for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!range) {
    // If no range header, send the entire file
    const headers = {
      "Content-Length": videoSize,
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000",
    };
    res.writeHead(200, headers);
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);
    return;
  }

  const CHUNK_SIZE = 10 ** 6; // 1MB chunks
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Ensure end doesn't exceed file size
  const finalEnd = Math.min(end, videoSize - 1);
  const contentLength = finalEnd - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${finalEnd}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
    "Cache-Control": "public, max-age=31536000",
  };

  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end: finalEnd });
  videoStream.pipe(res);
}
