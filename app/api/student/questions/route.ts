import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = parseInt(session.user.id);

    const questions = await prisma.qandAQuestion.findMany({
      where: { studentId },
      include: {
        student: true,
        coursePackage: true,
        responses: {
          include: {
            ustaz: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      courseName: q.coursePackage?.name || "Unknown Course",
      timestamp: q.timestamp,
      type: q.type,
      createdAt: q.createdAt.toISOString(),
      student: {
        firstName: q.student?.name?.split(' ')[0] || 'Student',
        fatherName: q.student?.name?.split(' ')[1] || '',
      },
      responses:
        q.responses?.map((r) => ({
          id: r.id,
          response: r.response,
          ustazName: r.ustaz?.ustazname || "Unknown Ustaz",
          createdAt: r.createdAt.toISOString(),
        })) || [],
    }));

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error("Error fetching student questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
