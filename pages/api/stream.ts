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
  const videoPath = path.resolve("./fuad/course", safeFile);

  if (!fs.existsSync(videoPath)) {
    res.status(404).send("File not found");
    return;
  }

  const videoSize = fs.statSync(videoPath).size;
  const range = req.headers.range;

  if (!range) {
    res.status(400).send("Requires Range header");
    return;
  }

  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
}
