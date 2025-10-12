// Simple text-based embedding using hash-like approach
function simpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/)
  const embedding = new Array(384).fill(0)
  
  words.forEach(word => {
    let hash = 0
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff
    }
    const index = Math.abs(hash) % 384
    embedding[index] += 1
  })
  
  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => norm > 0 ? val / norm : 0)
}

export async function embedChunks(chunks: string[]) {
  return chunks.map(chunk => simpleEmbedding(chunk))
}

export async function embedQuery(query: string) {
  return simpleEmbedding(query)
}