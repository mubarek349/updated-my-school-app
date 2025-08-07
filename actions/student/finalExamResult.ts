"use server";
import prisma from "@/lib/db";
import { correctExamAnswer } from "./question";

export async function registerFinalExam(studentId: number, packageId: string) {
  try {
    // 1. Check if a registration for this student and package already exists
    const existingRegistration = await prisma.finalExamResult.findFirst({
      where: {
        studentId: studentId,
        packageId: packageId,
      },
    });

    if (!existingRegistration) {
      // 2. If no existing registration, create a new one
      const newRegistration = await prisma.finalExamResult.create({
        data: {
          studentId: studentId,
          packageId: packageId,
          startingTime: new Date(), // Record the current date and time of registration
        },
      });

      return newRegistration;
    }

    // If a registration already exists, throw an error or return a specific status
    console.log(
      "Students final exam is already registered for this exam package."
    );
    return;
  } catch (error) {
    console.error("Error registering final exam:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function updateEndingExamTime(
  studentId: number,
  packageId: string
) {
  try {
    // 1. Check if a registration for this student and package already exists
    const res = (await correctExamAnswer(packageId, studentId))?.result?.score;

    if (!res) {
      return undefined;
    }
    const score = res * 100;
    const existingRegistration = await prisma.finalExamResult.findFirst({
      where: {
        studentId: studentId,
        packageId: packageId,
      },
      select: {
        id: true,
        updationProhibited: true,
      },
    });

    if (existingRegistration) {
      // 2. If no existing registration, create a new one
      if (existingRegistration.updationProhibited === false) {
        const updateEndingExamTime = await prisma.finalExamResult.update({
          where: {
            id: existingRegistration.id,
          },
          data: {
            endingTime: new Date(),
            result: score + "% በትክከል መልሰዋል", // Record the current date and time of registration
          },
        });

        return updateEndingExamTime;
      } else {
        console.log(
          "this final exam of the package for this Student can not be updated"
        );
      }
    }

    // If a registration already exists, throw an error or return a specific status
    console.log("there is no Students final exam registered on this package");
    return;
  } catch (error) {
    console.error("Error registering final exam:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function checkFinalExamCreation(
  studentId: number,
  packageId: string
) {
  try {
    // 1. Check if a registration for this student and package already exists
    const updateProhibibted = await prisma.finalExamResult.findFirst({
      where: {
        studentId: studentId,
        packageId: packageId,
      },
      select: {
        id: true,
        updationProhibited: true,
      },
    });
    if (!updateProhibibted) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("update prohibted errror", error);
    return false; // Re-throw the error to be handled by the caller
  }
}
export async function checkingUpdateProhibition(
  studentId: number,
  packageId: string
) {
  try {
    // 1. Check if a registration for this student and package already exists
    const updateProhibibted = await prisma.finalExamResult.findFirst({
      where: {
        studentId: studentId,
        packageId: packageId,
      },
      select: {
        id: true,
        updationProhibited: true,
      },
    });

    if (updateProhibibted?.updationProhibited === true) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("update prohibted errror", error);
    return false; // Re-throw the error to be handled by the caller
  }
}
export async function settingUpdateProhibition(
  studentId: number,
  coursesPackageId: string
) {
  try {
    // 1. Check if a registration for this student and package already exists
    const updateProhibibted = await prisma.finalExamResult.findFirst({
      where: {
        studentId: studentId,
        packageId: coursesPackageId,
      },
      select: {
        id: true,
      },
    });
    if (updateProhibibted) {
      const settedUpdateProhibibted = await prisma.finalExamResult.update({
        where: {
          id: updateProhibibted.id,
        },
        data: {
          updationProhibited: true,
        },
      });
      return settedUpdateProhibibted.updationProhibited;
    } else {
      return false;
    }
  } catch (error) {
    console.error("update prohibted errror", error);
    return false; // Re-throw the error to be handled by the caller
  }
}
