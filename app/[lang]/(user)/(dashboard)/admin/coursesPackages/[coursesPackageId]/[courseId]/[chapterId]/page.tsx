import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, FileQuestion, LayoutDashboard, Video, CheckCircle } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { ChapterTitleForm } from "@/components/custom/admin/chapter-title-form";
import { Banner } from "@/components/custom/admin/banner";
import { ChapterActions } from "@/components/custom/admin/chapter-action";
import { ChapterQuestionForm } from "@/components/custom/admin/chapter-question-form";
import { ChapterVideoManager } from "@/components/custom/admin/chapter-video-manager";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    chapter.videoUrl || chapter.customVideo, // Accept either videoUrl or customVideo
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
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <Link
              href={`/${lang}/admin/coursesPackages/${coursesPackageId}/${courseId}`}
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Course Setup
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Chapter Management</h1>
                <div className="flex items-center gap-3">
                  <Badge variant={isComplete ? "default" : "secondary"} className="px-3 py-1">
                    {isComplete ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : null}
                    {completionText} Complete
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {chapter.title || "Untitled Chapter"}
                  </span>
                </div>
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Chapter Details Section */}
            <div className="space-y-6">
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <IconBadge icon={LayoutDashboard} variant="default" />
                    <h2 className="text-xl font-semibold text-slate-800">Chapter Details</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChapterTitleForm
                    coursesPackageId={coursesPackageId}
                    initialData={chapter}
                    courseId={courseId}
                    chapterId={chapterId}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <IconBadge icon={FileQuestion} variant="default" />
                    <h2 className="text-xl font-semibold text-slate-800">Assessment Questions</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChapterQuestionForm
                    coursesPackageId={coursesPackageId}
                    initialData={chapter}
                    courseId={courseId}
                    chapterId={chapterId}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Video Section */}
            <div className="space-y-6">
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <IconBadge icon={Video} variant="default" />
                    <h2 className="text-xl font-semibold text-slate-800">Chapter Video</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChapterVideoManager
                    coursesPackageId={coursesPackageId}
                    initialData={chapter}
                    courseId={courseId}
                    chapterId={chapterId}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ChapterIdPage;
