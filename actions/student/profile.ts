"use server";

import prisma from "@/lib/db";
import { getAvailablePacakges } from "./package";
import { correctExamAnswer } from "./question";
import { checkingUpdateProhibition } from "./finalExamResult";
import { getProgressPercent } from "../admin/analysis";

export default async function getProfile(studentId: number) {
  try {
    const studentProfile = await prisma.wpos_wpdatatable_23.findFirst({
      where: { wdt_ID: studentId },
      select: {
        wdt_ID: true,
        name: true,
        phoneno: true,
        isKid: true,
        status: true,
        subject: true,
        package: true,
        youtubeSubject: true,
        activePackage: {
          select: { name: true },
        },
      },
    });

    if (
      !studentProfile ||
      !studentProfile.package ||
      !studentProfile.subject ||
      studentProfile.isKid === null
    ) {
      console.log("No valid student profile found.");
      return null;
    }

    const availablePackages = await getAvailablePacakges(
      studentProfile.package,
      studentProfile.subject,
      studentProfile.isKid
    );

    if (!availablePackages || availablePackages.length === 0) {
      console.log("No available packages found.");
      return null;
    }

    const resultOfCompletedPackage = [];
    const completedPackageNames = [];
    const completedPackageIdss = [];
    const inProgressPackages = [];
    const complationDates = [];

    const totalNumberOfThePackage = availablePackages.length;
    let totalNumberOfCompletedPackage = 0;
    let averageGrade = 0;

    for (const pkg of availablePackages) {
      const packageId = pkg.package.id;
      const packageName = pkg.package.name;

      const studentStatus = await getStudentProgressStatus(
        studentId,
        packageId
      );
      const noOfChapters = studentStatus.noOfChaptersInthePackage;

      const isCompleted = await checkingUpdateProhibition(studentId, packageId);

      if (isCompleted) {
        const result = (await correctExamAnswer(packageId, studentId)).result;
        resultOfCompletedPackage.push(result);
        completedPackageIdss.push(packageId);
        totalNumberOfCompletedPackage += 1;
        averageGrade += result.score * 100;

        const rawDate = await complationDate(studentId, packageId);
        const formattedDate = rawDate
          ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "long",
            }).format(rawDate)
          : "Unknown";

        completedPackageNames.push({ pName: packageName, noOfChapters });
        complationDates.push(formattedDate);
      } else {
        inProgressPackages.push({
          packageId: pkg.package,
          noOfChapters,
          percent: studentStatus.percent,
        });
      }
    }

    averageGrade = totalNumberOfCompletedPackage
      ? averageGrade / totalNumberOfCompletedPackage
      : 0;

    return {
      studentProfile,
      completedPackageIdss,
      completedPackageNames,
      resultOfCompletedPackage,
      inProgressPackages,
      totalNumberOfCompletedPackage,
      totalNumberOfThePackage,
      averageGrade,
      complationDates,
    };
  } catch (err) {
    console.error("Error fetching profile data:", err);
    throw new Error("Failed to fetch student profile.");
  }
}
export async function getStudentProgressStatus(
  studentId: number,
  activePackageId: string
) {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { course: { packageId: activePackageId } },
      select: { id: true },
    });

    const chapterIds = chapters.map((ch) => ch.id);
    const noOfChaptersInthePackage = chapterIds.length;

    const progress = await prisma.studentProgress.findMany({
      where: {
        studentId,
        chapterId: { in: chapterIds },
      },
      select: { isCompleted: true },
    });

    let percent = 0;
    if (progress.length > 0) {
      const completedCount = progress.filter((p) => p.isCompleted).length;
      percent =
        completedCount === chapterIds.length
          ? 99
          : Number(await getProgressPercent(progress, chapterIds.length));
    }
    console.log("progressPercent", { noOfChaptersInthePackage, percent });
    return { noOfChaptersInthePackage, percent };
  } catch (err) {
    throw new Error("Error fetching student progress status.");
  }
}
export async function complationDate(studentId: number, packageId: string) {
  try {
    const result = await prisma.finalExamResult.findFirst({
      where: { studentId, packageId },
      select: { endingTime: true },
    });

    if (!result?.endingTime) {
      throw new Error("No completion date found.");
    }

    return result.endingTime;
  } catch (err) {
    throw new Error("Error fetching completion date.");
  }
}
