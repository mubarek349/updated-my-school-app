import { getCoursesPackages } from "@/actions/admin/package";
import { CreatedCoursePackageList } from "@/components/teachers-course-package-list";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Clock } from "lucide-react";
import Link from "next/link";

const lang = "en";

const coursesPackagePage = async () => {
  const coursesPackages = await getCoursesPackages();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 h-full overflow-auto">
      {/* Action Button */}
      <div className="mb-8 flex justify-end">
        <Link href={`/${lang}/admin/create`}>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Package
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200/60 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Packages
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesPackages.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200/60 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesPackages.filter((pkg) => pkg.isPublished).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200/60 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesPackages.filter((pkg) => !pkg.isPublished).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Packages</h2>
          <p className="text-gray-600 mt-1">
            Click on any package to view details and manage content
          </p>
        </div>
        <CreatedCoursePackageList coursesPackages={coursesPackages} />
      </div>
    </div>
  );
};

export default coursesPackagePage;
// This page is protected by the middleware, so it will only be accessible to authenticated users.
