// hooks/useExamState.ts
import { useState, useEffect, useCallback } from "react";

// FLAG: Interface Definitions
interface QuestionOption {
  id: string;
  option: string;
}

export interface Question {
  id: string;
  question: string;
  questionOptions: QuestionOption[];
}

// Type for the answers state: a dictionary where keys are question IDs and values are arrays of answer IDs
interface AnswersState {
  [questionId: string]: string[];
}

// FLAG: New: Type for flagged questions state
interface FlaggedState {
  [questionId: string]: boolean;
}

// FLAG: Hook Return Type Interface
interface ExamStateHook {
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  answers: AnswersState;
  handleAnswerChange: (questionId: string, answerIds: string[]) => void; // Correctly accepts string[]
  goToQuestion: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  getQuestionStatus: (index: number) => "answered" | "unanswered";
  getOverallProgress: () => {
    answered: number;
    unanswered: number;
    total: number;
  };
  totalQuestions: number;
  // FLAG: New: Flagged questions state and toggle function
  flaggedQuestions: FlaggedState;
  toggleFlagged: (questionId: string) => void;
}

const useExamState = (
  questions: Question[],
  initialAnswers: AnswersState = {} // Expect initial answers as { [questionId: string]: string[] }
): ExamStateHook => {
  // FLAG: State Initialization
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers); // Initialize with fetched answers
  // FLAG: New: State for flagged questions
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedState>({});

  // FLAG: Effect for Initial Answers Sync
  // Effect to update answers if initialAnswers change (e.g., after fetching)
  useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex] || null;

  // FLAG: Core Answer Change Logic
  // FIX: handleAnswerChange now correctly receives the full array of selected answer IDs from QuestionDisplay
  const handleAnswerChange = useCallback(
    (questionId: string, answerIds: string[]) => {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [questionId]: answerIds, // Directly set the array of selected answer IDs
      }));
    },
    [] // Dependencies for useCallback
  );

  // FLAG: New: Toggle Flagged State Function
  const toggleFlagged = useCallback((questionId: string) => {
    setFlaggedQuestions((prevFlagged) => ({
      ...prevFlagged,
      [questionId]: !prevFlagged[questionId], // Toggle the boolean value
    }));
  }, []);

  // FLAG: Navigation Functions
  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentQuestionIndex(index);
      }
    },
    [totalQuestions] // Dependencies for useCallback
  );

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prevIndex) =>
      Math.min(prevIndex + 1, totalQuestions - 1)
    );
  }, [totalQuestions]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  }, []);

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // FLAG: Question Status Determination
  const getQuestionStatus = useCallback(
    (index: number) => {
      const question = questions[index];
      if (!question) return "unanswered";
      // A question is "answered" if it has at least one selected answer
      return answers[question.id] && answers[question.id].length > 0
        ? "answered"
        : "unanswered";
    },
    [answers, questions] // Dependencies for useCallback
  );

  // FLAG: Overall Progress Calculation
  const getOverallProgress = useCallback(() => {
    let answered = 0;
    questions.forEach((question) => {
      if (answers[question.id] && answers[question.id].length > 0) {
        answered++;
      }
    });
    const unanswered = totalQuestions - answered;
    return { answered, unanswered, total: totalQuestions };
  }, [answers, questions, totalQuestions]); // Dependencies for useCallback

  // FLAG: Hook Return Object
  return {
    currentQuestionIndex,
    currentQuestion,
    answers,
    handleAnswerChange, // No cast needed now, as implementation matches interface
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    isFirstQuestion,
    isLastQuestion,
    getQuestionStatus,
    getOverallProgress,
    totalQuestions,
    // FLAG: New: Return flagged state and toggle function
    flaggedQuestions,
    toggleFlagged,
  };
};

export default useExamState;
