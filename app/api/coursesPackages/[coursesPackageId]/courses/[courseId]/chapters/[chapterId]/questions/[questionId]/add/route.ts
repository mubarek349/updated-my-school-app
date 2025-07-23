import prisma from "@/lib/db";

import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      coursesPackageId: string;
      courseId: string;
      chapterId: string;
      questionId: string;
    }>;
  }
) {
  try {
    const { questionId, coursesPackageId } = await params;
    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });
    if (!question || !question.question) {
      return new NextResponse("question not found or missing title", {
        status: 404,
      });
    }
    const addedQuestion = await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        packageId: coursesPackageId,
        studentQuiz: {
          deleteMany: {
            questionId: questionId, // Delete all StudentQuiz records where questionId matches
          },
        },
      },
    });
    console.log("question added to the package: ", addedQuestion);
    return NextResponse.json(addedQuestion);
  } catch (error) {
    console.log("[PACKAGE_QUESTION_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
