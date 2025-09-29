"use server";
import prisma from "@/lib/db";

export async function submitVideoQuestion(
  wdt_ID: number,
  packageId: string,
  question: string
) {
  await prisma.qandAQuestion.create({
    data: {
      studentId: wdt_ID,
      coursepackageId: packageId,
      question: question,
    },
  });
  return {
    success: true,
    message: "Your question has been submitted successfully.",
  };
}

export async function getVideoQuestions(packageId: string) {
  try {
    const questions = await prisma.qandAQuestion.findMany({
      where: { coursepackageId: packageId },
      include: {
        responses: {
          select: {
            response: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      data: questions,
    };
  } catch {
    return {
      success: false,
      message: "Failed to retrieve questions.",
    };
  }
}
