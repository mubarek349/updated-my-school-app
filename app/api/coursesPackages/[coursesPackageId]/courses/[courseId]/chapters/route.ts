import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  {params}: { params: Promise<{coursesPackageId: string, courseId: string }> }
//   context: { params: { userId: string } }
) {
  try {
    const { coursesPackageId } = await params;
    const { courseId } = await params;
    // const userId = context.userId;
    

    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
        // userId: userId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();

    const lastChapter = await prisma.chapter.findFirst({
      where: {  
        courseId: courseId,
      },
        orderBy: {
            position: "desc",
        },
    });
    
    const newPosition = lastChapter ? lastChapter.position + 1 : 1;
    const createdChapter = await prisma.chapter.create({
      data: {
        title,
        courseId: courseId,
        position: newPosition,
      },
    });
    console.log("createdChapter :",createdChapter);
    return NextResponse.json(createdChapter);
  } catch (error) {
    console.error("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
