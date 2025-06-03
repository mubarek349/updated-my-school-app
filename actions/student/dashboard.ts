"use server";
import prisma  from "@/lib/db";

export async function getpackage(wdt_ID: number) {
  const myPackageList = await prisma.studentProgress.findMany({
    where: { student: { wdt_ID: wdt_ID } },
    select: {
      chapter: { 
        select: {
          course: {
            select: {
              _count: { select: { chapters: true } },
              package: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });
  return myPackageList;
}

export async function getstudentId(wdt_ID: number) {
  const studentId = await prisma.wpos_wpdatatable_23.findFirst({
    where: { wdt_ID },
    select: { wdt_ID: true },
  });
  return studentId?.wdt_ID;
}

// export async function studentDashboard(chatId: string) {}
