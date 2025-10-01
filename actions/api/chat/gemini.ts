/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  success: boolean;
  reply?: ChatMessage;
  error?: string;
}

// Send message to Gemini
export async function sendGeminiMessage(
  messages: ChatMessage[],
  packageId: string
): Promise<ChatResponse> {
  try {
    if (!messages || messages.length === 0) {
      return { success: false, error: "Messages are required" };
    }

    if (!packageId) {
      return { success: false, error: "Package ID is required" };
    }

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
    return { 
      success: false, 
      error: error.message || "Failed to get response from Gemini" 
    };
  }
}

// Get AI PDF data for a package (shared with ChatGPT)
export async function getAiPdfDataForPackage(packageId: string): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    if (!packageId) {
      return { success: false, error: "Package ID is required" };
    }

    const jsonData = await prisma.coursePackage.findUnique({
      where: { id: packageId },
      select: { aiPdfData: true },
    });

    return {
      success: true,
      data: jsonData?.aiPdfData || undefined,
    };
  } catch (error: any) {
    console.error("Error getting AI PDF data:", error);
    return { 
      success: false, 
      error: error.message || "Failed to get AI PDF data" 
    };
  }
}

