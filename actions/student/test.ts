"use server";
import prisma from "@/lib/db";

// Get the chapter and questions for a student in their active package, based on given courseId and chapterId
export async function getQuestionForActivePackageChapterUpdate(wdt_ID: number) {
  // 1. Get student and active package with courses and chapters
  const student = await prisma.wpos_wpdatatable_23.findFirst({
    where: {
      wdt_ID: wdt_ID,
      status: { in: ["active", "Not yet"] },
    },
    select: {
      wdt_ID: true,
      activePackage: {
        select: {
          id: true,
          name: true,
          courses: {
            select: {
              id: true,
              title: true,
              order: true,
              chapters: {
                select: {
                  id: true,
                  title: true,
                  position: true,
                  videoUrl: true,
                  // isPublished: true,
                },
                orderBy: { position: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!student || !student.activePackage) {
    throw new Error("Student or active package not found.");
  }
  const allChapterIds =
    student?.activePackage?.courses
      ?.map((c) => c.chapters.map((ch) => ch.id))
      ?.reduce((acc, cc) => [...acc, ...cc], []) ?? [];

  //Fetch the last chapter progress for the student
  const progress = await prisma.studentProgress.findMany({
    where: {
      studentId: wdt_ID,
      chapterId: { in: allChapterIds },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      isCompleted: true,
      chapterId: true,
      chapter: {
        select: {
          id: true,
          course: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (progress.filter((p) => p.isCompleted).length === allChapterIds.length) {
    return { error: true, message: "በፓኬጁ ውስጥ የሚገኙትን ኮርሶች ጨርሰዋል።" };
  } else {
    const CompletedlastChapterId = progress.findLast((p) => p.isCompleted)
      ?.chapter.id;

    let nextChapterId: string | undefined = undefined;
    if (!CompletedlastChapterId) {
      nextChapterId = allChapterIds[0];
    } else {
      const idx = allChapterIds.findIndex((c) => c === CompletedlastChapterId);
      nextChapterId = allChapterIds[idx + 1];
    }
    const checkupoccuringProgress = progress.filter(
      (p) => p.chapterId === nextChapterId
    );
    if (!checkupoccuringProgress)
      await prisma.studentProgress.create({
        data: {
          studentId: wdt_ID,
          chapterId: nextChapterId,
          isCompleted: false,
        },
      });

    const lastChapter = await prisma.studentProgress.findFirst({
      where: {
        student: { wdt_ID: wdt_ID },
        chapterId: { in: allChapterIds },
        isCompleted: false,
      },
      select: {
        chapter: {
          select: {
            id: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // 4. Get full chapter data and questions
    const chapterData = await prisma.chapter.findUnique({
      where: { id: lastChapter?.chapter.id },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        position: true,
        questions: {
          select: {
            id: true,
            question: true,
            questionOptions: { select: { id: true, option: true } },
          },
        },
      },
    });

    // 5. Calculate package progress (doneChapters/totalChapters)

    const totalChapters = allChapterIds.length;
    const doneChapters = progress.filter((p) => p.isCompleted).length;
    const data = {
      packageId: student.activePackage.id,
      packageName: student.activePackage.name,
      packageProgress: `${doneChapters}/${totalChapters}`,
      courseId: lastChapter?.chapter.course.id,
      courseTitle: lastChapter?.chapter.course.title,
      chapter: chapterData,
    };
    console.log(data);
    return data;
  }
}
