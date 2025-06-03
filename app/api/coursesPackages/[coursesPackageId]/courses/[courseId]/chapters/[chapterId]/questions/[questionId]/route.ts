import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        questionOptions: true,
        questionAnswer: true,
      },
    });
    return NextResponse.json(question);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error,
        message: "Failed to fetch the question",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const questionData = await request.json();
    const { question, options, answer } = questionData;

    if (
      !question ||
      !options ||
      options.length < 2 ||
      !answer ||
      answer.length < 1
    ) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedQuestion = await prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        question: question,
        questionOptions: {
          deleteMany: {}, // Remove existing options
          create: options.map((option: string) => ({ option })),
        },
      },
      include: { questionOptions: true },
    });

    await prisma.questionAnswer.deleteMany({
      where: { questionId },
    });

    const answerPromises = updatedQuestion.questionOptions
      .filter((option) => answer.includes(option.option))
      .map((option) =>
        prisma.questionAnswer.create({
          data: { questionId: updatedQuestion.id, answerId: option.id },
        })
      );

    await Promise.all(answerPromises);

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error,
        message: "Failed to update the question",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    await prisma.questionAnswer.deleteMany({
      where: { questionId },
    });

    await prisma.questionOption.deleteMany({
      where: { questionId },
    });

    const deletedQuestion = await prisma.question.delete({
      where: {
        id: questionId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully.",
      data: deletedQuestion,
    });
  } catch (error) {
    console.error("Error in DELETE handler:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete the question.",
      },
      { status: 500 }
    );
  }
}
