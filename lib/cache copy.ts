import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'

// Cache configuration
const CACHE_DIR = join(process.cwd(), 'cache')
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface CacheEntry<T> {
  data: T
  timestamp: number
  hash: string
}

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await mkdir(CACHE_DIR, { recursive: true })
  } catch {
    // Directory might already exist
  }
}

// Generate cache key from content
function generateCacheKey(content: string): string {
  return createHash('md5').update(content).digest('hex')
}

// Check if cache entry is valid
function isCacheValid(entry: CacheEntry<unknown>): boolean {
  return Date.now() - entry.timestamp < CACHE_EXPIRY
}

// Get cached data
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    await ensureCacheDir()
    const cacheFile = join(CACHE_DIR, `${key}.json`)
    const cacheContent = await readFile(cacheFile, 'utf-8')
    const entry: CacheEntry<T> = JSON.parse(cacheContent)
    
    if (isCacheValid(entry)) {
      return entry.data
    }
    
    // Cache expired, delete the file
    try {
      await import('fs').then(fs => fs.promises.unlink(cacheFile))
    } catch {
      // File might not exist
    }
    
    return null
  } catch {
    return null
  }
}

// Set cached data
export async function setCachedData<T>(key: string, data: T, contentHash?: string): Promise<void> {
  try {
    await ensureCacheDir()
    const cacheFile = join(CACHE_DIR, `${key}.json`)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hash: contentHash || generateCacheKey(JSON.stringify(data))
    }
    
    await writeFile(cacheFile, JSON.stringify(entry, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to cache data:', error)
  }
}

// Cache for embeddings
export async function getCachedEmbeddings(content: string): Promise<number[][] | null> {
  const key = `embeddings_${generateCacheKey(content)}`
  return await getCachedData<number[][]>(key)
}

export async function setCachedEmbeddings(content: string, embeddings: number[][]): Promise<void> {
  const key = `embeddings_${generateCacheKey(content)}`
  await setCachedData(key, embeddings, generateCacheKey(content))
}

// Cache for AI responses
export async function getCachedResponse(question: string, contentHash: string, aiProvider: string): Promise<string | null> {
  const key = `response_${generateCacheKey(question + contentHash + aiProvider)}`
  return await getCachedData<string>(key)
}

export async function setCachedResponse(question: string, contentHash: string, aiProvider: string, response: string): Promise<void> {
  const key = `response_${generateCacheKey(question + contentHash + aiProvider)}`
  await setCachedData(key, response, generateCacheKey(question + contentHash + aiProvider))
}

// Cache for processed content
export async function getCachedContent(fileHash: string): Promise<string | null> {
  const key = `content_${fileHash}`
  return await getCachedData<string>(key)
}

export async function setCachedContent(fileHash: string, content: string): Promise<void> {
  const key = `content_${fileHash}`
  await setCachedData(key, content, generateCacheKey(content))
}
