"use server";
// import { auth } from "@/auth";
import prisma from "@/lib/db";
// import { isTeacher } from "@/lib/teacher";
// export async function getStudSubject() {
//   const studSubject = await prisma.wpos_wpdatatable_23.findMany({
//     select: {

//       subject: true,
//     },
//     distinct: ["subject"],
//   });

//   // Return the first unique subject or null if none
//   return studSubject;
// }

// export async function getStudent(packageId: string, subject?: string[]) {
//   const students = await prisma.wpos_wpdatatable_23.findMany({
//     where: {
//       status: { in: ["active", "notyet"] },
//       youtubeSubject: { not: packageId },
//       ...(subject
//         ? {
//             subject: { in: subject },
//           }
//         : {}),
//     },
//     select: {
//       wdt_ID: true,
//       name: true,
//     },
//   });
//   return students;
// }

// export async function setPackage(packageId: string, studentids: number[]) {
//   await prisma.wpos_wpdatatable_23.updateMany({
//     where: {
//       wdt_ID: { in: studentids },
//     },
//     data: {
//       youtubeSubject: packageId,
//     },
//   });

//   return { response: "update successfully" };
// }

export async function getStudSubject() {
  const studSubject = await prisma.wpos_wpdatatable_23.findMany({
    select: {
      subject: true,
    },
    distinct: ["subject"],
  });

  // Return the first unique subject or null if none
  console.log("stud subject : ", studSubject);
  return studSubject;
}

export async function assignPackage(
  coursesPackageId: string,
  selectedStudentSubjects: string[]
) {
  await prisma.wpos_wpdatatable_23.updateMany({
    where: {
      subject: { in: selectedStudentSubjects },
    },
    data: {
      youtubeSubject: coursesPackageId,
    },
  });

  return { response: "successfully assigned" };
}
// export async function getAssignedSubjects(coursesPackageId: string) {
//   // Fetch the assigned subjects for the given course package
//   const assignedSubject = await prisma.coursePackage.findMany({
//     where: {
//       id: coursesPackageId,
//     },
//     select: {
//       assignedSubjects: true,
//     },
//   });

//   const assignedSubjects = assignedSubject[0]?.assignedSubjects || [];
//   if (assignedSubjects.length > 0) {
//     const assignedSubjectsArray = assignedSubjects
//       .split(",")
//       .map((subject) => subject.trim());
//     // Result: ["Math", "Science"]
//     // Return the first unique subject or null if none
//     console.log("assigned subject : ", assignedSubjectsArray);
//   }
//   return assignedSubjectsArray;
// }

export async function unasignPackage(studentId: number[]) {
  await prisma.wpos_wpdatatable_23.updateMany({
    where: {
      wdt_ID: { in: studentId },
    },
    data: {
      youtubeSubject: "",
    },
  });
  return { response: "update successfully" };
}

export async function displayPachageStudent(packageId: string) {
  const packagestudent = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      youtubeSubject: packageId,
    },
    select: {
      name: true,
      status: true,
    },
  });

  return packagestudent;
}
