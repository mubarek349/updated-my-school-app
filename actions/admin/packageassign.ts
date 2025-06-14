"use server";
import prisma from "@/lib/db";

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
        kidpackage:isKid,
        packageId: coursesPackageId,
      },
      select: {
        id: true,
        packageId: true,
        subject: true,
        packageType:true,
        kidpackage:true
      },
    });

    if (existingPackage) {
      // Update the packageId if needed
      await prisma.subjectPackage.update({
        where: {
          id: existingPackage.id,
          packageType:existingPackage.packageType,
          subject:existingPackage.subject,
          kidpackage:existingPackage.kidpackage,
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
          kidpackage:isKid,
          packageId: coursesPackageId,
        },
      });
    }
  }

  return { response: "successfully assigned" };
}

export async function getAssignedPacakgesWithSubjects(coursesPackageId: string) {
  const assignedSubjects = await prisma.subjectPackage.findMany({
    where: {
      packageId: coursesPackageId,
    },
    select: {
      packageType: true,
      subject: true,
      kidpackage: true,
    },
  });

  // Return the unique pairs as objects
  return assignedSubjects.map(item => ({
    package: item.packageType,
    subject: item.subject,
    isKid: item.kidpackage,
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
