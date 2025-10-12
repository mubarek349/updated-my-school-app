// Simple in-memory vector storage to replace ChromaDB
interface DocumentChunk {
  id: string
  text: string
  embedding: number[]
  metadata: { source: string }
}

class SimpleVectorStore {
  private chunks: DocumentChunk[] = []

  async addChunks(chunks: string[], embeddings: number[][]) {
    const newChunks: DocumentChunk[] = chunks.map((chunk, i) => ({
      id: `chunk-${Date.now()}-${i}`,
      text: chunk,
      embedding: embeddings[i],
      metadata: { source: 'course' }
    }))
    
    this.chunks.push(...newChunks)
  }

  async querySimilar(queryEmbedding: number[], limit: number = 5): Promise<string[]> {
    if (this.chunks.length === 0) return []

    // Simple cosine similarity calculation
    const similarities = this.chunks.map(chunk => ({
      chunk,
      similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding)
    }))

    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.chunk.text)
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

const vectorStore = new SimpleVectorStore()

export async function saveChunks(chunks: string[], embeddings: number[][]) {
  await vectorStore.addChunks(chunks, embeddings)
}

export async function queryRelevantChunks(queryEmbedding: number[]) {
  return await vectorStore.querySimilar(queryEmbedding, 5)
}
