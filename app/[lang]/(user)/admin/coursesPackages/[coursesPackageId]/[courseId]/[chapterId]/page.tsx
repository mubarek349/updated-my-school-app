import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, FileQuestion, LayoutDashboard, Video } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { ChapterTitleForm } from "@/components/custom/admin/chapter-title-form";
import { ChapterVideoForm } from "@/components/custom/admin/chapter-video-form";

import { Banner } from "@/components/custom/admin/banner";
import { ChapterActions } from "@/components/custom/admin/chapter-action";
import { ChapterQuestionForm } from "@/components/custom/admin/chapter-question-form";
// import VideoUploadButton from "@/components/VideoUploadButton";

const ChapterIdPage = async ({
  params,
}: {
  params: Promise<{
    coursesPackageId: string;
    courseId: string;
    chapterId: string;
  }>;
}) => {
  const { courseId } = await params;
  const { chapterId } = await params;
  const { coursesPackageId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: courseId,
    },
    include: {
      questions: {
        include: {
          questionOptions: true,
        },
      },
    },
  });

  if (!chapter) {
    return redirect("/en");
  }

  const requiredFields = [
    chapter.title,
    // chapter.description,
    chapter.videoUrl,
    chapter.questions,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);
  const lang = "en";
  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant={"warning"}
          label="This chapter is unpublished, It will not be visible in the course"
        />
      )}
      <div className="p-6 overflow-auto bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/${lang}/admin/coursesPackages/${coursesPackageId}/${courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chapters setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
              </div>
              <ChapterActions
                disabled={!isComplete}
                courseId={chapterId}
                chapterId={chapterId}
                isPublished={chapter.isPublished}
                coursesPackageId={coursesPackageId}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your chapter</h2>
              </div>
              <ChapterTitleForm
                coursesPackageId={coursesPackageId}
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId} // Pass chapterId to the form
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Video} />
                <h2 className="text-xl">Add a video</h2>
              </div>
              <ChapterVideoForm
                coursesPackageId={coursesPackageId}
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId} // Pass chapterId to the for
              />
              {/* <VideoUploadButton
                coursesPackageId={coursesPackageId}
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId} // Pass chapterId to the for
              /> */}
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={FileQuestion} />
                <h2 className="text-xl">Add Question</h2>
              </div>
              <ChapterQuestionForm
                coursesPackageId={coursesPackageId}
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ChapterIdPage;
