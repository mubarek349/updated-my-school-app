/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import OpenAI from "openai";
import prisma from "@/lib/db";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  success: boolean;
  reply?: ChatMessage;
  error?: string;
}

// Send message to ChatGPT
export async function sendChatMessage(
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

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
    });

    return {
      success: true,
      reply: completion.choices[0].message as ChatMessage,
    };
  } catch (error: any) {
    console.error("ChatGPT API error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to get response from ChatGPT" 
    };
  }
}

// Get AI PDF data for a package
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

