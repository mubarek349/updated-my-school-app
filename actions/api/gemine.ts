/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface GeminiResult {
  success: boolean;
  reply?: { role: string; content: string };
  error?: string;
}

export async function generateGeminiResponse(
  messages: any[],
  packageId: string
): Promise<GeminiResult> {
  try {
    const jsonData = await prisma.coursePackage.findUnique({
      where: { id: packageId },
      select: { aiPdfData: true },
    });

    const systemPrompt = jsonData?.aiPdfData
      ? `You are an educational assistant. Use the following course material to answer: ${jsonData.aiPdfData}`
      : "You are an educational assistant. Only answer questions related to education, courses, and learning. If the question is outside education, politely refuse.";

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert messages to Gemini format
    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Add system prompt to the last user message
    const lastMessage = messages[messages.length - 1];
    const promptWithSystem = `${systemPrompt}\n\nUser: ${lastMessage.content}`;

    const result = await chat.sendMessage(promptWithSystem);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      reply: { role: "assistant", content: text },
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return { success: false, error: error.message };
  }
}
