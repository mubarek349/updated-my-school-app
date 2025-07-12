"use server";
import prisma from "@/lib/db";

export async function getStudentProfile(studentId: string) {
  const student = await prisma.wpos_wpdatatable_23.findUnique({
    where: { wdt_ID: Number(studentId) },
    select: {
      name: true,
      isKid: true,     
    },
  });
  return student;
}

// list the student past and current packages with course details and with final exam result
export async function getStudentPackages(studentId: string) {
  const packages = await prisma.wpos_wpdatatable_23.findUnique({
    where: { wdt_ID: Number(studentId) },
    select: {
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
                  isPublished: true,
                },
                orderBy: { position: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
      pastPackages: {
        select: {
          id: true,
          name: true,
          finalExamResult: true, // Assuming this field exists
        },
      },
    },
  });
  return packages;
}