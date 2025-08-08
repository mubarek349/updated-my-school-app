import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
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
  const totalPackages = await getAllAssignedCoursePackages(); // Example total students
  const takencoursePercent = 80; // Example percentage
  return (
    <div className="py-2 sm:py-4 lg:py-6 w-full space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
  {/* Summary Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Total Students */}
    <Card className="bg-blue-100 shadow-sm rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900">Total Students</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <UserIcon className="text-blue-600 w-6 h-6" />
          <div className="text-4xl sm:text-5xl font-bold text-blue-800">{totalStudents}</div>
        </div>
        <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          <Link href="/en/admin/analytics/viewAll">View All</Link>
        </Button>
      </CardContent>
    </Card>

    {/* Total Course Packages */}
    <Card className="bg-blue-100 shadow-sm rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900">Total Course Packages</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <UserCheckIcon className="text-blue-600 w-6 h-6" />
          <div className="text-4xl sm:text-5xl font-bold text-blue-800">{totalPackages}</div>
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-xs flex items-center gap-2 font-medium">
          {takencoursePercent > 75 ? (
            <span className="text-green-600 flex items-center gap-1">
              <BadgeCheckIcon className="w-4 h-4" />
              {takencoursePercent}% of packages are taken
            </span>
          ) : (
            <span className="text-red-500 flex items-center gap-1">
              <User className="w-4 h-4" />
              {takencoursePercent}% of packages are taken
            </span>
          )}
        </span>
      </CardFooter>
    </Card>

    {/* Package of the Month */}
    <Card className="bg-blue-100 shadow-sm rounded-lg flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900">Package of the Month</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-blue-800 text-xl font-semibold">
        {largestCoursePackage.map((course) => course.packageName)}
      </CardContent>
      <CardFooter className="flex items-center gap-2 text-xs text-gray-600 mt-auto">
        <PartyPopper className="text-pink-500 w-4 h-4" />
        <span>
          Congratulations!{" "}
          <strong className="text-pink-600">
            {largestCoursePackage.map((course) => course.packageName)}
          </strong>{" "}
          is the most popular package this month.
        </span>
      </CardFooter>
    </Card>
  </div>

  {/* Graphs Section */}
  <Card className="bg-blue-100 shadow-sm rounded-lg overflow-x-auto">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl text-blue-900 font-semibold">
        <LaptopIcon className="w-5 h-5 text-blue-600" />
        <span>Courses Analysis</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pl-0">
      <StudentGraph />
    </CardContent>
  </Card>

  <Card className="bg-blue-100 shadow-sm rounded-lg overflow-x-auto">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl text-blue-900 font-semibold">
        <LaptopIcon className="w-5 h-5 text-blue-600" />
        <span>Completed Students Final Exam Status</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pl-0">
      <FinalExamStudentsGraph />
    </CardContent>
  </Card>
</div>

  );
}

export default Page;
