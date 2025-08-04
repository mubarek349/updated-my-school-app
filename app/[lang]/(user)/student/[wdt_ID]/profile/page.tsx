"use client";
import getProfile from "@/actions/student/profile";
import Profile from "@/components/custom/student/profile";
import useAction from "@/hooks/useAction";
import { useParams } from "next/navigation";
import React from "react";

const gradeData = {
  activeCourse: { course: "", grade: "-", remarks: "-" },
  lastLearnedCourses: [{ course: "", grade: "", remarks: "", url: "" }],
};

function Page() {
  const params = useParams();
  const studentId = Number(params.wdt_ID);
  const [data] = useAction(
    getProfile,
    [true, (response) => console.log(response)],
    studentId
  );
  // const studentName = data?.studentProfile.name;

  const packageName = data?.packageNames;
  const result = data?.resultOfEachPackage;
  const packageIds = data?.packageIdss;

  if (
    !packageName ||
    !packageIds ||
    !result ||
    packageName.length === 0 ||
    !result ||
    result.length === 0
  ) {
    return;
  }
  const activePacakgeIndex = packageName.findIndex(
    (p) => p === data.studentProfile.activePackage?.name
  );
  gradeData.activeCourse.course = data.studentProfile.activePackage?.name ?? "";
  if (activePacakgeIndex >= 0) {
    gradeData.activeCourse.grade = `${result[activePacakgeIndex].correct}/${
      result[activePacakgeIndex].total
    }  => ${result[activePacakgeIndex].score * 100}%`;
    gradeData.activeCourse.remarks = `${
      result[activePacakgeIndex].score >= 0.75 ? "አልፈዋል" : "ወድቀዋል"
    }`;
  }
  gradeData.lastLearnedCourses = []; // Clear any placeholder

  for (let i = 0; i < packageName.length; i++) {
    gradeData.lastLearnedCourses.push({
      course: packageName[i],
      grade: `${result[i].correct}/${result[i].total} => ${
        result[i].score * 100
      }% `,
      remarks: result[i].score >= 0.75 ? "አልፈዋል" : "ወድቀዋል",
      url: `/en/student/${studentId}/certificates/${packageIds[i]}`,
    });
  }

  const { activeCourse, lastLearnedCourses } = gradeData;
  return (
    <div className="h-dvh w-dvw flex items-center justify-center p-0 m-0 overflow-auto">
      <Profile activeCourse={activeCourse} lastLearnedCourses={lastLearnedCourses} />
    </div>
  );
}

export default Page;
