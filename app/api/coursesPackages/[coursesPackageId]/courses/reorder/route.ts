import prisma from "@/lib/db";
import { NextResponse } from "next/server";
export async function PUT(
  req: Request,
  {
    params,
  }: { params: Promise<{ coursesPackageId: string; }> }
) //   context: { params: { userId: string } }
{
  try {
    const { coursesPackageId } = await params;
    

    const { list } = await req.json();
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
        // userId: userId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    for (const item of list) {
      await prisma.course.update({
        where: { id: item.id },
        data: { order: item.position },
      });
    }
    return new NextResponse("successfully Course Reorded", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
