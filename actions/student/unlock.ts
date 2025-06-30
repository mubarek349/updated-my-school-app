// "use server";
// import { prisma } from "@/lib/db";
// import { getStudentProgressPerChapter } from "./progress";

// export default async function unlockingNextChapterfuad(wdt_ID: string) {
//   console.log("test");
//   // 1. Get student and active package
//   const student = await prisma.wpos_wpdatatable_23.findFirst({
//     where: { wdt_ID },
//     select: { wdt_ID: true, activePackage: true },
//   });
//   if (!student?.wdt_ID || !student.activePackage) {
//     throw new Error("Student or active package not found.");
//   }
//   console.log("test11");

//   // 2. Get all courses in the package, ordered by position
//   const packageCourses = await prisma.coursePackage.findMany({
//     where: { id: student.activePackage.id },
//     // orderBy: { course: { position: "asc" } },
//     select: {
//       courses: {
//         select: {
//           id: true,
//           chapters: { select: { id: true }, orderBy: { position: "asc" } },
//         },
//         orderBy: { order: "asc" },
//       },
//     },
//   });
//   // if (!packageCourses.length) {
//   //   throw new Error("No courses found in the active package.");
//   // }

//   console.log("test22");

//   // 3. For each course, in order
//   for (const pkgCourse of packageCourses) {
//     const courseId = pkgCourse.courses[0].id;

//     console.log("test33");
//     // 4. Get all chapters for the course, ordered by position
//     const chapters = await prisma.chapter.findMany({
//       where: { courseId },
//       orderBy: { position: "asc" },
//       select: { id: true, position: true },
//     });
//     if (!chapters.length) continue;

//     console.log("test44");

//     // 5. Get student progress for these chapters
//     const progress = await prisma.studentProgress.findMany({
//       where: {
//         studentId: student?.wdt_ID,
//         chapterId: { in: chapters.map((c) => c.id) },
//       },
//       select: { id: true, chapterId: true, isCompleted: true },
//     });

//     console.log("test55 ", progress);

//     // 6. Use your algorithm to check if all chapters are completed if not return the chapterId
//     const chapterIds = chapters.map((c) => c.id);
//     const completedChapterIds = progress
//       .filter((p) => p.isCompleted)
//       .map((p) => p.chapterId);

//     console.log("error place", chapterIds, completedChapterIds);

//     const allCompleted =
//       chapterIds.length === completedChapterIds.length &&
//       chapterIds.every((v) => completedChapterIds.includes(v));

//     if (allCompleted) {
//       // Move to next course
//       continue;
//     }

//     console.log("test66", allCompleted);
//     // 7. Find the last completed chapter in this course
//     let prevChapterId: string | undefined;
//     for (let i = chapters.length - 1; i >= 0; i--) {
//       const chapter = chapters[i];
//       const prog = progress.find(
//         (p) => p.chapterId === chapter.id && p.isCompleted
//       );
//       if (prog) {
//         prevChapterId = chapter.id;
//         break;
//       }
//     }

//     console.log("test77", prevChapterId);
//     // 8. Find the next chapter to unlock
//     let nextChapter: { id: string; position: number } | undefined;
//     if (prevChapterId) {
//       const prevChapter = chapters.find((c) => c.id === prevChapterId);
//       if (prevChapter) {
//         nextChapter = chapters.find(
//           (c) => c.position === prevChapter.position + 1
//         );
//       }
//     } else {
//       // If no previous completed, start from first chapter
//       nextChapter = chapters[0];
//     }

//     console.log("test88");
//     // 9. Update previous chapter progress to completed if needed
//     if (prevChapterId) {
//       const prevProgress = progress.find((p) => p.chapterId === prevChapterId);
//       if (prevProgress && !prevProgress.isCompleted) {
//         await prisma.studentProgress.update({
//           where: { id: prevProgress.id },
//           data: { isCompleted: true, completedAt: new Date() },
//         });
//       }
//     }
//     console.log("test88");

//     // 10. Create next chapter progress if not exists
//     if (nextChapter) {
//       const nextProgress = progress.find(
//         (p) => p.chapterId === nextChapter!.id
//       ); 
//       if (!nextProgress) {
//         await prisma.studentProgress.create({
//           data: {
//             studentId: student.wdt_ID,
//             chapterId: nextChapter.id,
//             isStarted: true,
//             isCompleted: false,
//           },
//         });
//       }
//     }
//     console.log("test99");

//     // Stop after handling the first incomplete course
//     return "Chapter progress updated.";
//   }

//   return "All courses and chapters completed.";
// }

// // export async function unlockingNextChapter(
// //   wdt_ID: string,
// //   courseId: string,
// //   chapterId: string
// // ) {
// //   // 1. Get student
// //   const student = await prisma.wpos_wpdatatable_23.findFirst({
// //     where: { wdt_ID },
// //     select: { wdt_ID: true },
// //   });
// //   if (!student?.wdt_ID) throw new Error("Student not found.");

// //   // 2. Mark current chapter as completed
// //   let progress = await prisma.studentProgress.findFirst({
// //     where: {
// //       studentId: student.wdt_ID,
// //       chapterId,

// //     },
// //   });

// //   if (!progress) {
// //     await prisma.studentProgress.create({
// //       data: {
// //         studentId: student.wdt_ID,
// //         chapterId,
// //         isCompleted: true,
// //         completedAt: new Date(),
// //       },
// //     });
// //   } else if (!progress.isCompleted) {
// //     await prisma.studentProgress.update({
// //       where: { id: progress.id },
// //       data: {
// //         isCompleted: true,
// //         completedAt: new Date(),
// //       },
// //     });
// //   }

// //   // 3. Find next chapter by position
// //   const currentChapter = await prisma.chapter.findUnique({
// //     where: { id: chapterId },
// //     select: { position: true },
// //   });

// //   if (!currentChapter || currentChapter.position === undefined) return;

// //   const nextChapter = await prisma.chapter.findFirst({
// //     where: {
// //       courseId,
// //       position: currentChapter.position + 1,
// //     },
// //     select: { id: true },
// //   });

// //   if (nextChapter) {
// //     // 4. Mark next chapter as started (not completed)
// //     let nextProgress = await prisma.studentProgress.findFirst({
// //       where: {
// //         studentId: student.wdt_ID,
// //         chapterId: nextChapter.id,
// //       },
// //     });
// //     if (!nextProgress) {
// //       await prisma.studentProgress.create({
// //         data: {
// //           studentId: student.wdt_ID,
// //           chapterId: nextChapter.id,
// //           isStarted: true,
// //           isCompleted: false,
// //         },
// //       });
// //     } else if (!nextProgress.isStarted) {
// //       await prisma.studentProgress.update({
// //         where: { id: nextProgress.id },
// //         data: { isStarted: true },
// //       });
// //     }
// //   }
// // }

// export async function unlockingNextChapter(chatid: string) {
//   const student = await prisma.wpos_wpdatatable_23.findFirst({
//     where: {
//       wdt_ID: chatid,
//       status: { in: ["active", "Not yet"] },
//     },
//     select: {
//       wdt_ID: true,
//       activePackage: {
//         select: {
//           id: true,
//           name: true,
//           courses: {
//             select: {
//               id: true,
//               chapters: {
//                 select: {
//                   id: true,
//                   title: true,
//                   position: true,
//                   isPublished: true,
//                 },
//                 orderBy: { position: "asc" },
//               },
//             },
//             orderBy: { order: "asc" },
//           },
//         },
//       },
//     },
//   });

//   // then organize the data like course{[getChapterbyId..]} then check the progress chapter instudent table and gate the chapter id from getStudentProgressPerChapter
//   if (!student || !student.activePackage) {
//     throw new Error("Student or active package not found.");
//   }

//   // Only return the package data: courses and their chapters
//   const packageData = {
//     courses: student.activePackage.courses.map((course) => ({
//       id: course.id,
//       chapters: course.chapters.map((chapter) => ({
//         id: chapter.id,
//         title: chapter.title,
//         position: chapter.position,
//         isPublished: chapter.isPublished,
//       })),
//     })),
//   };

//   // then check the chapter in the student progress table and return the last one from the order of the course  from the chapter position only return the last chapter only
// }

// export async function activeChapter(chatid: string) {
//   const student = await prisma.wpos_wpdatatable_23.findFirst({
//     where: { wdt_ID: chatid },
//     select: {
//       wdt_ID: true,
//       activePackage: {
//         select: {
//           id: true,
//         },
//       },
//     },
//   });

//   const progress = await prisma.studentProgress.findFirst({
//     where: {
//       studentId: student?.wdt_ID,
//       isCompleted: false,
//     },
//     select: {
//       chapterId: true,
//     },
//   });
//   //   active chapter id
//   const active_chapterId = progress?.chapterId;
//   //   active chapter position
//   const active_chapter_Position = await prisma.chapter.findFirst({
//     where: {
//       id: active_chapterId,
//     },
//     select: {
//       position: true,
//     },
//   });

//   //   axtive courseId
//   const active_courseId = await prisma.chapter.findFirst({
//     where: {
//       id: active_chapterId,
//     },
//     select: {
//       courseId: true,
//       course: { select: { order: true } },
//     },
//   });

//   //   next chapter id in one course
//   const nextChapteridss = await prisma.chapter.findFirst({
//     where: {
//       courseId: active_courseId?.courseId,
//       position: active_chapter_Position
//         ? active_chapter_Position.position + 1
//         : 0,
//     },
//     select: {
//       id: true,
//     },
//   });
//   if (!nextChapteridss) {
//     const NextCourseId = await prisma.course.findFirst({
//       where: {
//         order: (active_courseId?.course?.order ?? 0) + 1,
//       },
//       select: {
//         id: true,
//       },
//     });
//   }

//   const currentCourseId = await prisma.chapter.findFirst({
//     where: {
//       id: active_chapterId,
//     },
//     select: {
//       courseId: true,
//     },
//   });

//   //   gate the course all chapter or jump to next course

//   const updateProgress = await prisma.studentProgress.update({
//     where: {
//       chapterId: active_chapter,
//     },
//     data: {
//       isCompleted: true,
//       completedAt: new Date(),
//     },
//   });

//   //   const gate the next chapter
//   const nextChapter = await prisma.chapter.findFirst({
//     where: {
//       id: active_chapter,
//     },
//     select: {
//       position: true,
//     },
//   });
//   const nextChapterId = await prisma.chapter.findFirst({
//     where: {
//       position: nextChapter?.position + 1,
//       courseId: nextChapter?.courseId,
//     },
//     select: {
//       id: true,
//     },
//   });

//   const createProgress = await prisma.studentProgress.create({
//     data: {
//       studentId: student?.wdt_ID,
//       chapterId: active_chapter,
//       isStarted: true,
//       isCompleted: false,
//     },
//   });
// }

// export async function unlock(chatid: string) {
//   const student = await prisma.wpos_wpdatatable_23.findFirst({
//     where: {
//       wdt_ID: chatid,
//       status: { in: ["active", "Not yet"] },
//     },
//     select: {
//       wdt_ID: true,
//       activePackage: {
//         select: {
//           courses: {
//             select: {
//               id: true,
//               chapters: {
//                 select: {
//                   id: true,
//                 },
//                 orderBy: { position: "asc" },
//               },
//             },
//             orderBy: { order: "asc" },
//           },
//         },
//       },
//     },
//   });

//   const studentChapters = student?.activePackage?.courses.map((value) => ({
//     ...value,
//     chapters: value.chapters.map((value) => value.id),
//   }));

//   const donechapter = await prisma.studentProgress.findMany({
//     where: {
//       studentId: student?.wdt_ID,
//       isCompleted: true,
//     },
//     select: {
//       chapterId: true,
//     },
//   });
//    const compare = studentChapters?.map((value) => ({
//     ...value,
//     chapters: value.chapters.filter((chapter) =>
//       donechapter.some((done) => done.chapterId === chapter)
//     ),
//     notFound: value.chapters.filter((chapter) =>
//       !donechapter.some((done) => done.chapterId === chapter)
//     ),
//   }));
//     // console.log("compare", compare);

//   //   then i went to compare the donechapter with the student chapter in course
//   // compare and return the notfound chapter id in donechapter from the student chapter se a
//   const finalChapter = donechapter;
// }

// export async function unlock_me(chatid: string) {
//   // Get student data with courses and ordered chapters
//   const student = await prisma.wpos_wpdatatable_23.findFirst({
//     where: {
//       wdt_ID: chatid,
//       status: { in: ["active", "Not yet"] },
//     },
//     select: {
//       wdt_ID: true,
//       activePackage: {
//         select: {
//           courses: {
//             select: {
//               id: true,
//               title: true, // Added for better debugging
//               chapters: {
//                 select: {
//                   id: true,
//                   title: true, // Added for better debugging
//                   position: true,
//                 },
//                 orderBy: { position: "asc" },
//               },
//             },
//             orderBy: { order: "asc" },
//           },
//         },
//       },
//     },
//   });

//   if (!student?.activePackage?.courses?.length) {
//     return null; // No courses available
//   }

//   // Get completed chapters
//   const doneChapters = await prisma.studentProgress.findMany({
//     where: {
//       studentId: student.wdt_ID,
//       isCompleted: true,
//     },
//     select: {
//       chapterId: true,
//     },
//   });

//   console.log("Completed chapters:", doneChapters);

//   // Create a map of completed chapter IDs for quick lookup
//   const completedChapterIds = new Set(doneChapters.map((c) => c.chapterId));

//   // Find the first incomplete chapter
//   for (const course of student.activePackage.courses) {
//     // Ensure chapters are properly ordered by position
//     const orderedChapters = [...course.chapters].sort(
//       (a, b) => a.position - b.position
//     );

//     for (const chapter of orderedChapters) {
//       if (!completedChapterIds.has(chapter.id)) {
//         // Found the first incomplete chapter

//         const data = {
//           courseId: course.id,
//           courseTitle: course.title,
//           chapterId: chapter.id,
//           chapterTitle: chapter.title,
//           position: chapter.position,
//         };

//         console.log("First incomplete chapter:", data);
//         return data;
//       }
//     }
//   }

//   // All chapters are completed
//   return null;
// }

// export async function unlockChapters(
//     chatid: string,
//     chapterid: string,
// ){
//     const data = await unlock_me(chatid);
//     const studentId = await prisma.wpos_wpdatatable_23.findFirst({
//         where: {
//             wdt_ID: chatid,
//         },
//         select: {
//             wdt_ID: true,
//         },
//     });
//     if(chapterid == data?.chapterId){
//         const updateProgress = await prisma.studentProgress.update({
//             where: {
//                 chapterId: chapterid,
//             },
//             data: {
//                 isCompleted: true,
//                 completedAt: new Date(),
//             },
//         });
//         //

//         // and also create a next progress by getting the next chapter
//         const nextProgress = await prisma.studentProgress.create({
//             data: {
//                 studentId: studentId?.wdt_ID,
//                 chapterId: data.chapterId,
//                 isStarted: true,
//                 isCompleted: false,
//             },
//         });
//     }
// }

"use server";
import { correctAnswer } from "@/actions/student/question";
import  prisma  from "@/lib/db";
import { showAnswer } from "@/actions/student/question";
// import sendMessage from "@/bot";
import { redirect } from "next/navigation";
let noOfTrial = 0;
export async function unlockingNextChapter(
  coursesPackageId: string,
  courseId: string,
  chapterId: string,
  wdt_ID:number,
) {
  try {
    if (!chapterId || !wdt_ID || !courseId || coursesPackageId) {
      console.error("Invalid input: chapterId or wdt_ID is missing.");
      throw new Error("Invalid input: chapterId and wdt_ID are required.");
    }

    console.log("Fetching student with wdt_ID:", wdt_ID);
    const student = await prisma.wpos_wpdatatable_23.findFirst({
      where: { wdt_ID: wdt_ID },
    });

    const studentId = student?.wdt_ID;
    if (!studentId) {
      console.error("Student not found for wdt_ID:", wdt_ID);
      return redirect("/en/");
    }

    console.log(
      "Fetching result for chapterId:",
      chapterId,
      "studentId:",
      student.wdt_ID
    );
    const { result } = await correctAnswer(chapterId, student.wdt_ID);
    if (!result) {
      console.error("Failed to retrieve result for chapterId:", chapterId);
      throw new Error("Failed to retrieve result from correctAnswer.");
    }

    console.log("Fetching previous chapter with id:", chapterId);
    const prevChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        position: true,
        courseId: true,
        course: { select: { packageId: true, order: true } },
      },
    });

    if (!prevChapter) {
      console.error("Previous chapter not found for id:", chapterId);
      throw new Error("Previous chapter not found.");
    }
    if (result.score == 1) {
      console.log("Updating student progress for chapterId:", chapterId);
      const prevChapterProgress = await prisma.studentProgress.findFirst({
        where: {
          chapterId: chapterId,
          studentId: studentId,
          isStarted: true,
          isCompleted: false,
        },
      });

      if (prevChapterProgress) {
        await prisma.studentProgress.update({
          where: { id: prevChapterProgress.id },
          data: {
            isCompleted: true,
            completedAt: new Date(),
          },
        });

        const lastChapter = await prisma.chapter.findFirst({
          where: {
            courseId: prevChapter.courseId,
          },
          select: {
            id: true,
            position: true,
          },
          orderBy: { position: "desc" },
        });

        if (prevChapter.id == lastChapter?.id) {
          const lastCourse = await prisma.course.findFirst({
            where: {
              packageId: prevChapter.course.packageId,
            },
            select: {
              id: true,
            },
            orderBy: {
              order: "desc",
            },
          });

          if (prevChapter.courseId == lastCourse?.id) {
            // const congra = `hello you have finished course thank you so much`;
            // await sendMessage(Number(wdt_ID), congra);
          } else {
            const nextCourse = await prisma.course.findFirst({
              where: {
                packageId: prevChapter.course.packageId,
                order: prevChapter.course.order + 1,
              },
              select: {
                id: true,
              },
            });
            const nextChapter = await prisma.chapter.findFirst({
              where: { courseId: nextCourse?.id },
              orderBy: { position: "asc" },
            });
            if (nextChapter)
              await prisma.studentProgress.create({
                data: {
                  studentId: studentId,
                  chapterId: nextChapter?.id,
                  isStarted: true,
                  isCompleted: false,
                },
              });
          }
        } else {
          const nextChapter = await prisma.chapter.findFirst({
            where: {
              courseId: prevChapter?.courseId,
              position: prevChapter.position + 1,
            },
          });
          if (nextChapter)
            await prisma.studentProgress.create({
              data: {
                studentId: studentId,
                chapterId: nextChapter?.id,
                isStarted: true,
                isCompleted: false,
              },
            });
        }
      }

      console.log("you passed the exam:", chapterId);
      const passed = "ፈተናዉን አልፈዋል";
      return passed;
    } else {
      noOfTrial += 1;
      if (noOfTrial == 2) {
        noOfTrial = 0;
        return await showAnswer(chapterId);
      }
      console.log("you Fail the exam:", chapterId);
      const failed = "ፈተናዉን ወድቀዋል";
      return failed;
    }
  } catch (error) {
    console.error("Error unlocking next chapter:", error);
  }
}
