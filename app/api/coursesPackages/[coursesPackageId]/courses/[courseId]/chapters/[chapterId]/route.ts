import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      coursesPackageId: string;
      courseId: string;
      chapterId: string;
    }>;
  }
) {
  try {
    const { coursesPackageId, chapterId } = await params;

    // Check course package ownership
    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
        // userId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select:{courseId:true}
    });
    if (!chapter) {
      return new NextResponse("Chapter Not found", { status: 404 });
    }

    // Delete the chapter
    const deletedChapter = await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });



    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[ChapterID_DELETION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      coursesPackageId: string;
      courseId: string;
      chapterId: string;
    }>;
  }
) {
  try {
    const { coursesPackageId } = await params;
    // const { courseId } = await params;
    const { chapterId } = await params;

    // const userId = "clg1v2j4f0000l5v8xq3z7h4d"; // Replace with actual userId from context
    

    const coursePackageOwner = await prisma.coursePackage.findUnique({
      where: {
        id: coursesPackageId,
        // userId: userId,
      },
    });

    if (!coursePackageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { ...values } = await req.json();

    const chapter = await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        ...values,
      },
      // other update fields
    });

    // if (values.videoUrl) {
    //   const existingMuxData = await prisma.muxData.findFirst({
    //     where: {
    //       chapterId: chapterId,
    //     },
    //   });
    //   if (existingMuxData) {
    //     await Video.Assets.del(existingMuxData.assetId);
    //     await prisma.muxData.delete({
    //       where: {
    //         id: existingMuxData.id,
    //       },
    //     });
    //   }
    //   const asset = await Video.Assets.create({
    //     input: values.videoUrl,
    //     playback_policy: "public",
    //     test: false,
    //   });
    //   await prisma.muxData.create({
    //     data: {
    //       chapterId: chapterId,
    //       assetId: asset.id,
    //       playbackId: asset.playback_ids?.[0]?.id,
    //     },
    //   });
    // }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
