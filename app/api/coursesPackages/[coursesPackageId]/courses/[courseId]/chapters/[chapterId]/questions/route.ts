import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ coursesPackage:string; courseId: string; chapterId: string }> }
) {
  try {
    const body = await req.json();
    const { title, options, answers } = body;

    if (
      !title ||
      !options ||
      options.length < 2 ||
      !answers ||
      answers.length < 1
    ) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    console.log((await params).chapterId);

    const question = await prisma.question.create({
      data: {
        chapterId: (await params).chapterId,
        question: title,
        questionOptions: {
          create: options.map((option: string) => ({ option })),
        },
      },
      select: { questionOptions: true },
    });

    await Promise.all(
      question.questionOptions.map(async (v) => {
        if (answers.includes(v.option)) {
          await prisma.questionAnswer.create({
            data: { questionId: v.questionId, answerId: v.id },
          });
        }
        return;
      })
    );

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

