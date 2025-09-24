import { NextResponse } from "next/server";
import { getCurrentUstaz } from "@/actions/ustazResponder/authentication";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Check if ustaz is authenticated
    const ustazResult = await getCurrentUstaz();
    
    if (!ustazResult.success) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all Q&A questions with related data
    const questions = await prisma.qandAQuestion.findMany({
      include: {
        student: {
          select: {
            name: true,
          },
        },
        coursePackage: {
          select: {
            name: true,
          },
        },
        responses: {
          include: {
            ustaz: {
              select: {
                ustazname: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedQuestions = questions.map((question) => ({
      id: question.id,
      question: question.question,
      studentName: question.student?.name || "Unknown Student",
      courseName: question.coursePackage?.name || "Unknown Course",
      chapterName: `${question.type} - ${question.timestamp ? `${question.timestamp}s` : 'General'}`,
      createdAt: question.createdAt.toISOString(),
      hasResponse: question.responses.length > 0,
      responses: question.responses.map((response: any) => ({
        id: response.id,
        response: response.response,
        ustazName: response.ustaz?.ustazname || "Unknown Ustaz",
        createdAt: response.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json(transformedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}