import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, packageId } = body;

    if (!studentId || !packageId) {
      return NextResponse.json({ error: 'studentId and packageId are required' }, { status: 400 });
    }

    const result = await prisma.finalExamResult.updateMany({
      where: {
        studentId,
        packageId,
      },
      data: {
        certificateUrl: `${packageId.replace(/\s+/g, '_')}_certificate.pdf`,
        dateOfDownloadingCertificate: new Date(),
      },
    });

    return NextResponse.json({ updated: result.count }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}