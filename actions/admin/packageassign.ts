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
    distinct: ["package", "subject"],
  });
  return result;
}

export async function assignPackage(
  coursesPackageId: string,
  isKid: boolean,
  selectedStudentPackagewithSubjects: { package: string; subject: string }[]
) {
  // Update wpos_wpdatatable_23 for each subject/package pair
  for (const { package: pkg, subject } of selectedStudentPackagewithSubjects) {
    await prisma.wpos_wpdatatable_23.updateMany({
      where: {
        package: pkg,
        subject: subject,
        isKid: isKid,
        youtubeSubject: null, // Ensure we only update those without a package assigned
      },
      data: {
        youtubeSubject: coursesPackageId,
      },
    });

    // Check if the subject is already assigned to a package
    const existingPackage = await prisma.subjectPackage.findFirst({
      where: {
        subject: subject,
        packageType: pkg,
        kidpackage: isKid,
        packageId: coursesPackageId,
      },
      select: {
        id: true,
        packageId: true,
        subject: true,
        packageType: true,
        kidpackage: true,
      },
    });

    if (existingPackage) {
      // Update the packageId if needed
      await prisma.subjectPackage.update({
        where: {
          id: existingPackage.id,
          packageType: existingPackage.packageType,
          subject: existingPackage.subject,
          kidpackage: existingPackage.kidpackage,
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
          packageType: pkg,
          kidpackage: isKid,
          packageId: coursesPackageId,
        },
      });
    }
  }

  return { response: "successfully assigned" };
}

export async function getAssignedPacakgesWithSubjects(
  coursesPackageId: string
) {
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
  return assignedSubjects.map((item) => ({
    package: item.packageType,
    subject: item.subject,
    isKid: item.kidpackage,
  }));
}
export async function getAvailablePacakges(
  packageType: string,
  subject: string,
  kidpackage: boolean
) {
  const assignedPackages = await prisma.subjectPackage.findMany({
    where: {
      packageType: packageType,
      subject: subject,
      kidpackage: kidpackage,
    },
    select: {
      packageId: true,
    },
  });

  // Return the unique pairs as objects
  return assignedPackages;
}
export async function unAssignMultiplePackage(
  coursesPackageId: string,
  isKid: boolean,
  selectedStudentPackagewithSubjects: { package: string; subject: string }[]
) {
  // Update wpos_wpdatatable_23 for each subject/package pair
  for (const { package: pkg, subject } of selectedStudentPackagewithSubjects) {
    // Check if the subject is already assigned to a package
    const existingPackage = await prisma.subjectPackage.findFirst({
      where: {
        subject: subject,
        packageType: pkg,
        kidpackage: isKid,
        packageId: coursesPackageId,
      },
      select: {
        id: true,
        packageId: true,
        subject: true,
        packageType: true,
        kidpackage: true,
      },
    });

    if (existingPackage) {
      // Update the packageId if needed
      await prisma.subjectPackage.delete({
        where: {
          id: existingPackage.id,
          packageType: existingPackage.packageType,
          subject: existingPackage.subject,
          kidpackage: existingPackage.kidpackage,
        },
      });
    }
    // Check if the subject is still assigned to another package
    const AssignedExistingPackage = await prisma.subjectPackage.findFirst({
      where: {
        subject: subject,
        packageType: pkg,
        kidpackage: isKid,
      },
      select: {
        id: true,
        packageId: true,
        subject: true,
        packageType: true,
        kidpackage: true,
      },
    });

    if (!AssignedExistingPackage) {
      // Update wpos_wpdatatable_23 to remove the package assignment
      await prisma.wpos_wpdatatable_23.updateMany({
        where: {
          package: pkg,
          subject: subject,
          isKid: isKid,
        },
        data: {
          youtubeSubject: null, // Remove the package assignment
        },
      });
    } else {
      // If the subject is still assigned to another package, do not remove it
      await prisma.wpos_wpdatatable_23.updateMany({
        where: {
          package: pkg,
          subject: subject,
          isKid: isKid,
        },
        data: {
          youtubeSubject: AssignedExistingPackage.packageId, // Keep the current package assignment
        },
      });
    }
  }

  return { response: "successfully unAssigned" };
}
export async function unAssignPackage(
  coursesPackageId: string,
  isKid: boolean,
  packageType: string,
  subject: string
) {
  // Check if the subject is already assigned to a package
  const existingPackage = await prisma.subjectPackage.findFirst({
    where: {
      subject: subject,
      packageType: packageType,
      kidpackage: isKid,
      packageId: coursesPackageId,
    },
    select: {
      id: true,
      packageId: true,
      subject: true,
      packageType: true,
      kidpackage: true,
    },
  });

  if (existingPackage) {
    // Update the packageId if needed
    await prisma.subjectPackage.delete({
      where: {
        id: existingPackage.id,
        packageType: existingPackage.packageType,
        subject: existingPackage.subject,
        kidpackage: existingPackage.kidpackage,
      },
    });
  }
  // Check if the subject is still assigned to another package
  const AssignedExistingPackage = await prisma.subjectPackage.findFirst({
    where: {
      subject: subject,
      packageType: packageType,
      kidpackage: isKid,
    },
    select: {
      id: true,
      packageId: true,
      subject: true,
      packageType: true,
      kidpackage: true,
    },
  });

  if (!AssignedExistingPackage) {
    // Update wpos_wpdatatable_23 to remove the package assignment
    await prisma.wpos_wpdatatable_23.updateMany({
      where: {
        package: packageType,
        subject: subject,
        isKid: isKid,
      },
      data: {
        youtubeSubject: null, // Remove the package assignment
      },
    });
  } else {
    // If the subject is still assigned to another package, do not remove it
    await prisma.wpos_wpdatatable_23.updateMany({
      where: {
        package: packageType,
        subject: subject,
        isKid: isKid,
      },
      data: {
        youtubeSubject: AssignedExistingPackage.packageId, // Keep the current package assignment
      },
    });
  }

  return { response: "successfully unAssigned" };
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
