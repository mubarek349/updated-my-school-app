// Simple in-memory cache for PDF text
let pdfTextCache: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedPdfText(): string | null {
  if (pdfTextCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return pdfTextCache;
  }
  return null;
}

export function setCachedPdfText(text: string): void {
  pdfTextCache = text;
  cacheTimestamp = Date.now();
}

export function clearPdfCache(): void {
  pdfTextCache = null;
  cacheTimestamp = 0;
}
