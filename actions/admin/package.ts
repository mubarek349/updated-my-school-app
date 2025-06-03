"use server";
// import { auth } from "@/auth";
import prisma from "@/lib/db";
// import { isTeacher } from "@/lib/teacher";
// import { redirect } from "next/navigation";

export async function getCoursesPackages() {
  try {
  

    const coursesPackages = await prisma.coursePackage
      .findMany({
        where: {
          // isPublished: true,
        },
        include: {
          courses: {
            where: {
              // isPublished: true,
            },
            include: {
              chapters: {
                where: {
                  // isPublished:true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      .catch((error) => {
        console.error("ERRRO >> ", error);
        return [];
      });
    console.log("courses package: ", coursesPackages);
    return coursesPackages;
  } catch (error) {
    console.error("Error fetching courses with progress:", error);
    return [];
  }
}
