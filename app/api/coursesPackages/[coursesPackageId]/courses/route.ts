import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  //   context: { params: { userId: string } }
  { params }: { params: Promise<{ coursesPackageId: string }> }
) {
  try {
    const { coursesPackageId } = await params;

    const { title } = await req.json();
    

    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const lastCourseInthePackage = await prisma.course.findFirst({
      where: {
        packageId: coursesPackageId,
      },
      orderBy: {
        order: "desc",
      },
    });

    const newPosition = lastCourseInthePackage
      ? lastCourseInthePackage.order + 1
      : 1;
    const createdCourse = await prisma.course.create({
      data: {
        title,
        packageId: coursesPackageId,
        order: newPosition,
      },
    });
    console.log("created Course :", createdCourse);
    return NextResponse.json(createdCourse);
  } catch (error) {
    console.error("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
