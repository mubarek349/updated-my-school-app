import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ coursesPackageId: string; courseId: string }>;
  }
) {
  //   context: { params: { userId: string } }
  try {
    const { coursesPackageId } = await params;
    const { courseId } = await params;
    // const userId = "clg1v2j4f0000l5v8xq3z7h4d"; // Replace with actual userId from context

    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
        // userId: userId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        packageId: coursesPackageId,
      },
    });

    if (!course || !course.title) {
      return new NextResponse("Chapter not found or missing title", {
        status: 404,
      });
    }

    const isthereanyPublishedChapter = await prisma.chapter.count({
      where: {
        courseId: course.id,
        isPublished: true,
      },
    });
    if (isthereanyPublishedChapter === 0) {
      return new NextResponse(null);
    }
    const publishedCourse = await prisma.course.update({
      where: {
        id: course?.id,
        chapters: { some: { isPublished: true } },
      },
      data: {
        isPublished: true,
      },
    });

    console.log("publishedCourse: ", publishedCourse);
    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.log("[publishedCourse]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
