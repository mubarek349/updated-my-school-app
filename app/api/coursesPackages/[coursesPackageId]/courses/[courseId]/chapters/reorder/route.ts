import prisma from "@/lib/db";
import { NextResponse } from "next/server";
export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      coursesPackageId: string;
      // courseId: string;
    }>;
  }
) {
  try {
    const { coursesPackageId } = await params;
    // const { courseId } = await params;
    

    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
        // userId: userId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    for (const item of list) {
      await prisma.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }
    return new NextResponse("Successfully reordered the chapter", {
      status: 200,
    });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
