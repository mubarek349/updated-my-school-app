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
    const { questionId } = await params;

    const removedQuestion = await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        packageId: null,
      },
    });
    console.log("unpublishedChapter: ", removedQuestion);
    return NextResponse.json(removedQuestion);
  } catch (error) {
    console.log("[PACKAGE_QUESTION_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
