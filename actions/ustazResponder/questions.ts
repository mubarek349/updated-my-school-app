"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function getUstazCoursePackages() {
  try {
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return { success: false, error: "Unauthorized" };
    }

    // Get all course packages that have questions
    const coursePackages = await prisma.coursePackage.findMany({
      where: {
        questions: {
          some: {}, // Only packages that have at least one question
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: coursePackages };
  } catch (error) {
    console.error("Error fetching course packages:", error);
    return { success: false, error: "Failed to fetch course packages" };
  }
}

export async function getUstazQuestions(coursePackageId?: string) {
  try {
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return { success: false, error: "Unauthorized" };
    }

    const ustazId = parseInt(session.user.id || "0");

    // Build the where clause
    const whereClause: any = {};
    if (coursePackageId && coursePackageId !== "all") {
      whereClause.coursePackageId = coursePackageId;
    }

    const questions = await prisma.qandAQuestion.findMany({
      where: whereClause,
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

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      studentName: q.student?.name || "Unknown Student",
      courseName: q.coursePackage?.name || "Unknown Course",
      timestamp: q.timestamp,
      type: q.type,
      createdAt: q.createdAt.toISOString(),
      hasResponse: q.responses?.length > 0,
      response: q.responses?.[0]?.response || null,
      responseId: q.responses?.[0]?.id || null,
    }));

    return { success: true, data: formattedQuestions };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { success: false, error: "Failed to fetch questions" };
  }
}

export async function submitUstazResponse(questionId: string, response: string) {
  try {
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return { success: false, error: "Unauthorized" };
    }

    const ustazId = parseInt(session.user.id || "0");

    // Validate input
    if (!questionId || !response?.trim()) {
      return { success: false, error: "Question ID and response are required" };
    }

    // Validate questionId is a valid string (since it's a CUID)
    if (typeof questionId !== 'string' || questionId.trim().length === 0) {
      return { success: false, error: "Invalid question ID format" };
    }

    // Verify question exists
    const question = await prisma.qandAQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Create the response
    const qandAResponse = await prisma.qandAResponse.create({
      data: {
        response: response.trim(),
        videoQuestionId: questionId,
        ustazId: ustazId,
      },
      include: {
        ustaz: {
          select: {
            ustazname: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Response submitted successfully",
      data: qandAResponse,
    };
  } catch (error) {
    console.error("Error submitting response:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateUstazResponse(responseId: string, response: string) {
  try {
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return { success: false, error: "Unauthorized" };
    }

    const ustazId = parseInt(session.user.id || "0");

    // Validate input
    if (!responseId || !response?.trim()) {
      return { success: false, error: "Response ID and response are required" };
    }

    // Verify response exists and belongs to this ustaz
    const existingResponse = await prisma.qandAResponse.findFirst({
      where: {
        id: responseId,
        ustazId: ustazId,
      },
    });

    if (!existingResponse) {
      return { success: false, error: "Response not found or unauthorized" };
    }

    // Update the response
    const updatedResponse = await prisma.qandAResponse.update({
      where: { id: responseId },
      data: {
        response: response.trim(),
      },
      include: {
        ustaz: {
          select: {
            ustazname: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Response updated successfully",
      data: updatedResponse,
    };
  } catch (error) {
    console.error("Error updating response:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteUstazResponse(responseId: string) {
  try {
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return { success: false, error: "Unauthorized" };
    }

    const ustazId = parseInt(session.user.id || "0");

    // Validate input
    if (!responseId) {
      return { success: false, error: "Response ID is required" };
    }

    // Verify response exists and belongs to this ustaz
    const existingResponse = await prisma.qandAResponse.findFirst({
      where: {
        id: responseId,
        ustazId: ustazId,
      },
    });

    if (!existingResponse) {
      return { success: false, error: "Response not found or unauthorized" };
    }

    // Delete the response
    await prisma.qandAResponse.delete({
      where: { id: responseId },
    });

    return {
      success: true,
      message: "Response deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting response:", error);
    return { success: false, error: "Internal server error" };
  }
}
