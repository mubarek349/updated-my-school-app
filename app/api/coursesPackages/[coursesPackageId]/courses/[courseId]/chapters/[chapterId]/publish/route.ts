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
    }>;
  }
) {
  try {
    const { chapterId } = await params;

    // const userId = "clg1v2j4f0000l5v8xq3z7h4d"; // Replace with actual userId from context
    
    

    
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });
    if (!chapter || !chapter.title || !chapter.videoUrl) {
      return new NextResponse("Chapter not found or missing title", {
        status: 404,
      });
    }
    const publishedChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        isPublished: true,
      },
    });
    console.log("publishedChapter: ", publishedChapter);
    return NextResponse.json(publishedChapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
