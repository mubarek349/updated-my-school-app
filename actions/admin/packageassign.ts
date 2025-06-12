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
export async function getDistinctPackagesWithSubjects() {
  const result = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      package: { not: null },
      subject: { not: null },
    },
    select: {
      package: true,
      subject: true,
    },
    distinct: ['package', 'subject'],
  });
  return result;
}

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
  isKid:boolean,
  selectedStudentPackagewithSubjects: { package: string; subject: string }[],
) {
  // Update wpos_wpdatatable_23 for each subject/package pair
  for (const { package: pkg, subject } of selectedStudentPackagewithSubjects) {
    await prisma.wpos_wpdatatable_23.updateMany({
      where: {
        package: pkg,
        subject: subject,
        isKid:isKid,
      },
      data: {
        youtubeSubject: coursesPackageId,
      },
    });

    // Check if the subject is already assigned to a package
    const existingPackage = await prisma.subjectPackage.findFirst({
      where: {
        subject: subject,
        packageType:pkg,
        packageId: coursesPackageId,
      },
      select: {
        id: true,
        packageId: true,
        subject: true,
        packageType:true,
      },
    });

    if (existingPackage) {
      // Update the packageId if needed
      await prisma.subjectPackage.update({
        where: {
          id: existingPackage.id,
          packageType:existingPackage.packageType,
          subject:existingPackage.subject,
        },
        data: {
          packageId: coursesPackageId,
        },
      });
    } else {
      // Create a new subjectPackage entry
      await prisma.subjectPackage.create({
        data: {
          subject: subject,
          packageType:pkg,
          packageId: coursesPackageId,
        },
      });
    }
  }

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
export async function getAssignedPacakgesWithSubjects(coursesPackageId: string) {
  const assignedSubjects = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      youtubeSubject: coursesPackageId,
    },
    select: {
      package: true,
      subject: true,
      isKid: true,
    },
    distinct: ['package', 'subject'],
  });

  // Return the unique pairs as objects
  return assignedSubjects.map(item => ({
    package: item.package,
    subject: item.subject,
    isKid: item.isKid,
  }));
}

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
