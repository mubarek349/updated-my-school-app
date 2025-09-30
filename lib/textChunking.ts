export interface TextChunk {
  text: string;
  startIndex: number;
  endIndex: number;
}

export function chunkText(text: string, maxChunkSize: number = 2000, overlap: number = 200): TextChunk[] {
  const chunks: TextChunk[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + maxChunkSize, text.length);
    
    // Try to break at sentence boundaries
    let actualEndIndex = endIndex;
    if (endIndex < text.length) {
      const lastSentenceEnd = text.lastIndexOf('.', endIndex);
      const lastQuestionEnd = text.lastIndexOf('?', endIndex);
      const lastExclamationEnd = text.lastIndexOf('!', endIndex);
      
      const lastBreak = Math.max(lastSentenceEnd, lastQuestionEnd, lastExclamationEnd);
      if (lastBreak > startIndex + maxChunkSize * 0.5) {
        actualEndIndex = lastBreak + 1;
      }
    }

    chunks.push({
      text: text.slice(startIndex, actualEndIndex).trim(),
      startIndex,
      endIndex: actualEndIndex
    });

    startIndex = actualEndIndex - overlap;
    if (startIndex >= text.length) break;
  }

  return chunks;
}

export function findRelevantChunks(chunks: TextChunk[], question: string, maxChunks: number = 3): TextChunk[] {
  // Simple keyword-based relevance scoring
  const questionWords = question.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  const scoredChunks = chunks.map(chunk => {
    const chunkText = chunk.text.toLowerCase();
    let score = 0;
    
    questionWords.forEach(word => {
      const matches = (chunkText.match(new RegExp(word, 'g')) || []).length;
      score += matches;
    });
    
    return { chunk, score };
  });

  // Sort by score and return top chunks
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(item => item.chunk);
}
