import { getCoursesPackages } from "@/actions/admin/package";
import { CreatedCoursePackageList } from "@/components/teachers-course-package-list";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const lang = "en";

const coursesPackagePage = async () => {
  const coursesPackages = await getCoursesPackages();

  return (
    <div className="flex flex-col h-screen">
        {/* Sticky Header with Action Button */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Course Packages</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Manage and organize your course packages</p>
              </div>
              <div className="flex-shrink-0">
                <Link href={`/${lang}/admin/create`}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Create New Package</span>
                    <span className="sm:hidden">Create Package</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-blue-300 hover:shadow-xl transition-all duration-300 rounded-xl shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Packages
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {coursesPackages.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-green-300 hover:shadow-xl transition-all duration-300 rounded-xl shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Published</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {coursesPackages.filter((pkg) => pkg.isPublished).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-orange-300 hover:shadow-xl transition-all duration-300 rounded-xl shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Draft</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  <span className="sr-only">Draft packages:</span>{coursesPackages.filter((pkg) => !pkg.isPublished).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Packages Grid */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">All Packages</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Click on any package to view details and manage content
              </p>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <CreatedCoursePackageList coursesPackages={coursesPackages} />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default coursesPackagePage;
// This page is protected by the middleware, so it will only be accessible to authenticated users.
