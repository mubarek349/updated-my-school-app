import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ chat_id: string; courseId: string; chapterId: string }>;
  }
) {
  try {
    const body = await req.json();
    const answers = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // const studentId = "cmaf4xxqj0000yeuk0lzgoyvo"; // Replace with actual student ID from session or context

    // const courseId = (await params).courseId;
    // const chapterId = (await params).chapterId;
    const {chat_id} = await params;

    const answerPromises = await Promise.all(
      Object.entries(answers).map(async ([questionId, optionId]) => {
        const ak = await prisma.studentQuiz.findFirst({
          where: { student: { chat_id }, questionId },
        });

        if (ak) {
          await prisma.studentQuizAnswer.deleteMany({
            where: { studentQuizId: ak.id },
          });
          await prisma.studentQuiz.update({
            where: { id: ak.id },
            data: {
              studentQuizAnswers: {
                create: (optionId as string[]).map((v) => ({
                  selectedOptionId: v,
                })),
              },
            },
          });
        } else {
          const student = await prisma.wpos_wpdatatable_23.findFirst({
            where: { chat_id: chat_id },
          });
          if (student)
            await prisma.studentQuiz.create({
              data: {
                studentId: student.wdt_ID,
                questionId,
                studentQuizAnswers: {
                  create: (optionId as string[]).map((v) => ({
                    selectedOptionId: v,
                  })),
                },
              },
            });
        }

        return;
      })
    );

    await Promise.all(answerPromises);

    return NextResponse.json({
      success: true,
      message: "Answers submitted successfully.",
    });
  } catch (error) {
    console.error("Error submitting answers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
