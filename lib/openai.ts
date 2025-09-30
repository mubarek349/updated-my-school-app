import { OpenAI } from 'openai';
import { chunkText, findRelevantChunks } from './textChunking';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rough token estimation (1 token ≈ 4 characters for English text)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function getAnswerFromOpenAI(question: string, context: string): Promise<string> {
  const maxTokens = 8000; // Leave room for response tokens
  const contextTokens = estimateTokens(context);
  
  let finalContext = context;
  let model = 'gpt-4';

  // If context is too large, chunk it and select relevant parts
  if (contextTokens > maxTokens) {
    const chunks = chunkText(context, 2000, 200);
    const relevantChunks = findRelevantChunks(chunks, question, 3);
    finalContext = relevantChunks.map(chunk => chunk.text).join('\n\n');
    
    // If still too large, use GPT-3.5-turbo which has higher token limits
    if (estimateTokens(finalContext) > maxTokens) {
      model = 'gpt-3.5-turbo';
      // Further reduce context if needed
      const reducedChunks = findRelevantChunks(chunks, question, 2);
      finalContext = reducedChunks.map(chunk => chunk.text).join('\n\n');
    }
  }

  const prompt = `You are a helpful assistant. Based on the following document excerpt, answer the user's question.\n\nDocument:\n${finalContext}\n\nQuestion: ${question}\nAnswer:`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000, // Limit response length
    });

    return completion.choices[0]?.message.content?.trim() || 'I apologize, but I could not generate a response.';
  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    
    // Handle rate limit errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    // Handle token limit errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'context_length_exceeded') {
      throw new Error('The document is too large to process. Please try a more specific question.');
    }
    
    throw new Error('Failed to get response from AI service. Please try again.');
  }
}