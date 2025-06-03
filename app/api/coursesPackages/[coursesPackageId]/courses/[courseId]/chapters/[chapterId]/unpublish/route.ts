import prisma from "@/lib/db";

import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
     params: Promise<{ coursesPackageId: string; courseId: string; chapterId: string }>;
  }
) {
  try {
    const { coursesPackageId } = await params; 
    // const { courseId } = await params; 
    const { chapterId } = await params; 
    
    // const userId = "clg1v2j4f0000l5v8xq3z7h4d"; // Replace with actual userId from context
    

    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    
    const unpublishedChapter = await prisma.chapter.update({
      where: {
        id: chapterId
      },
      data: {
        isPublished: false,
      },
    });
    console.log("unpublishedChapter: ", unpublishedChapter);
    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
