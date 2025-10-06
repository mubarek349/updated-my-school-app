/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import OpenAI from "openai";
import prisma from "@/lib/db";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ChatGPTResult {
  success: boolean;
  reply?: any;
  error?: string;
}

export async function generateChatGPTResponse(
  messages: any[],
  packageId: string
): Promise<ChatGPTResult> {
  try {
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
      reply: completion.choices[0].message,
    };
  } catch (error: any) {
    console.error("ChatGPT API error:", error);
    return { success: false, error: error.message };
  }
}
