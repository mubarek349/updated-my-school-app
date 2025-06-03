import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ coursesPackageId: string; courseId: string }>;
  }
) //   context: { params: { userId: string } }
{
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

    const unpublishedcourse = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        isPublished: false,
      },
    });
    console.log("unpublishedcourse: ", unpublishedcourse);
    return NextResponse.json(unpublishedcourse);
  } catch (error) {
    console.log("[COURSES_course_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
