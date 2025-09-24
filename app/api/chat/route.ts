import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4", // or "gpt-4o"
      messages: [
        {
          role: "system",
          content:
            "You are an educational assistant. Only answer questions related to education, courses, and learning. If the question is outside education, politely refuse.",
        },
        ...messages,
      ],
    });

    return NextResponse.json({
      reply: completion.choices[0].message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
