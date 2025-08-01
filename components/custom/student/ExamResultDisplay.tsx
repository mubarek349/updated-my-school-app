// components/custom/student/ExamResultDisplay.tsx
import { checkingUpdateProhibition } from "@/actions/student/finalExamResult";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface QuestionOption {
  id: string;
  option: string;
}

interface Question {
  id: string;
  question: string;
  questionOptions: QuestionOption[];
}

interface Feedback {
  studentResponse?: Record<string, string[]>;
  questionAnswers?: Record<string, string[]>;
  result?: { score: number; correct: number; total: number };
}

interface ExamResultDisplayProps {
  feedback: Feedback;
  questions: Question[];
  wdt_ID: number;
  coursesPackageId: string;
  setIsExamSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  isFinalExamCreated: boolean;
}

const ExamResultDisplay: React.FC<ExamResultDisplayProps> = ({
  feedback,
  questions,
  wdt_ID,
  coursesPackageId,
  setIsExamSubmitted,
  isFinalExamCreated,
}) => {
  const { studentResponse, questionAnswers, result } = feedback;
  const [isClosedForUpdate, setIsClosedForUpdate] = useState(false);

  useEffect(() => {
    (async () => {
      if (isFinalExamCreated === false) {
        setIsExamSubmitted(false);
      } else {
        setIsClosedForUpdate(
          await checkingUpdateProhibition(wdt_ID, coursesPackageId)
        );
      }
      setTimeout(() => {
        if (isClosedForUpdate === false) {
          setIsExamSubmitted(false);
        }
      }, 20000);
    })();
  }, [
    coursesPackageId,
    wdt_ID,
    isFinalExamCreated,
    setIsExamSubmitted,
    isClosedForUpdate,
  ]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <p className="text-gray-700">
          No results to display. Please ensure the exam was submitted correctly.
        </p>
      </div>
    );
  }

  const scorePercentage = (result.score * 100).toFixed(2);
  const router = useRouter();
  return (
    // Main container: full height, light gray background, generous padding
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans flex justify-center items-start overflow-auto">
      {/* Content Card: white background, rounded corners, shadow, max-width for readability, auto margins for centering */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg mb-6 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-4 text-center">
          የማጠቃለያ ፈተና ውጤትዎ
        </h2>
        <div className="text-center mb-6 border-b pb-4 border-gray-200">
          <p className="text-lg sm:text-xl font-semibold text-gray-800">
            ያገኙት ነጥብ : {result.correct} / {result.total}
          </p>
          <p
            className={`text-xl sm:text-2xl font-bold ${
              result.score >= 0.75 ? "text-green-600" : "text-red-600"
            } mt-1`}
          >
            ያገኙት በፐርሰንት: {scorePercentage}%
          </p>
          <p
            className={`mt-2 text-xl sm:text-2xl font-bold ${
              result.score >= 0.75 ? "text-green-600" : "text-red-600"
            }`}
          >
            {result.score >= 0.75
              ? "እንኩዋን ደስ አለዎት! የማጠቃለያ ፈተናውን አልፈዋል፡፡"
              : "የማጠቃለያ ፈተናውን ወድቀዋል፡፡"}
          </p>
        </div>

        {isClosedForUpdate === true ? (
          <div>
            <div className="flex justify-between">

            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 mt-2">
              የጥያቄዎቹ ማረሚያ
            </h3>
            <Button
            className="mt-2 mb-4"
              onClick={() => {
                router.push(`/en/student/${wdt_ID}/certificates/${coursesPackageId}`);
              }}
            >
              ወደ ሰርተፍኬት ገጽ
            </Button>
            </div>
            {/* Iterate through each question to display its details */}

            {questions.map((question, index) => {
              const studentAns = studentResponse?.[question.id] || [];
              const correctAns = questionAnswers?.[question.id] || [];

              // Determine if the student's answer(s) are entirely correct
              const isCorrect =
                studentAns.length === correctAns.length &&
                studentAns.every((ans) => correctAns.includes(ans));

              // Apply dynamic background and border colors based on correctness
              const bgColor = isCorrect ? "bg-green-50" : "bg-red-50";
              const borderColor = isCorrect
                ? "border-green-300"
                : "border-red-300";

              return (
                <div
                  key={question.id}
                  className={`p-4 sm:p-5 mb-4 rounded-lg border-l-4 ${bgColor} ${borderColor} shadow-sm`}
                >
                  <p className="font-semibold text-base sm:text-lg mb-2">
                    Q{index + 1}: {question.question}
                  </p>
                  <ul className="list-disc ml-6 mb-3 text-gray-700 text-sm sm:text-base">
                    {question.questionOptions.map((option) => (
                      <li
                        key={option.id}
                        className={
                          // Styling logic for options: correct & selected, correct & not selected, incorrect & selected, or just an option
                          correctAns.includes(option.id) &&
                          studentAns.includes(option.id)
                            ? "text-green-700 font-medium"
                            : correctAns.includes(option.id) &&
                              !studentAns.includes(option.id)
                            ? "text-blue-700 font-medium" // Correct but not selected by student
                            : !correctAns.includes(option.id) &&
                              studentAns.includes(option.id)
                            ? "text-red-700 line-through" // Incorrectly selected by student
                            : "text-gray-600" // Other options
                        }
                      >
                        {option.option}
                        {correctAns.includes(option.id) && " (ትክክለኛው መልስ)"}
                        {studentAns.includes(option.id) &&
                          !correctAns.includes(option.id) &&
                          " (እርስዎ የተሳሳቱት)"}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs sm:text-sm text-gray-800 mt-3">
                    እርስዎ የመለሱት:{" "}
                    {studentAns.length > 0
                      ? studentAns
                          .map(
                            (id) =>
                              question.questionOptions.find(
                                (opt) => opt.id === id
                              )?.option || id
                          )
                          .join(", ")
                      : "No Answer Selected"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-800">
                    ትክክለኛው መልስ:{" "}
                    {correctAns.length > 0
                      ? correctAns
                          .map(
                            (id) =>
                              question.questionOptions.find(
                                (opt) => opt.id === id
                              )?.option || id
                          )
                          .join(", ")
                      : "No Correct Answer Defined"}
                  </p>
                  <p
                    className={`mt-2 text-sm sm:text-md font-semibold ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    መልሱን የማግኘትዎ ሁኔታ: {isCorrect ? "አግኝተውታል" : "አላገኙትም"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              ፈተናዎ ተቀምጧል፡፡ ያገኙት መልስ ለኡስታዞዎ የሚያስደስት ስላልሆነ እባክዎትን ደግመው በመስራት አሻሽለው
              ኡስታዝዎን ያስደስቱ:: ፈተናው ዳግመኛ ሊቀርብለዎት ነው ይጥብቁ::
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResultDisplay;
