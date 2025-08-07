// components/custom/student/FinalExamForm.tsx
import React, { useState, useEffect, useCallback } from "react";
import useExamState from "@/hooks/useExamState";
import QuestionDisplay from "./QuestionDisplay";
import ExamNavigation from "./ExamNavigation";
import Timer from "../common/Timer";
import useAction from "@/hooks/useAction";
import {
  correctExamAnswer, // This should fetch results from an API
  examsubmitAnswers, // This should submit answers to an API
} from "@/actions/student/question";
import toast from "react-hot-toast";
import ExamResultDisplay from "./ExamResultDisplay"; // Component for displaying results
import { shuffleArray } from "@/lib/utils"; // Utility for shuffling questions
import {
  checkFinalExamCreation,
  settingUpdateProhibition,
} from "@/actions/student/finalExamResult";

// FLAG: Interface Definitions
interface QuestionOption {
  id: string;
  option: string;
}

interface Question {
  id: string;
  question: string;
  questionOptions: QuestionOption[];
}

interface CoursesPackage {
  questions: Question[];
}

// Re-import Feedback interface from ExamResultDisplay to ensure consistency
// import { Feedback } from "./ExamResultDisplay";
interface Feedback {
  studentResponse?: Record<string, string[]>;
  questionAnswers?: Record<string, string[]>;
  result?: { score: number; correct: number; total: number };
};

interface FinalExamFormProps {
  coursesPackage: CoursesPackage | null;
  wdt_ID: number;
  coursesPackageId: string;
  examDurationMinutes: number;
  // The feedback prop from parent is now explicitly for initial student responses,
  // or it can be removed if FinalExamForm always fetches the full feedback.
  // For now, let's keep it but rely on internal state for display.
  feedback: { studentResponse: { [questionId: string]: string[] } }|undefined;
  updateProhibition: boolean;
  refresh: () => void;
  packageName:string;
}

const FinalExamForm = ({
  coursesPackage,
  wdt_ID,
  coursesPackageId,
  examDurationMinutes,
  updateProhibition,
  refresh,
  packageName,
}: FinalExamFormProps) => {
  // Use a state for questions to allow re-randomization for retakes
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>(
    coursesPackage?.questions || []
  );

  // FLAG: State Management
  const [initialAnswers, setInitialAnswers] = useState<{
    [questionId: string]: string[];
  }>({});
  const [isAnswersLoading, setIsAnswersLoading] = useState(true);
  const [showSubmissionConfirm, setShowSubmissionConfirm] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);

  // NEW STATE: To hold the complete feedback object for display in ExamResultDisplay
  const [displayFeedback, setDisplayFeedback] = useState<Feedback | null>(null);
  const [isFinalExamCreated, setIsFinalExamCreated] = useState(false);

  // FLAG: Data Fetching (Initial Answers and existing feedback)
  useEffect(() => {
    const fetchExistingAnswers = async () => {
      setIsAnswersLoading(true);
      setIsFinalExamCreated(
        await checkFinalExamCreation(wdt_ID, coursesPackageId)
      );

      try {
        // Assume correctExamAnswer returns the full Feedback object as defined in ExamResultDisplay
        const response: Feedback|undefined = await correctExamAnswer(
          coursesPackageId,
          wdt_ID
        )??undefined;
        if (response?.studentResponse) {
          const cleanedAnswers = Object.fromEntries(
            Object.entries(response.studentResponse).map(([qId, ans]) => [
              qId,
              ans || [],
            ])
          );
          setInitialAnswers(cleanedAnswers);
        }
        // If there's existing result/feedback, set it for display
        if (response?.result || response?.questionAnswers) {
          setDisplayFeedback(response);
          // Also set isExamSubmitted to true if there's an existing result,
          // as this means the exam was already completed.
          if (response.result && response.result.score !== undefined) {
            setIsExamSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch existing answers:", error);
        toast.error("Failed to load previous answers.");
      } finally {
        setIsAnswersLoading(false);
      }
    };

    fetchExistingAnswers();
    // Dependency array: only re-run if exam identifiers change, not on `feedback` prop
    // as we are managing the display feedback internally now.
  }, [coursesPackageId, wdt_ID]);

  // FLAG: Custom Hook Integration
  // Now passes `currentQuestions` (which can be randomized)
  const {
    currentQuestion,
    answers,
    handleAnswerChange: originalHandleAnswerChange,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    isFirstQuestion,
    isLastQuestion,
    getQuestionStatus,
    getOverallProgress,
    flaggedQuestions,
    toggleFlagged,
    // No need for `totalQuestions` if `getOverallProgress` handles it
  } = useExamState(currentQuestions, initialAnswers);

  // FLAG: Action Hook for Submission
  // The success callback now handles post-submission logic (showing results or retake)

  const [, refetchSubmit, submitLoading] = useAction(examsubmitAnswers, [
    ,
    async () => {
      setShowSubmissionConfirm(false);
    },
  ]);

  const handleAnswerChange = (questionId: string, answerIds: string[]) => {
    originalHandleAnswerChange(questionId, answerIds);
  };

  // FLAG: Submit Current Question Answer Logic (Autosave-like)
  const submitCurrentQuestionAnswer =
    useCallback(async (): Promise<boolean> => {
      if (!currentQuestion) {
        return true; // No current question to submit
      }

      const currentQuestionAnswers = answers[currentQuestion.id] || [];
      if (currentQuestionAnswers.length === 0) {
        // No answer selected for the current question, nothing to submit.
        return true;
      }

      try {
        refetchSubmit(
          [
            {
              questionId: currentQuestion.id,
              answerId: currentQuestionAnswers, // Pass the array of selected answer IDs
            },
          ],
          wdt_ID,
          coursesPackageId
        );

        toast.success("መልሱ ተቀምጧል!", {
          style: { background: "#10B981", color: "#fff" },
          duration: 1000,
        });
        return true;
      } catch (e) {
        toast.error("መልሱን ማስቀመጥ ላይ ችግር አለ.", {
          style: { background: "#EF4444", color: "#fff" },
        });
        console.error("መልሱን ማስቀመጥ ላይ ችግር አለ:", e);
        return false;
      }
    }, [currentQuestion, answers, refetchSubmit, wdt_ID, coursesPackageId]);

  const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  };

  // FLAG: Navigation Handlers (with Answer Saving)
  const handleGoToNextQuestion = async () => {
    if (currentQuestion) {
      const newAnswer = answers[currentQuestion.id] || [];

      // Fetch the latest existing answer to compare before submitting
      const response: Feedback|undefined = await correctExamAnswer(
        coursesPackageId,
        wdt_ID
      );
      const existingAnswer =
        response?.studentResponse?.[currentQuestion.id] || [];

      // Only submit if the new answer is different from the saved one
      if (!areArraysEqual(newAnswer, existingAnswer)) {
        await submitCurrentQuestionAnswer();
      }
      goToNextQuestion();
    }
  };

  const handleGoToPreviousQuestion = async () => {
    if (currentQuestion) {
      const newAnswer = answers[currentQuestion.id] || [];
      // Fetch the latest existing answer just before moving to ensure accuracy
      const response: Feedback|undefined = await correctExamAnswer(
        coursesPackageId,
        wdt_ID
      );
      const existingAnswer =
        response?.studentResponse?.[currentQuestion.id] || [];

      // Only submit if the new answer is different from the saved one
      if (!areArraysEqual(newAnswer, existingAnswer)) {
        await submitCurrentQuestionAnswer();
      }
      goToPreviousQuestion();
    }
  };

  // FLAG: Exam Submission Logic
  const handleTimeUp = () => {
    console.log("Time's up! Auto-submitting exam.");
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    // Use `currentQuestions` for the count, not `coursesPackage.questions`
    // This ensures consistency if questions were re-randomized for a retake
    if (!currentQuestions || currentQuestions.length === 0) {
      toast.error("ምንም አይነት የሚቀመጥ ጥያቄ የለም.", {
        style: { background: "#EF4444", color: "#fff" },
      });
      return;
    }

    try {
      const submissionPayload = Object.entries(answers).flatMap(
        ([questionId, answerIds]) => {
          return {
            questionId,
            answerId: answerIds || [], // Pass the array of selected answer IDs
          };
        }
      );

      // Trigger the submission via useAction, which handles success/failure based on score
      refetchSubmit(submissionPayload, wdt_ID, coursesPackageId);

      // Fetch the final result after submission
      const result: Feedback|undefined = await correctExamAnswer(
        coursesPackageId,
        wdt_ID
      );
      if(!result){
        return undefined;
      }
      setDisplayFeedback(result); // Set the full feedback for display

      if (
        result.result &&
        result.result.score !== undefined &&
        result.result.score >= 0.75
      ) {
        await settingUpdateProhibition(wdt_ID, coursesPackageId);
        refresh();
      }

      // Shuffle the questions after the exam has been fully submitted
      // Create a shallow copy to ensure a new array reference for state update
      const shuffledQuestions = shuffleArray([...currentQuestions]);
      setCurrentQuestions(shuffledQuestions);
      setIsFinalExamCreated(true);
      setIsExamSubmitted(true); // Now this correctly triggers the display of ExamResultDisplay with the updated feedback
    } catch (e) {
      toast.error("Failed to submit answers.", {
        style: { background: "#EF4444", color: "#fff" },
      });
      console.error(e);
      // No need to setIsExamSubmitted(true) here, the useAction callback handles it
    }
  };

  // FLAG: Conditional Renderings (Loading/Submitted States)
  if (isAnswersLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-700 text-lg">
            የፓኬጁን ጥያቄዎች ከዚህ በፊት ከሰጡት መልሶቻቸው ጋር በመፈለግ ላይ ነው፡፡
          </p>
        </div>
      </div>
    );
  }

  // Conditional render for submitted state or when displayFeedback is available with a result
  if (
    isExamSubmitted === true ||
    (updateProhibition === true && displayFeedback && displayFeedback.result)
  ) {
    return (
      <ExamResultDisplay
        feedback={displayFeedback || {}} // Pass the internal displayFeedback state
        questions={coursesPackage?.questions || []}
        wdt_ID={wdt_ID}
        coursesPackageId={coursesPackageId}
        setIsExamSubmitted={setIsExamSubmitted}
        isFinalExamCreated={isFinalExamCreated}
      />
    );
  } else {
    // FLAG: Submission Confirmation Modal
    const renderSubmissionConfirmModal = () => {
      const progress = getOverallProgress();
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">መጨረስዎን ማረጋገጫ</h3>
            <p className="mb-2">
              እርስዎ ከዚህ ቡኋላ ምንም ማስተካከል የሚፈልጉት መልስ እንደሌለ እያረጋገጠዎት ነው፡፡ እርግጠኛ ነዎት?
            </p>
            <p className="mb-2">
              የመለሱት: <span className="font-semibold">{progress.answered}</span>{" "}
              / {progress.total}
            </p>
            <p className="mb-2">
              ያልመለሱት:{" "}
              <span className="font-semibold text-red-600">
                {progress.unanswered}
              </span>
            </p>

            {progress.unanswered > 0 && (
              <p className="text-red-500 mb-4 font-medium">
                ማስጠንቀቂያ!! እርስዎ ያልመለሱት መልስ አለ፡፡እባክዎ መልስዎን ይሙሉ፡፡
              </p>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSubmissionConfirm(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                አይ
              </button>
              <button
                onClick={handleSubmitExam}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={submitLoading} // Disable button while submitting
              >
                ኦዎ
              </button>
            </div>
          </div>
        </div>
      );
    };

    // FLAG: Main Component Render (The exam form itself)

    return (
      <div className="min-h-screen h-auto overflow-y-auto bg-gray-100 p-4 font-sans pb-32">
        {showSubmissionConfirm && renderSubmissionConfirmModal()}

        <header className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
            የ {packageName} ማጠቃለያ ፈተና
          </h1>
          <div className="flex items-center space-x-4">
            {!(examDurationMinutes === 0 || examDurationMinutes === null) && (
              <Timer
                totalSeconds={examDurationMinutes * 60}
                onTimeUp={() => {
                  toast("Time's up!", {
                    style: { background: "#F59E0B", color: "#fff" },
                  });
                  handleTimeUp();
                }}
              />
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <main className="md:col-span-2">
            <QuestionDisplay
              question={currentQuestion}
              selectedAnswer={
                currentQuestion ? answers[currentQuestion.id] || [] : []
              }
              onAnswerChange={handleAnswerChange}
              onNext={handleGoToNextQuestion}
              onPrevious={handleGoToPreviousQuestion}
              isFirstQuestion={isFirstQuestion}
              isLastQuestion={isLastQuestion}
              isSubmitting={submitLoading}
              studentId={wdt_ID}
              coursesPackageId={coursesPackageId}
              isFlagged={
                currentQuestion ? flaggedQuestions[currentQuestion.id] : false
              }
              onToggleFlag={toggleFlagged}
              onSubmitExam={setShowSubmissionConfirm}
            />
          </main>

          <aside className="md:col-span-1">
            <ExamNavigation
              questions={currentQuestions}
              goToQuestion={goToQuestion}
              getQuestionStatus={getQuestionStatus}
              getOverallProgress={getOverallProgress}
              flaggedQuestions={flaggedQuestions}
            />
          </aside>
        </div>
      </div>
    );
  }
};

export default FinalExamForm;
