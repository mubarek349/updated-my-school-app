"use client";
import getProfile from "@/actions/student/profile";
import useAction from "@/hooks/useAction";
import { useParams } from "next/navigation";
import React from "react";

let gradeData = { activeCourse: {course:"",grade:"",remarks:""}, lastLearnedCourses: [{course:"",grade:"",remarks:""}] };

const getGradeColor = (grade: string) => {
  if (["A+", "A", "A-"].includes(grade))
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (["B+", "B", "B-"].includes(grade))
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  if (["C+", "C", "C-"].includes(grade))
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  if (["D+", "D", "D-"].includes(grade))
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
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

  if (
    !packageName ||
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

  for (let i = 0; i < packageName.length; i++) {
    gradeData = {
      activeCourse: {
        course: packageName[activePacakgeIndex],
        grade: `${result[activePacakgeIndex].score * 100}%  => ${
          result[activePacakgeIndex].correct
        }/${result[activePacakgeIndex].total}`,
        remarks: `${
          result[activePacakgeIndex].score >= 0.75 ? "Pass" : "Fail"
        }`,
      },
      lastLearnedCourses: [
        {
          course: packageName[i],
          grade: `${result[i].score * 100}%  => ${result[i].correct}/${
            result[i].total
          }`,
          remarks: `${result[i].score >= 0.75 ? "Pass" : "Fail"}`,
        },
      ],
    };
  }

  const { activeCourse, lastLearnedCourses } = gradeData;
 

  return (
    <div className="h-full w-full flex items-center justify-center py-8 px-2 overflow-auto">
      <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-2xl">
        <div className="overflow-x-auto p-6">
          {/* Active Package Table */}
          <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-200">
            Active Package
          </h2>
          <table className="w-full text-left rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700 mb-8">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  Course
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                  Grade
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/30">
                <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                  {activeCourse.course}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(
                      activeCourse.grade
                    )}`}
                  >
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
            Last Learned Courses
          </h2>
          <table className="w-full text-left rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  Course
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                  Grade
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                  Remarks
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
                      className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(
                        course.grade
                      )}`}
                    >
                      {course.grade}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                    {course.remarks}
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
