/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/db";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    console.log("ChatGPT API called");

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const { messages, packageId } = await req.json();
    console.log("Request data:", { messages: messages.length, packageId });

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    const jsonData = await prisma.coursePackage.findUnique({
      where: { id: packageId },
      select: { aiPdfData: true },
    });

    const systemPrompt = jsonData?.aiPdfData
      ? `You are an educational assistant. Use the following course material to answer: ${jsonData.aiPdfData}`
      : "You are an educational assistant. Only answer questions related to education, courses, and learning. If the question is outside education, politely refuse.";

    console.log("Calling OpenAI API...");
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

    console.log("OpenAI response received");
    return NextResponse.json({
      reply: completion.choices[0].message,
    });
  } catch (error: any) {
    console.error("ChatGPT API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Unknown error occurred",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
