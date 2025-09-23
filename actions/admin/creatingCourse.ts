'use server';

import prisma from '@/lib/db';

export async function createCourse(coursesPackageId: string, title: string) {
  try {
    // Step 1: Check ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Step 2: Get last course order
    const lastCourse = await prisma.course.findFirst({
      where: { packageId: coursesPackageId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastCourse ? lastCourse.order + 1 : 1;

    // Step 3: Create new course
    const createdCourse = await prisma.course.create({
      data: {
        title,
        packageId: coursesPackageId,
        order: newOrder,
      },
    });

    return { data: createdCourse, status: 200 };
  } catch (error) {
    console.error('[createCourse]', error);
    return { error: 'Internal Error', status: 500 };
  }
}



type ReorderItem = {
  id: string;
  position: number;
};

export async function reorderCourses(
  coursesPackageId: string,
  list: ReorderItem[]
) {
  try {
    // Step 1: Validate ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Step 2: Update each course's order
    for (const item of list) {
      await prisma.course.update({
        where: { id: item.id },
        data: { order: item.position },
      });
    }

    return { message: 'Courses reordered successfully', status: 200 };
  } catch (error) {
    console.error('[reorderCourses]', error);
    return { error: 'Internal Error', status: 500 };
  }
}


export async function unpublishCourse(
  coursesPackageId: string,
  courseId: string
) {
  try {
    // Step 1: Validate ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Step 2: Unpublish course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId, 
      },
      data: { isPublished: false },
    });

    return { data: updatedCourse, status: 200 };
  } catch (error) {
    console.error('[unpublishCourse]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

export async function publishCourse(
  coursesPackageId: string,
  courseId: string
) {
  try {
    // Step 1: Validate ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Step 2: Validate course existence and title
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        packageId: coursesPackageId,
      },
    });

    if (!course || !course.title) {
      return { error: 'Course not found or missing title', status: 404 };
    }

   
    // Step 4: Publish course
    const publishedCourse = await prisma.course.update({
      where: { id: course.id ,
        // chapters:{some:{isPublished:true}},
      },
      data: { isPublished: true },
    });

    return { data: publishedCourse, status: 200 };
  } catch (error) {
    console.error('[publishCourseIfChaptersExist]', error);
    return { error: 'Internal Error', status: 500 };
  }
}


export async function deleteCourse(
  coursesPackageId: string,
  courseId: string
) {
  try {
    // Step 1: Validate ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: { id: coursesPackageId },
    });

    if (!coursePackageOwner) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Step 2: Validate course existence
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { packageId: true },
    });

    if (!course) {
      return { error: 'Course not found', status: 404 };
    }

    // Step 3: Delete course
    const deletedCourse = await prisma.course.delete({
      where: { id: courseId },
    });

    return { data: deletedCourse, status: 200 };
  } catch (error) {
    console.error('[deleteCourse]', error);
    return { error: 'Internal Error', status: 500 };
  }
}

export async function updateCourse(
  coursesPackageId: string,
  courseId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>
) {
  try {
    // Optional: validate ownership if needed

    const updatedCourse = await prisma.course.update({
      where: {
        id: courseId,
        packageId: coursesPackageId,
      },
      data: { ...values },
    });

    return { data: updatedCourse, status: 200 };
  } catch (error) {
    console.error('[updateCourse]', error);
    return { error: 'Internal Error', status: 500 };
  }
}
