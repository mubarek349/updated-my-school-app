"use server";
import prisma from "@/lib/db";

export async function getPackageData(wdt_ID: number) {
  // 1. Get student and active package with courses and chapters
  const student = await prisma.wpos_wpdatatable_23.findFirst({
    where: {
      wdt_ID: wdt_ID,
      status: { in: ["active", "notyet"] },
    },
    select: {
      wdt_ID: true,
      name: true,
      status: true,
      subject: true,
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
    },
  });
  console.log("Student data:", student);
  if (!student) {
    console.log("No student found");
    return null;
  }

  return student;
}
