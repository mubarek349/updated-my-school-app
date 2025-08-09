import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
  //   context: { params: { userId: string } }
) {
  console.log("at first course package: ");
  try {
    // Replace with actual userId from context
    const { name } = await req.json();
    console.log("below name course package: ", name);

    const createdCoursePackage = await prisma.coursePackage.create({
      data: {
        name,
      },
    });
    console.log("below course package: ", createdCoursePackage);

    return NextResponse.json(createdCoursePackage);
  } catch (error) {
    console.error("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
