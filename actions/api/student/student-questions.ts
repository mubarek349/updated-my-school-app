"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";

export interface StudentQuestion {
  id: number;
  question: string;
  courseName: string;
  timestamp: Date;
  type: string;
  createdAt: string;
  student: {
    firstName: string;
    fatherName: string;
  };
  responses: {
    id: number;
    response: string;
    ustazName: string;
    createdAt: string;
  }[];
}

// Get student questions
export async function getStudentQuestions(): Promise<{
  success: boolean;
  data?: StudentQuestion[];
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const studentId = parseInt(session.user.id);

    const questions = await prisma.qandAQuestion.findMany({
      where: { studentId },
      include: {
        student: true,
        coursePackage: true,
        responses: {
          include: {
            ustaz: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedQuestions: StudentQuestion[] = questions.map((q) => ({
      id: parseInt(q.id),
      question: q.question,
      courseName: q.coursePackage?.name || "Unknown Course",
      timestamp: q.timestamp ? new Date(q.timestamp) : new Date(),
      type: q.type,
      createdAt: q.createdAt.toISOString(),
      student: {
        firstName: q.student?.name?.split(' ')[0] || 'Student',
        fatherName: q.student?.name?.split(' ')[1] || '',
      },
      responses:
        q.responses?.map((r) => ({
          id: parseInt(r.id),
          response: r.response,
          ustazName: r.ustaz?.ustazname || "Unknown Ustaz",
          createdAt: r.createdAt.toISOString(),
        })) || [],
    }));

    return {
      success: true,
      data: formattedQuestions,
    };
  } catch (error) {
    console.error("Error fetching student questions:", error);
    return { 
      success: false, 
      error: "Failed to fetch questions" 
    };
  }
}

// Get single student question
export async function getStudentQuestion(questionId: number): Promise<{
  success: boolean;
  data?: StudentQuestion;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const studentId = parseInt(session.user.id);

    const question = await prisma.qandAQuestion.findFirst({
      where: { 
        id: questionId.toString(),
        studentId 
      },
      include: {
        student: true,
        coursePackage: true,
        responses: {
          include: {
            ustaz: true,
          },
        },
      },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    const formattedQuestion: StudentQuestion = {
      id: parseInt(question.id),
      question: question.question,
      courseName: question.coursePackage?.name || "Unknown Course",
      timestamp: question.timestamp ? new Date(question.timestamp) : new Date(),
      type: question.type,
      createdAt: question.createdAt.toISOString(),
      student: {
        firstName: question.student?.name?.split(' ')[0] || 'Student',
        fatherName: question.student?.name?.split(' ')[1] || '',
      },
      responses:
        question.responses?.map((r) => ({
          id: parseInt(r.id),
          response: r.response,
          ustazName: r.ustaz?.ustazname || "Unknown Ustaz",
          createdAt: r.createdAt.toISOString(),
        })) || [],
    };

    return {
      success: true,
      data: formattedQuestion,
    };
  } catch (error) {
    console.error("Error fetching student question:", error);
    return { 
      success: false, 
      error: "Failed to fetch question" 
    };
  }
}
