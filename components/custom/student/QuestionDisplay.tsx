"use client";
import React, { useEffect, useState } from "react";
import { Flag, FlagOff } from "lucide-react"; // Assuming you have lucide-react or similar icon library
import { cn } from "@/lib/utils";
import { checkingUpdateProhibition } from "@/actions/student/finalExamResult";
// import { Button } from "@/components/ui/button"; // This import was not used, so it's commented out.

// Interface Definitions
interface QuestionOption {
  id: string;
  option: string;
}

interface Question {
  id: string;
  question: string;
  questionOptions: QuestionOption[];
}

// Component Props Interface
interface QuestionDisplayProps {
  question: Question | null;
  selectedAnswer: string[]; // This is now an array of selected answer IDs
  onAnswerChange: (questionId: string, answerIds: string[]) => void; // Expects an array
  onNext: () => void;
  onPrevious: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  isFlagged: boolean;
  onToggleFlag: (questionId: string) => void;
  onSubmitExam: React.Dispatch<React.SetStateAction<boolean>>; // New prop for submitting the exam
  studentId: number;
  coursesPackageId: string;
}

const QuestionDisplay = ({
  question,
  selectedAnswer,
  onAnswerChange,
  onNext,
  onPrevious,
  isFirstQuestion,
  isLastQuestion,
  isSubmitting,
  isFlagged,
  onToggleFlag,
  onSubmitExam, // Destructure the new prop
  studentId,
  coursesPackageId,
}: QuestionDisplayProps) => {
  // No Question State
  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-[300px] p-4 bg-white rounded-2xl shadow-xl border border-gray-200 text-gray-600 text-lg font-medium">
        No question to display.
      </div>
    );
  }

  // Checkbox Change Handler
  const handleCheckboxChange = (optionId: string) => {
    const currentSelected = selectedAnswer;
    let updatedSelection: string[];

    if (currentSelected.includes(optionId)) {
      updatedSelection = currentSelected.filter((id) => id !== optionId);
    } else {
      updatedSelection = [...currentSelected, optionId];
    }
    onAnswerChange(question.id, updatedSelection);
  };

  const [update, setUpdate] = useState(false);

  useEffect(() => {
    const updating = async () => {
      try {
        const value = await checkingUpdateProhibition(
          studentId,
          coursesPackageId
        );

        setUpdate(value);
      } catch {
        alert("there is problem");
      }
    };
    updating();
  }, []);

  // Main Render Section
  return (
    <div className="font-inter p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 leading-tight pr-4">
          {question.question}
        </h2>
        {/* Flag Button */}
        <button
          onClick={() => onToggleFlag(question.id)}
          className={`flex-shrink-0 p-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              isFlagged
                ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 ring-yellow-300"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 ring-gray-300"
            }`}
          title={isFlagged ? "Unflag for review" : "Flag for review"}
          disabled={isSubmitting}
        >
          {isFlagged ? (
            <Flag size={24} fill="currentColor" />
          ) : (
            <FlagOff size={24} />
          )}
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {question.questionOptions.map((option) => (
          <label
            key={option.id}
            className={`relative block p-4 rounded-lg border transition-all duration-200 ease-in-out cursor-pointer
              ${
                selectedAnswer.includes(option.id)
                  ? "bg-blue-100 border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
          >
            <input
              type="checkbox"
              name={question.id}
              value={option.id}
              checked={selectedAnswer.includes(option.id)}
              onChange={() => handleCheckboxChange(option.id)}
              className="absolute opacity-0 peer" // Hide default checkbox
              disabled={isSubmitting}
            />
            <div className="flex items-center">
              {/* Custom Checkbox Indicator */}
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ease-in-out
                ${
                  selectedAnswer.includes(option.id)
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300 peer-hover:border-blue-400"
                }`}
              >
                {selectedAnswer.includes(option.id) && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="ml-4 text-lg text-gray-700 font-medium select-none">
                {option.option}
              </span>
            </div>
          </label>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={onPrevious}
          disabled={isFirstQuestion || isSubmitting}
          // Removed 'hidden' class, now relies solely on 'disabled' for better UX
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          ⬅️ ቀዳሚ
        </button>
        {isLastQuestion ? (
          <button
            onClick={() => {
              
              onSubmitExam(true);}} // Call the new onSubmitExam prop
            disabled={isSubmitting || update}
            className={cn(
              "flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/40 hover:shadow-xl"
            )}
          >
            ጨርስ
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/40 hover:shadow-xl"
          >
            ቀጣይ ➡️
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionDisplay;
