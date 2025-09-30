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

    const { messages, packageId, files } = await req.json();
    console.log("Request data:", {
      messages: messages.length,
      packageId,
      hasFiles: !!files,
    });

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

    let systemPrompt = jsonData?.aiPdfData
      ? `You are an educational assistant. Use the following course material to answer: ${jsonData.aiPdfData}`
      : "You are an educational assistant. Only answer questions related to education, courses, and learning. If the question is outside education, politely refuse.";

    // Add sample PDF context if files are provided
    if (files && Array.isArray(files) && files.length > 0) {
      console.log("Files provided:", files.length);
      systemPrompt +=
        "\n\nYou also have access to a sample.pdf file that users may reference in their questions. When users ask about the PDF content, provide helpful analysis and insights based on the document.";
    }

    // For now, we'll just use the text content without file attachments
    // since the current OpenAI API doesn't support the input_file type
    let processedMessages = messages;
    if (files && Array.isArray(files) && files.length > 0) {
      console.log("Files provided but using text-only mode:", files.length);
      // Add a note about the file in the user message
      processedMessages = messages.map((msg: any) => {
        if (msg.role === "user") {
          return {
            ...msg,
            content: `${msg.content}\n\n[Note: This conversation includes analysis of sample.pdf file]`,
          };
        }
        return msg;
      });
    }

    console.log("Calling OpenAI API...");
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...processedMessages,
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
