"use server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

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
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      data: questions,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to retrieve questions.",
    };
  }
}
