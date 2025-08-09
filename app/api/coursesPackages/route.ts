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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
  console.error("[COURSES]", error.message, error.stack);
  return new NextResponse("Internal Error", { status: 500 });
}
}
