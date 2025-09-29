import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    console.log("Gemini API called");

    // Check if Google API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.error("Google API key not found");
      return NextResponse.json(
        { error: "Google API key not configured" },
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

    // Get the generative model
    console.log("Initializing Gemini model...");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Build the conversation context
    let conversationContext = systemPrompt + "\n\n";

    // Add conversation history
    messages.forEach((msg: any) => {
      if (msg.role === "user") {
        conversationContext += `User: ${msg.content}\n`;
      } else if (msg.role === "assistant") {
        conversationContext += `Assistant: ${msg.content}\n`;
      }
    });

    console.log("Sending message to Gemini...");
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response received");
    return NextResponse.json({
      reply: { role: "assistant", content: text },
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Unknown error occurred",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
