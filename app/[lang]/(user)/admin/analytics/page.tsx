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
import { getAllAssignedCoursePackages, getThePackagesWhichHasLargestStudent, getTotalStudentsThatHaveacessthePacakges } from "@/actions/admin/analysis";
import FinalExamStudentsGraph from "./finalExamStudentsGraph";

async function Page() {
  
  const largestCoursePackage = await getThePackagesWhichHasLargestStudent();
  const totalStudents = await getTotalStudentsThatHaveacessthePacakges() ; 
  const totalPackages=await getAllAssignedCoursePackages();// Example total students
  const takencoursePercent = 80; // Example percentage
  return (
    <>
      <div className="overflow-y-auto">
        <div className="grid lg:grid-cols-3 gap-4 m-4">
          <Card>
            <CardHeader>
              <CardTitle>total students</CardTitle>
            </CardHeader>

            <CardContent className="flex justify-between items-center">
              <div className="flex gap-2">
                <UserIcon />
                <div className="text-5xl font-bold">{totalStudents}</div>
              </div>
              <div>
                <Button size={"sm"} asChild>
                  <Link href="/en/admin/analytics/viewAll">view all</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* the second card */}
          <Card>
            <CardHeader>
              <CardTitle>total CoursesPackages</CardTitle>
            </CardHeader>

            <CardContent className="flex justify-between items-center">
              <div className="flex gap-2">
                <UserCheckIcon />
                <div className="text-5xl font-bold">{totalPackages}</div>
              </div>
            </CardContent>
            <CardFooter>
              <span className="test-xs text-green-500 flex items-center gap-2">
                {takencoursePercent > 75 ? (
                  <span>
                    <BadgeCheckIcon />
                    {takencoursePercent}% CoursesPackages are taken
                  </span>
                ) : (
                  <span className="text-red-500">
                    <User />
                    {takencoursePercent}% CoursesPackages are taken
                  </span>
                )}
              </span>
            </CardFooter>
          </Card>
          {/* the third card */}
          <Card className="border-pink-500 flex flex-col gap-2">
            <CardHeader>
              <CardTitle>coursesPackage of the month</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <span className="text-2xl">{largestCoursePackage.map((course) => course.packageName)}</span>
            </CardContent>
            <CardFooter className="flex gap-2 item-center text-xs text-muted-foreground mt-auto">
              <PartyPopper className="text-pink-500" />
              <span>
                Congratulation {largestCoursePackage.map((course) => course.packageName)} coursesPackage is taken by large student!
              </span>
            </CardFooter>
          </Card>
        </div>
        <Card className="my-4 overflow-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LaptopIcon />
              <span> courses analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <StudentGraph />
          </CardContent>
        </Card>
        <Card className="my-4 overflow-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LaptopIcon />
              <span>Completed Students Final Exam Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <FinalExamStudentsGraph />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Page;
