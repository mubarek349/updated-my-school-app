"use server";

import prisma from "@/lib/db";

type CreateQuestionPayload = {
  title: string;
  options: string[];
  answers: string[];
};

export async function createQuestion(
  chapterId: string,
  { title, options, answers }: CreateQuestionPayload
) {
  try {
    if (
      !title ||
      !Array.isArray(options) ||
      options.length < 2 ||
      !Array.isArray(answers) ||
      answers.length < 1
    ) {
      return { error: "Invalid data", status: 400 };
    }

    const createdQuestion = await prisma.question.create({
      data: {
        chapterId,
        question: title,
        questionOptions: {
          create: options.map((option) => ({ option })),
        },
      },
      include: { questionOptions: true },
    });

    const correctOptions = createdQuestion.questionOptions.filter((opt) =>
      answers.includes(opt.option)
    );

    await Promise.all(
      correctOptions.map((opt) =>
        prisma.questionAnswer.create({
          data: {
            questionId: createdQuestion.id,
            answerId: opt.id,
          },
        })
      )
    );

    return {
      data: createdQuestion,
      message: "Question created successfully",
      status: 200,
    };
  } catch (error) {
    console.error("[createQuestion]", error);
    return { error: "Failed to create question", status: 500 };
  }
}
export async function createPackageQuestion(
  packageId: string,
  { title, options, answers }: CreateQuestionPayload
) {
  try {
    if (
      !title ||
      !Array.isArray(options) ||
      options.length < 2 ||
      !Array.isArray(answers) ||
      answers.length < 1
    ) {
      return { error: "Invalid data", status: 400 };
    }

    const createdQuestion = await prisma.question.create({
      data: {
        packageId,
        question: title,
        questionOptions: {
          create: options.map((option) => ({ option })),
        },
      },
      include: { questionOptions: true },
    });

    const correctOptions = createdQuestion.questionOptions.filter((opt) =>
      answers.includes(opt.option)
    );

    await Promise.all(
      correctOptions.map((opt) =>
        prisma.questionAnswer.create({
          data: {
            questionId: createdQuestion.id,
            answerId: opt.id,
          },
        })
      )
    );

    return {
      data: createdQuestion,
      message: "Question created successfully",
      status: 200,
    };
  } catch (error) {
    console.error("[createQuestion]", error);
    return { error: "Failed to create question", status: 500 };
  }
}

export async function getQuestion(questionId: string) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        questionOptions: true,
        questionAnswer: true,
      },
    });

    return { data: question, status: 200 };
  } catch (error) {
    console.error("[getQuestion]", error);
    return { error: "Failed to fetch the question", status: 500 };
  }
}

export async function updateQuestion(
  questionId: string,
  payload: {
    question: string;
    options: string[];
    answer: string[];
  }
) {
  try {
    const { question, options, answer } = payload;

    if (!question || options.length < 2 || answer.length < 1) {
      return { error: "Invalid data", status: 400 };
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        question,
        questionOptions: {
          deleteMany: {}, // Clear old options
          create: options.map((option) => ({ option })),
        },
      },
      include: { questionOptions: true },
    });

    await prisma.questionAnswer.deleteMany({ where: { questionId } });

    const answerLinks = updated.questionOptions
      .filter((opt) => answer.includes(opt.option))
      .map((opt) =>
        prisma.questionAnswer.create({
          data: { questionId: updated.id, answerId: opt.id },
        })
      );

    await Promise.all(answerLinks);

    return { data: updated, status: 200 };
  } catch (error) {
    console.error("[updateQuestion]", error);
    return { error: "Failed to update the question", status: 500 };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    if (!questionId) {
      return { error: "Question ID is required", status: 400 };
    }

    await prisma.questionAnswer.deleteMany({ where: { questionId } });
    await prisma.questionOption.deleteMany({ where: { questionId } });

    const deleted = await prisma.question.delete({
      where: { id: questionId },
    });

    return {
      data: deleted,
      message: "Question deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error("[deleteQuestion]", error);
    return { error: "Failed to delete the question", status: 500 };
  }
}


export async function assignQuestionToPackage(
  questionId: string,
  coursesPackageId: string
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question || !question.question) {
      return { error: 'Question not found or missing title', status: 404 };
    }

    // Check if question is already assigned to this package
    const isCurrentlyAssigned = question.packageId === coursesPackageId;
    
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        packageId: isCurrentlyAssigned ? null : coursesPackageId,
        studentQuiz: {
          deleteMany: {
            questionId,
          },
        },
      },
    });

    const action = isCurrentlyAssigned ? 'removed from' : 'assigned to';
    return {
      data: updatedQuestion,
      message: `Question ${action} package successfully`,
      status: 200,
    };
  } catch (error) {
    console.error('[assignQuestionToPackage]', error);
    return { error: 'Internal Error', status: 500 };
  }
}


export async function unpublishQuestionFromPackage(questionId: string) {
  try {
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: { packageId: null },
    });

    return {
      data: updatedQuestion,
      message: 'Question unpublished from package',
      status: 200,
    };
  } catch (error) {
    console.error('[unpublishQuestionFromPackage]', error);
    return { error: 'Internal Error', status: 500 };
  }
}
