import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
  //   context: { params: { userId: string } }
) {
  try {
    const userId = "";
   
    // Replace with actual userId from context
    const {name}  = await req.json();
    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }
    const createdCoursePackage = await prisma.coursePackage.create({
      data: {
        name,
        userId,
      },
    });
    console.log("course : ", createdCoursePackage);
    return NextResponse.json(createdCoursePackage);
  } catch (error) {
    console.error("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
