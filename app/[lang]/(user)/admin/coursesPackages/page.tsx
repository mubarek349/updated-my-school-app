import { getCoursesPackages } from "@/actions/admin/package";
import { CreatedCoursePackageList } from "@/components/teachers-course-package-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const lang = "en";
const coursesPackagePage = async () => {
  const coursesPackages = await getCoursesPackages();

  return (
    <div className="grid overflow-hidden p-6 sm:p-8 bg-blue-50 scrollbar-hide">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-medium text-slate-800">
          Manage Course Packages
        </h1>
        <Link href={`/${lang}/admin/create`}>
          <Button className="w-full sm:w-auto">Create Courses Package</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 overflow-auto py-4">
        <CreatedCoursePackageList coursesPackages={coursesPackages} />
      </div>
    </div>
  );
};
export default coursesPackagePage;
// This page is protected by the middleware, so it will only be accessible to authenticated users.
