import { PackageQuestionForm } from "@/components/custom/admin/package-question-form";
import prisma from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const QuestionsofThePackagePage = async ({
  params,
}: {
  params: Promise<{
    coursesPackageId: string;
  }>;
}) => {
  const { coursesPackageId } = await params;
  const coursepackage = await prisma.coursePackage.findUnique({
    where: {
      id: coursesPackageId,
    },
    include: {
      questions: {
        include: {
          questionOptions: true,
        },
      },
    },
  });

  if (!coursepackage) {
    return redirect("/en");
  }
  return (
    <div className="grid overflow-hidden bg-gray-100">
      <Link
        href={`/en/admin/coursesPackages/${coursesPackageId}`}
        className="stick flex items-center  text-sm hover:opacity-75 transition  mb-4 pt-3 pb-3 "
      >
        <ArrowLeft className="h-4 w-4 mr-2 " />
        Back to CoursesPackage setup
      </Link>
      <PackageQuestionForm
        initialData={coursepackage}
        coursesPackageId={coursesPackageId}
      />
    </div>
  );
};
export default QuestionsofThePackagePage;
