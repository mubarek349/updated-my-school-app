import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const { customVideo } = await request.json();

    if (!chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    // Allow customVideo to be null for removal
    if (customVideo === undefined) {
      return NextResponse.json(
        { error: "customVideo field is required (can be null for removal)" },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        customVideo: customVideo,
      },
    });

    return NextResponse.json({ success: true, chapter });
  } catch (error) {
    console.error("Error updating chapter video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}