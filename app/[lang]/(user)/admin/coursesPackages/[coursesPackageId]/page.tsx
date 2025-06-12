// import { auth } from "@/auth";
import { ArrowLeft, LayoutDashboard, ListChecks } from "lucide-react";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import { TitleForm } from "../../../../../../components/custom/admin/title-form";
import { DescriptionForm } from "../../../../../../components/custom/admin/description-form";
// import { auth } from "@/auth";
// import { isTeacher } from "@/lib/teacher";
import { CoursesForm } from "@/components/custom/admin/courses-form";
import { Banner } from "@/components/custom/admin/banner";
import { CoursesPackageActions } from "@/components/custom/admin/courses-package-action";
import Link from "next/link";
import StudentAssignmentForm from "@/components/custom/admin/student-assignment-form";
import AssignedStudentsList from "@/components/custom/admin/assigned-students-list";
// import { StudentSelectionForm } from "@/components/custom/student-selection-form";

const CoursesPackageIdPage = async ({
  params,
}: {
  params: Promise<{ coursesPackageId: string }>;
}) => {
  const { coursesPackageId } = await params;
  // const {userId} = auth();

  // if (!session?.user) {
  //   return redirect("/en"); // Ensure no further rendering occurs
  // }

  // const userId = session.user.id ? session.user.id : "";
  // if (!isTeacher(userId)) return redirect("/en");
  const coursesPackage = await prisma.coursePackage.findUnique({
    where: {
      id: coursesPackageId,
      // userId,
    },
    include: {
      courses: { include: { chapters: { select: { isPublished: true } } } },
    },
  });
  if (!coursesPackage) {
    return redirect("/en");
  }
  // const students = await prisma.wpos_wpdatatable_23.findMany({
  //   where: {},
  //   select: {
  //     subject: true,
  //     wdt_ID: true,
  //   },
  // });

  const requiredFields = [
    coursesPackage.name,
    coursesPackage.description,
    // coursesPackage.userType,
    coursesPackage.courses,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields}) `;
  const isComplete = requiredFields.every(Boolean);
  const lang = "en";
  return (
    <>
      {!coursesPackage.isPublished && (
        <Banner
          variant={"warning"}
          label="This Course is unpublished, It will not be visible in the package"
        />
      )}
      <div className="p-6 overflow-auto">
        <Link
          href={`/${lang}/admin/coursesPackages`}
          className="flex items-center text-sm hover:opacity-75 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CoursesPackages
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">CoursesPackage Setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span>
          </div>
          <CoursesPackageActions
            disabled={!isComplete}
            isPublished={coursesPackage.isPublished}
            coursesPackageId={coursesPackageId}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">coustomize your coursesPackage</h2>
            </div>
            <TitleForm
              initialData={coursesPackage}
              coursesPackageId={coursesPackage.id}
            />
            <DescriptionForm
              initialData={coursesPackage}
              coursesPackageId={coursesPackage.id}
            />
            <AssignedStudentsList
              coursesPackageId={coursesPackage.id}
            />
            
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="text-xl">Package Courses</h2>
            </div>
            <CoursesForm
              initialData={coursesPackage}
              coursesPackageId={coursesPackage.id}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default CoursesPackageIdPage;
