"use server";
import prisma  from "@/lib/db";
// import { isAuthorized } from "@/lib/isAuthorized";
// import { Lesson } from "@/lib/zodSchema";

export async function getCourse(packageId: string) {
  //   const student = await isAuthorized("student");
  const allCourses = await prisma.course.findMany({
    where: {
      packageId: packageId,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      order: true,
      chapters: {
        select: {
          id: true,
          title: true,
          position: true,
          isPublished: true,
        },
        orderBy: { position: "asc" },
      },
      description: true,
    },
    orderBy: { order: "asc" },
  });
  return allCourses;
}

export async function getCoursebyId(courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        chapters: {
          select: {
            id: true,
            title: true,
            position: true,
            isPublished: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });
    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw new Error("Failed to fetch course");
  }
}

export async function courseDetail(courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true, 
        description: true,
        order: true,
        chapters: {
          select: {
            id: true,
            title: true,
            position: true,
            isPublished: true,
            videoUrl: true,
            questions: {
              select: {
                question: true,
                questionOptions: true,
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });
    return course;
  } catch (error) {
    console.error("Error fetching course detail:", error);
    throw new Error("Failed to fetch course detail");
  }
}
