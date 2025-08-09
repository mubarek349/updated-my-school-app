import prisma from "@/lib/db";
import { NextResponse } from "next/server";
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      coursesPackageId: string;
      courseId: string;
    }>;
  }
) {
  try {
    const { coursesPackageId, courseId } = await params;

    // Check course package ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
        // userId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: { packageId: true },
    });
    if (!course) {
      return new NextResponse("course Not found", { status: 404 });
    }

    // Delete the course
    const deletedcourse = await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    // Optionally: Unpublish course if no published courses remain
    // const publishedCoursesInCoursePackage = await prisma.course.count({
    //   where: {
    //     packageId: coursesPackageId,
    //     isPublished: true,
    //   },
    // });

    // if (publishedCoursesInCoursePackage === 0) {
    //   const updatedCoursePackage = await prisma.coursePackage.update({
    //     where: {
    //       id: course.packageId,
    //     },
    //     data: {
    //       isPublished: false,
    //     },
    //   });
    //   console.log("the course is updated", updatedCoursePackage);
    // }

    return NextResponse.json(deletedcourse);
  } catch (error) {
    console.log("[courseID_DELETION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  {
    params,
  }: { params: Promise<{ coursesPackageId: string; courseId: string }> }
) {
  //   context: { params: { userId: string } }
  try {
    const { coursesPackageId } = await params;
    const { courseId } = await params;
    // const {userId} = auth();

    // const  userId ="clg1v2j4f0000l5v8xq3z7h4d"; // Replace with actual userId from context

    const values = await req.json();

    const updatedCourse = await prisma.course.update({
      where: {
        id: courseId,
        packageId: coursesPackageId,
      },
      data: {
        ...values,
      },
    });
    console.log("Updated Course", updatedCourse);

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.log("[PACKAGES_cOURSE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
