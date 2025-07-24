// Your page.jsx
"use client";
import { getQuestionForActivePackageFinalExam } from "@/actions/student/test";
import FinalExamForm from "@/components/custom/student/FinalExamForm";
import useAction from "@/hooks/useAction";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  // Renamed from 'page' to 'Page' for React component naming convention
  const params = useParams();
  const wdt_ID = Number(params.wdt_ID);
  const coursesPackageId = String(params.coursesPackageId);

  // Assuming getQuestionForActivePackageFinalExam returns an object like { coursesPackage: { questions: [...] } }
  const [data, refetch, isLoading] = useAction(
    getQuestionForActivePackageFinalExam,
    [
      true,
      (response) => {
        if (response === false) {
          alert("እባክዎ ማጠቃለያ ፈተናውን ለመውሰድ ቅድሚያ ትምህርቱን ይጨርሱ፡፡");
        }
        console.log("API Response:", response);
      },
    ], // Log response here
    wdt_ID,
    coursesPackageId
  );

  // --- Loading, Error, and No Data States ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">የፈተና ጥያቄዎችን በማቅረብ ላይ ነው...</p>
      </div>
    );
  }

  // Ensure data structure is correct before passing
  if (
    !data ||
    !data.coursesPackage ||
    !Array.isArray(data.coursesPackage.questions) ||
    data.coursesPackage.questions.length === 0
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            የፈተና ዳታ አልተገኘም
          </h2>
          <p className="text-gray-700">
            ለዚህ ፈተና ምንም አይነት ጥያቄ ማግኘት አልተቻለም። እባክዎ ቆይተው እንደገና ይሞክሩ።
          </p>
          <button
            onClick={refetch}
            className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            እንደ አዲስ ለመሞከር
          </button>
        </div>
      </div>
    );
  }

  // Add a 'number' property to each question for display
  const questionsWithNumbers = data.coursesPackage.questions.map(
    (q, index) => ({
      ...q,
      number: index + 1,
    })
  );
  const feedback = data.answerCorrection || {};
  const updateProhibition = data.updateProhibition || false;
  return (
    <FinalExamForm
      coursesPackage={{
        questions: questionsWithNumbers, // Pass the augmented questions
      }}
      wdt_ID={wdt_ID}
      coursesPackageId={coursesPackageId}
      examDurationMinutes={data?.coursesPackage?.examDurationMinutes ?? 0}
      feedback={feedback}
      updateProhibition={updateProhibition}
      refresh={refetch}
    />
  );
}

export default Page;
