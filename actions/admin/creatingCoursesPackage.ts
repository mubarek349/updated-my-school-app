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
