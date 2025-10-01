"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import prisma from "@/lib/db";

export interface UstazQuestion {
  id: number;
  question: string;
  studentName: string;
  courseName: string;
  timestamp: Date;
  type: string;
  createdAt: string;
  hasResponse: boolean;
  response: string | null;
  responseId: number | null;
}

// Get ustaz questions
export async function getUstazQuestions(): Promise<{
  success: boolean;
  data?: UstazQuestion[];
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return { success: false, error: "Unauthorized" };
    }

    const ustazId = parseInt(session.user.id || "0");

    const questions = await prisma.qandAQuestion.findMany({
      include: {
        student: true,
        coursePackage: true,
        responses: {
          where: { ustazId },
          select: {
            id: true,
            response: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedQuestions : UstazQuestion[] = questions.map((q) => ({
      id: parseInt(q.id),
      question: q.question,
      studentName: q.student?.name || "Unknown Student",
      courseName: q.coursePackage?.name || "Unknown Course",
      timestamp: q.timestamp ? new Date(q.timestamp) : new Date(),
      type: q.type,
      createdAt: q.createdAt.toISOString(),
      hasResponse: q.responses?.length > 0,
      response: q.responses?.[0]?.response || null,
      responseId: q.responses?.[0]?.id ? parseInt(q.responses?.[0]?.id) : null,
    }));

    return {
      success: true,
      data: formattedQuestions,
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { 
      success: false, 
      error: "Failed to fetch questions" 
    };
  }
}

// Respond to a question
export async function respondToQuestion(
  questionId: number,
  response: string
): Promise<{
  success: boolean;
  data?: { id: number; response: string; createdAt: string };
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return { success: false, error: "Unauthorized" };
    }

    if (!response?.trim()) {
      return { success: false, error: "Response is required" };
    }

    const ustazId = parseInt(session.user.id || "0");

    // Check if question exists
    const question = await prisma.qandAQuestion.findUnique({
      where: { id: questionId.toString() },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Create or update response
    const existingResponse = await prisma.qandAResponse.findFirst({
      where: { videoQuestionId: questionId.toString(), ustazId },
    });

    let responseData;
    if (existingResponse) {
      responseData = await prisma.qandAResponse.update({
        where: { id: existingResponse.id },
        data: { response: response.trim() },
      });
    } else {
      responseData = await prisma.qandAResponse.create({
        data: {
          videoQuestionId: questionId.toString(),
          ustazId,
          response: response.trim(),
        },
      });
    }

    return {
      success: true,
      data: {
        id: parseInt(responseData.id),
        response: responseData.response,
        createdAt: responseData.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error responding to question:", error);
    return { 
      success: false, 
      error: "Failed to respond to question" 
    };
  }
}

// Delete a response
export async function deleteResponse(responseId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return { success: false, error: "Unauthorized" };
    }

    const ustazId = parseInt(session.user.id || "0");

    // Check if response belongs to this ustaz
    const response = await prisma.qandAResponse.findFirst({
      where: { id: responseId.toString(), ustazId },
    });

    if (!response) {
      return { success: false, error: "Response not found or unauthorized" };
    }

    await prisma.qandAResponse.delete({
      where: { id: responseId.toString() },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting response:", error);
    return { 
      success: false, 
      error: "Failed to delete response" 
    };
  }
}

