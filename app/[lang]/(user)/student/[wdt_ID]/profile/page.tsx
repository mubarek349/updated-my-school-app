"use client";
import getProfile from "@/actions/student/profile";
import { Button } from "@/components/ui/button";
import useAction from "@/hooks/useAction";
import { useParams, useRouter } from "next/navigation";
import React from "react";

let gradeData = {
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
  const router = useRouter();
  return (
    <div className="h-full w-full flex items-center justify-center py-8 px-2 overflow-auto">
      <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-2xl">
        <div className="overflow-x-auto p-6">
          {/* Active Package Table */}
          <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-200">
            አሁን ላይ የሚማሩት
          </h2>
          <table className="w-full text-left rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700 mb-8">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  የኮርስ ጥቅል
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                  ውጤት
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  አስተያየት
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/30">
                <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                  {activeCourse.course}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 text-sm font-bold rounded-full `}>
                    {activeCourse.grade}
                  </span>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                  {activeCourse.remarks}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Last Learned Courses Table */}
          <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-200">
            ያጠናቀቋቸው የኮርስ ጥቅሎች
          </h2>
          <table className="w-full text-left rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  የኮርስ ጥቅል
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                  ውጤት
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  አስተያየት
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  ሰርተፍኬ
                </th>
              </tr>
            </thead>
            <tbody>
              {lastLearnedCourses.map((course, idx) => (
                <tr
                  key={idx}
                  className={`border-t border-gray-200 dark:border-gray-700 ${
                    idx % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-900/30"
                      : "bg-white dark:bg-gray-800"
                  }`}
                >
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                    {course.course}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 text-sm font-bold rounded-full `}
                    >
                      {course.grade}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                    {course.remarks}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                    <Button
                      onClick={() => {
                        router.push(course.url);
                      }}
                    >
                      {" "}
                      ወደ ሰርተፍኬት ገጽ
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Page;
