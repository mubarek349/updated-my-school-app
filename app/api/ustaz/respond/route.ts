import { NextRequest, NextResponse } from "next/server";
import { getCurrentUstaz } from "@/actions/ustazResponder/authentication";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Check if ustaz is authenticated
    const ustazResult = await getCurrentUstaz();
    
    if (!ustazResult.success) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const ustaz = ustazResult.data;
    const body = await request.json();
    const { questionId, response } = body;

    // Validate input
    if (!questionId || !response?.trim()) {
      return NextResponse.json(
        { message: "Question ID and response are required" },
        { status: 400 }
      );
    }

    // Verify question exists
    const question = await prisma.qandAQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    // Create the response
    const qandAResponse = await prisma.qandAResponse.create({
      data: {
        response: response.trim(),
        videoQuestionId: questionId,
        ustazId: ustaz.id,
      },
      include: {
        ustaz: {
          select: {
            ustazname: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Response submitted successfully",
      response: qandAResponse,
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
