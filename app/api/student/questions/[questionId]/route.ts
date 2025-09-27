import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const studentId = parseInt(session.user.id);
    const { question } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const updatedQuestion = await prisma.qandAQuestion.update({
      where: {
        id: resolvedParams.questionId,
        studentId,
      },
      data: { question: question.trim() },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const studentId = parseInt(session.user.id);

    await prisma.qandAQuestion.delete({
      where: {
        id: resolvedParams.questionId,
        studentId,
      },
    });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
