"use server";

import prisma from "@/lib/db";
import { getAvailablePacakges } from "./package";
import { correctExamAnswer } from "./question";
import { checkingUpdateProhibition } from "./finalExamResult";

export default async function getProfile(studentId: number) {
  // Fetch student profile data from the database
  try{

    const studentProfile = await prisma.wpos_wpdatatable_23.findFirst({
      where: { wdt_ID: studentId },
      select: {
        wdt_ID: true,
        name: true,
        isKid: true,
        status: true,
        subject: true,
        package: true,
        youtubeSubject:true,
        activePackage:{
          select:{
              name:true,
          }
        }
      },
    });
  
    if (
      !studentProfile ||
      !studentProfile?.package ||
      !studentProfile?.subject ||
      studentProfile?.isKid===null
    ) {
      console.log("there is no student");
      return
    }
    const availablePacakges = await getAvailablePacakges(
      studentProfile.package,
      studentProfile.subject,
      studentProfile.isKid
    );
    if (!availablePacakges || availablePacakges.length === 0) {
      console.log("there is no availablepackage");
      return
    }
    let resultOfEachPackage = [];
    let packageNames = [];
    const packageIds = availablePacakges.map((pkg) => pkg.package);
    for (const packageId of packageIds) {
      const result = (await correctExamAnswer(packageId.id, studentId)).result;
      if (await checkingUpdateProhibition(studentId, packageId.id)) {
        resultOfEachPackage.push(result);
        packageNames.push(packageId.name);
      }
    }
    return {
      studentProfile,
      packageNames,
      resultOfEachPackage,
    };
  }catch (error) {
    console.error("Error fetching profile data:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
