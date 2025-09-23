// components/custom/student/ExamNavigation.tsx
import React from "react";
import { Question } from "@/hooks/useExamState"; // Import the Question interface
// FLAG: Icon for Flagged Questions in Navigation
import { Flag } from "lucide-react"; // Assuming you have lucide-react or similar icon library

interface ExamNavigationProps {
  questions: Question[];
  goToQuestion: (index: number) => void;
  // getQuestionStatus now returns 'answered' | 'unanswered' based on the logic in useExamState
  getQuestionStatus: (index: number) => "answered" | "unanswered";
  getOverallProgress: () => {
    answered: number;
    unanswered: number;
    total: number;
  };
  // FLAG: New: Prop for flagged questions
  flaggedQuestions: { [questionId: string]: boolean };
}

const ExamNavigation = ({
  questions,
  goToQuestion,
  getQuestionStatus,
  getOverallProgress,
  // FLAG: New: Destructure flaggedQuestions
  flaggedQuestions,
}: ExamNavigationProps) => {
  const progress = getOverallProgress();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-gray-800">የፈተና አሰሳ</h3>

      {/* FLAG: Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>
            የመለሱት: {progress.answered} / {progress.total}
          </span>
          <span>ያልመለሱት: {progress.unanswered}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${(progress.answered / progress.total) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* FLAG: Question Grid */}
      <div className="grid grid-cols-5 gap-3 overflow-y-auto flex-grow pr-2">
        {questions.map((question, index) => {
          // Use 'question' variable here to access question.id
          const status = getQuestionStatus(index);
          // FLAG: Check if the current question is flagged
          const isFlagged = flaggedQuestions[question.id]; // Access by question.id

          const baseClasses =
            "w-10 h-10 flex items-center justify-center rounded-md font-semibold text-sm cursor-pointer transition-colors duration-200 relative"; // Added relative for flag icon positioning
          let statusClasses = "";

          if (status === "answered") {
            statusClasses = "bg-green-200 text-green-800 hover:bg-green-300";
          } else {
            statusClasses = "bg-red-200 text-red-800 hover:bg-red-300";
          }

          return (
            <button
              key={question.id} // Use question.id as key for better stability
              onClick={() => goToQuestion(index)}
              className={`${baseClasses} ${statusClasses}`}
            >
              {index + 1}
              {/* FLAG: Display flag icon if question is flagged */}
              {isFlagged && (
                <Flag
                  size={12}
                  fill="currentColor"
                  className="absolute top-0 right-0 text-yellow-600 -mt-1 -mr-1" // Position the flag
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExamNavigation;
