import  prisma  from "@/lib/db";

export default async function getActiveChapter(
  courseId: string,
  chapterId: string,
) {
  try { 
    const activeChapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      select: {
        title: true,
        description: true,
        videoUrl: true,
        questions: {
          select: {
            question: true,
            questionOptions: true,
            questionAnswer: true,
            studentQuiz: {
              select: {
                studentQuizAnswers: {
                  select: {
                    selectedOption: { select: { id: true, option: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    return activeChapter;
  } catch (error) {
    console.error("Error fetching active chapter:", error);
    throw error;
  }
}


export async function unlockingNextChapterfuad(wdt_ID: number) {
  console.log("test");
  // 1. Get student and active package
  const student = await prisma.wpos_wpdatatable_23.findFirst({
    where: { wdt_ID },
    select: { activePackage: true },
  });
  if (!student?.activePackage) {
    throw new Error("active package not ");
  }
  console.log("test11");

  // 2. Get all courses in the package, ordered by position
  const packageCourses = await prisma.coursePackage.findMany({
    where: { id: student.activePackage.id },
    // orderBy: { course: { position: "asc" } },
    select: {
      courses: {
        select: {
          id: true,
          chapters: { select: { id: true }, orderBy: { position: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });
  // if (!packageCourses.length) {
  //   throw new Error("No courses found in the active package.");
  // }

  console.log("test22");

  // 3. For each course, in order
  for (const pkgCourse of packageCourses) {
    const courseId = pkgCourse.courses[0].id;

    console.log("test33");
    // 4. Get all chapters for the course, ordered by position
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
      select: { id: true, position: true },
    });
    if (!chapters.length) continue;

    console.log("test44");

    // 5. Get student progress for these chapters
    const progress = await prisma.studentProgress.findMany({
      where: {
        studentId: wdt_ID,
        chapterId: { in: chapters.map((c) => c.id) },
      },
      select: { id: true, chapterId: true, isCompleted: true },
    });

    console.log("test55 ");

    // 6. Use your algorithm to check if all chapters are completed
    const chapterIds = chapters.map((c) => c.id);
    const completedChapterIds = progress
      .filter((p) => p.isCompleted)
      .map((p) => p.chapterId);

    const allCompleted =
      chapterIds.length === completedChapterIds.length &&
      chapterIds.every((v) => completedChapterIds.includes(v));

    if (allCompleted) {
      // Move to next course
      continue;
    }

    console.log("test66");
    // 7. Find the last completed chapter in this course
    let prevChapterId: string | undefined;
    for (let i = chapters.length - 1; i >= 0; i--) {
      const chapter = chapters[i];
      const prog = progress.find(
        (p) => p.chapterId === chapter.id && p.isCompleted
      );
      if (prog) {
        prevChapterId = chapter.id;
        break;
      }
    }

    console.log("test77");
    // 8. Find the next chapter to unlock
    let nextChapter: { id: string; position: number } | undefined;
    if (prevChapterId) {
      const prevChapter = chapters.find((c) => c.id === prevChapterId);
      if (prevChapter) {
        nextChapter = chapters.find(
          (c) => c.position === prevChapter.position + 1
        );
      }
    } else {
      // If no previous completed, start from first chapter
      nextChapter = chapters[0];
    }

    console.log("test88");
    // 9. Update previous chapter progress to completed if needed
    if (prevChapterId) {
      const prevProgress = progress.find((p) => p.chapterId === prevChapterId);
      if (prevProgress && !prevProgress.isCompleted) {
        await prisma.studentProgress.update({
          where: { id: prevProgress.id },
          data: { isCompleted: true, completedAt: new Date() },
        });
      }
    }
    console.log("test88");

    // 10. Create next chapter progress if not exists
    if (nextChapter) {
      const nextProgress = progress.find(
        (p) => p.chapterId === nextChapter!.id
      );
      if (!nextProgress) {
        await prisma.studentProgress.create({
          data: {
            studentId: wdt_ID,
            chapterId: nextChapter.id,
            isStarted: true,
            isCompleted: false,
          },
        });
      }
    }
    console.log("test99");

    // Stop after handling the first incomplete course
    return "Chapter progress updated.";
  }

  return "All courses and chapters completed.";
}

