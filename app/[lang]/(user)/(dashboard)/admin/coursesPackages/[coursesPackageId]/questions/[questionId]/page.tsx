import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FinalQuestionUpdateForm from "@/components/custom/admin/final-question-update-form";

const QuestionUpdatePage = async ({
  params,
}: {
  params: Promise<{
    coursesPackageId: string;
    questionId: string;
  }>;
}) => {
  const { coursesPackageId, questionId } = await params;
  // Fetch the question with options and answers
  const questionToUpdate = await prisma.question.findUnique({
    where: { id: questionId, packageId: coursesPackageId },
    include: {
      questionOptions: {
        select: {
          id: true,
          option: true,
        },
      },
      questionAnswer: {
        select: {
          id: true,
          answer: { select: { option: true } },
        },
      },
    },
  });

  if (!questionToUpdate) {
    return redirect("/en");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto overflow-y-auto">
      <Link
        href={`/en/admin/coursesPackages/${coursesPackageId}/questions`}
        className="flex items-center text-sm hover:opacity-75 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Questions
      </Link>
      <h1 className="text-2xl font-bold mb-4">Update Question</h1>
      <div>
        <FinalQuestionUpdateForm
          coursesPackageId={coursesPackageId}
          initialData={questionToUpdate}
          questionId={questionId}
          questionOptions={questionToUpdate.questionOptions.map(
            (option) => option.option
          )}
          questionAnswer={questionToUpdate.questionAnswer.map(
            (answer) => answer.answer.option
          )}
        />
      </div>
    </div>
  );
};

export default QuestionUpdatePage;
