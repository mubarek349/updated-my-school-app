import { getCoursesPackages } from "@/actions/admin/package";
import { CreatedCoursePackageList } from "@/components/teachers-course-package-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const lang = "en";
const coursesPackagePage = async () => {
  const coursesPackages = await getCoursesPackages();

  return (
    <div className="bg-blue-50 grid overflow-hidden p-6 sm:p-8 rounded-lg shadow-sm space-y-6 scrollbar-hide">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">
          Manage Course Packages
        </h1>
        <Link href={`/${lang}/admin/create`}>
          <Button className="w-full sm:w-auto">Create Courses Package</Button>
        </Link>
      </div>

      {/* Scrollable List Section */}
      <CreatedCoursePackageList coursesPackages={coursesPackages} />
    </div>
  );
};
export default coursesPackagePage;
// This page is protected by the middleware, so it will only be accessible to authenticated users.
