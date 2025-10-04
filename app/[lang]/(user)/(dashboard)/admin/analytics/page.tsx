import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BadgeCheckIcon,
  LaptopIcon,
  PartyPopper,
  User,
  UserCheckIcon,
  UserIcon,
  TrendingUp,
  Award,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StudentGraph from "./studetGraph";
import {
  getAllAssignedCoursePackages,
  getThePackagesWhichHasLargestStudent,
  getTotalStudentsThatHaveacessthePacakges,
} from "@/actions/admin/analysis";
import FinalExamStudentsGraph from "./finalExamStudentsGraph";

async function Page() {
  const largestCoursePackage = await getThePackagesWhichHasLargestStudent();
  const totalStudents = await getTotalStudentsThatHaveacessthePacakges();
  const totalPackages = await getAllAssignedCoursePackages();
  const takencoursePercent = 80;

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header with Action Button */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Analytics Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Comprehensive platform analytics and insights</p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/en/admin/analytics/viewAll">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">View Detailed Analytics</span>
                  <span className="sm:hidden">View Details</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
        {/* Total Students */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-blue-300 hover:shadow-xl transition-all duration-300 rounded-xl shadow-sm">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {totalStudents}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Active learners</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Course Packages */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-green-300 hover:shadow-xl transition-all duration-300 rounded-xl shadow-sm">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <UserCheckIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Course Packages
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {totalPackages}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              {takencoursePercent > 75 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <BadgeCheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {takencoursePercent}% engagement
                </span>
              ) : (
                <span className="text-orange-600 flex items-center gap-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  {takencoursePercent}% engagement
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Package of the Month */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-purple-300 hover:shadow-xl transition-all duration-300 rounded-xl shadow-sm">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Top Package</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 line-clamp-1">
                  {largestCoursePackage.map((course) => course.packageName)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-purple-600">
              <PartyPopper className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Most popular this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
        {/* Student Analysis Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm rounded-xl">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-gray-900">
              <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                <LaptopIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span>Student Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <StudentGraph />
          </CardContent>
        </Card>

        {/* Final Exam Status Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm rounded-xl">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-gray-900">
              <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <span>Final Exam Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FinalExamStudentsGraph />
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-xl shadow-sm">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Platform Insights
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Your educational platform is performing well with{" "}
                {totalStudents} active students across {totalPackages} course
                packages. The most popular package this month is{" "}
                <strong className="text-blue-600">
                  {largestCoursePackage.map((course) => course.packageName)}
                </strong>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}

export default Page;
