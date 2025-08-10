'use server';

import prisma from '@/lib/db';

export async function createChapter(
  coursesPackageId: string,
  courseId: string,
  title: string
) {
  try {
    // Step 1: Validate ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Step 2: Get last chapter position
    const lastChapter = await prisma.chapter.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    // Step 3: Create new chapter
    const createdChapter = await prisma.chapter.create({
      data: {
        title,
        courseId,
        position: newPosition,
      },
    });

    return { data: createdChapter, status: 200 };
  } catch (error) {
    console.error('[createChapter]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

type ChapterPositionUpdate = {
  id: string;
  position: number;
};

export async function reorderChapters(list: ChapterPositionUpdate[]) {
  try {
    for (const item of list) {
      await prisma.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }

    return { message: 'Successfully reordered chapters', status: 200 };
  } catch (error) {
    console.error('[reorderChapters]', error);
    return { error: 'Internal Error', status: 500 };
  }
}


export async function publishChapter(chapterId: string) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter || !chapter.title || !chapter.videoUrl) {
      return { error: 'Chapter not found or missing title/video', status: 404 };
    }

    const publishedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { isPublished: true },
    });

    return { data: publishedChapter, status: 200 };
  } catch (error) {
    console.error('[publishChapter]', error);
    return { error: 'Internal Error', status: 500 };
  }
}


export async function unpublishChapter(chapterId: string) {
  try {
    const unpublishedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { isPublished: false },
    });

    return { data: unpublishedChapter, status: 200 };
  } catch (error) {
    console.error('[unpublishChapter]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

export async function deleteChapter({
  chapterId,
  coursesPackageId,
}: {
  chapterId: string;
  coursesPackageId: string;
}) {
  try {
    const coursePackageOwner = await prisma.coursePackage.findFirst({
      where: {
        id: coursesPackageId,
      },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    });

    if (!chapter) {
      return { error: 'Chapter not found', status: 404 };
    }

    const deleted = await prisma.chapter.delete({
      where: { id: chapterId },
    });

    return { data: deleted, status: 200 };
  } catch (error) {
    console.error('[deleteChapter]', error);
    return { error: 'Internal Error', status: 500 };
  }
}


export async function updateChapter({
  chapterId,
  coursesPackageId,
  
  values,
}: {
  chapterId: string;
  coursesPackageId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>;
}) {
  try {
    const coursePackageOwner = await prisma.coursePackage.findFirst({
      where: {
        id: coursesPackageId,
      },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: { ...values },
    });

    return { data: updated, status: 200 };
  } catch (error) {
    console.error('[updateChapter]', error);
    return { error: 'Internal Error', status: 500 };
  }
}
