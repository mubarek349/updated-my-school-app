/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";

interface QuestionResult {
  success: boolean;
  questions?: any[];
  question?: any;
  error?: string;
}

export async function getStudentQuestions(): Promise<QuestionResult> {
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

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      courseName: q.coursePackage?.name || "Unknown Course",
      timestamp: q.timestamp,
      type: q.type,
      createdAt: q.createdAt.toISOString(),
      student: {
        firstName: q.student?.name?.split(' ')[0] || 'Student',
        fatherName: q.student?.name?.split(' ')[1] || '',
      },
      responses:
        q.responses?.map((r) => ({
          id: r.id,
          response: r.response,
          ustazName: r.ustaz?.ustazname || "Unknown Ustaz",
          createdAt: r.createdAt.toISOString(),
        })) || [],
    }));

    return { success: true, questions: formattedQuestions };
  } catch (error) {
    console.error("Error fetching student questions:", error);
    return { success: false, error: "Failed to fetch questions" };
  }
}

export async function updateStudentQuestion(
  questionId: string,
  question: string
): Promise<QuestionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const studentId = parseInt(session.user.id);

    if (!question?.trim()) {
      return { success: false, error: "Question is required" };
    }

    const updatedQuestion = await prisma.qandAQuestion.update({
      where: {
        id: questionId,
        studentId,
      },
      data: { question: question.trim() },
    });

    return { success: true, question: updatedQuestion };
  } catch (error) {
    console.error("Error updating question:", error);
    return { success: false, error: "Failed to update question" };
  }
}

export async function deleteStudentQuestion(questionId: string): Promise<QuestionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const studentId = parseInt(session.user.id);

    await prisma.qandAQuestion.delete({
      where: {
        id: questionId,
        studentId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting question:", error);
    return { success: false, error: "Failed to delete question" };
  }
}
