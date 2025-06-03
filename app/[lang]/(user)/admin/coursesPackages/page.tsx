import { getCoursesPackages } from "@/actions/admin/package";
import { CreatedCoursePackageList } from "@/components/teachers-course-package-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const lang="en";
const coursesPackagePage = async () => {
  const coursesPackages = await getCoursesPackages();
 
  return (
    <div className="p-6 overflow-auto">
      <Link href={`/${lang}/admin/create`}>
        <Button>Create Courses Package</Button>
      </Link>
      <div>
        <CreatedCoursePackageList coursesPackages={coursesPackages}/>
      </div>
    </div>
  );
};
export default coursesPackagePage;
// This page is protected by the middleware, so it will only be accessible to authenticated users.
