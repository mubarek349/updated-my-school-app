import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      coursesPackageId: string;
    }>;
  }
) {
  try {
    const { coursesPackageId } = await params;

    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if coursespackage exists
    const coursesPackage = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
      },
    });
    if (!coursesPackage) {
      return new NextResponse("coursesPackage Not found", { status: 404 });
    }

    // Delete the coursesPackage
    const deletedcoursesPackage = await prisma.coursePackage.delete({
      where: {
        id: coursesPackageId,
      },
    });

    return NextResponse.json(deletedcoursesPackage);
  } catch (error) {
    console.log("[coursesPackageID_DELETION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ coursesPackageId: string }> }
) {
  try {
    const { coursesPackageId } = await params;
    // ...existing code...
    // const {userId} = auth();

    const values = await req.json();

    const updatedCoursePackage = await prisma.coursePackage.update({
      where: {
        id: coursesPackageId,
      },
      data: {
        ...values,
      },
    });
    console.log("the updated Package is  : ", updatedCoursePackage);
    return NextResponse.json(updatedCoursePackage);
  } catch (error) {
    console.error("Error updating course:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

