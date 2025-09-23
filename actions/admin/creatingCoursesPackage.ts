'use server';

import prisma from '@/lib/db';

export async function createCoursePackage(name: string) {
  try {
    console.log('Creating course package with name:', name);

    const createdCoursePackage = await prisma.coursePackage.create({
      data: {name},
    });

    console.log('Created course package:', createdCoursePackage);
    return createdCoursePackage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[COURSES]', error.message, error.stack);
    throw new Error('Internal Error');
  }
}


export async function unpublishCoursePackage(coursesPackageId: string) {
  try {
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    const unpublishedCoursePackage = await prisma.coursePackage.update({
      where: { id: coursesPackageId },
      data: { isPublished: false },
    });

    return { data: unpublishedCoursePackage, status: 200 };
  } catch (error) {
    console.error('[COURSES_course_ID]', error);
    return { error: 'Internal Error', status: 500 };
  }
}



export async function publishCoursePackage(coursesPackageId: string) {
  try {
    // Step 1: Check ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Step 2: Validate name exists
    const coursesPackage = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
      select: { name: true },
    });

    if (!coursesPackage?.name) {
      return { error: 'Package not found or missing title', status: 404 };
    }

    // Step 3: Publish only if at least one course is published
    const publishedCoursesPackage = await prisma.coursePackage.update({
      where: {
        id: coursesPackageId,
        // courses: { some: { isPublished: true } },
      },
      data: { isPublished: true },
    });

    return { data: publishedCoursesPackage, status: 200 };
  } catch (error) {
    console.error('[publishedCourse]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

export async function deleteCoursePackage(coursesPackageId: string) {
  try {
    const existingPackage = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!existingPackage) {
      return { error: 'Course package not found', status: 404 };
    }

    

    const deletedPackage = await prisma.coursePackage.delete({
      where: { id: coursesPackageId },
    });

    return { data: deletedPackage, status: 200 };
  } catch (error) {
    console.error('[deleteCoursePackage]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

export async function updateCoursePackageName(
  coursesPackageId: string,
  name: string
) {
  try {
    const existingPackage = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!existingPackage) {
      return { error: 'Course package not found', status: 404 };
    }

   
    const updatedPackage = await prisma.coursePackage.update({
      where: { id: coursesPackageId },
      data: { name },
    });

    return { data: updatedPackage, status: 200 };
  } catch (error) {
    console.error('[updateCoursePackage]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

export async function updateCoursePackageDescription(
  coursesPackageId: string,
  description: string
) {
  try {
    const existingPackage = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!existingPackage) {
      return { error: 'Course package not found', status: 404 };
    }

   
    const updatedPackage = await prisma.coursePackage.update({
      where: { id: coursesPackageId },
      data: { description },
    });

    return { data: updatedPackage, status: 200 };
  } catch (error) {
    console.error('[updateCoursePackage]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

export async function updatingExamDurationMinute(
  coursesPackageId: string,
  examDurationMinutes: number|null
) {
  try {
    const existingPackage = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!existingPackage) {
      return { error: 'Course package not found', status: 404 };
    }

   
    const updatedPackage = await prisma.coursePackage.update({
      where: { id: coursesPackageId },
      data: { examDurationMinutes },
    });

    return { data: updatedPackage, status: 200 };
  } catch (error) {
    console.error('[updateCoursePackage]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

