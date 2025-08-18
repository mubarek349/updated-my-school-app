"use client";

import { useParams } from "next/navigation";
import useAction from "@/hooks/useAction";
import getProfile from "@/actions/student/profile";

import StudentHeader from "@/components/custom/student/profile/StudentHeader";
import StatsCard from "@/components/custom/student/profile/StatsCard";
import CourseCard from "@/components/custom/student/profile/CourseCard";
import CourseSection from "@/components/custom/student/profile/CourseSection";

import { BookOpen, CheckCircle, GraduationCap } from "lucide-react";
import AttendanceSummary from "@/components/custom/student/profile/AttendanceSummary";

function Page() {
  const params = useParams();
  const studentId = Number(params?.wdt_ID ?? 0);

  const [data, , loading] = useAction(
    getProfile,
    [true, (response) => console.log(response)],
    studentId
  );

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading profile...</div>
    );
  }
  console.log("Profile data:", data);

  if (!data) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load profile.
      </div>
    );
  }

  const {
    studentProfile,
    completedPackageNames,
    completedPackageIdss,
    resultOfCompletedPackage,
    inProgressPackages,
    totalNumberOfCompletedPackage,
    totalNumberOfThePackage,
    averageGrade,
    complationDates,
    attendances,
  } = data;

  if (!studentProfile.name) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load profile.
      </div>
    );
  }
  const currentCourses = inProgressPackages.map((pkg) => ({
    title: pkg.packageId.name,
    instructor: pkg.oustazName,
    chapters: `${pkg.noOfChapters} chapters`,
    progress: pkg.percent,
  }));

  const completedCourses = completedPackageNames.map((pkg, idx) => ({
    title: pkg.pName,
    instructor: pkg.oustazName,
    chapters: `${pkg.noOfChapters} chapters`,
    completed: complationDates[idx],
    result: `${resultOfCompletedPackage[idx].correct}/${resultOfCompletedPackage[idx].total} (${resultOfCompletedPackage[idx].score}%)`,
    url: `/en/student/${studentId}/certificates/${completedPackageIdss[idx]}`,
  }));
  const colorMap = {
    blue: "text-blue-600 bg-blue-100 border-blue-100",
    green: "text-green-600 bg-green-100 border-green-100",
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto">
      {/* Header */}
      <StudentHeader
        name={studentProfile.name}
        phone={studentProfile.phoneno ?? ""}
        id={studentProfile.wdt_ID}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Courses"
          value={totalNumberOfThePackage}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
        />
        <StatsCard
          label="Completed"
          value={totalNumberOfCompletedPackage}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        />
        <StatsCard
          label="Average Grade in %"
          value={`${averageGrade.toFixed(2)} %`}
          icon={<GraduationCap className="w-5 h-5 text-yellow-500" />}
        />
        <AttendanceSummary present={attendances.present} absent={attendances.absent} />
      </div>

      {/* Current Courses */}
      {currentCourses.length > 0 && (
        <CourseSection
          title="Current Courses"
          badge={`${
            totalNumberOfThePackage - totalNumberOfCompletedPackage
          } active`}
          badgeColor={colorMap.blue}
        >
          {currentCourses.map((course, idx) => (
            <CourseCard
              key={idx}
              {...course}
              instructor={course.instructor.filter(Boolean).join(", ")} // removes nulls and joins
            />
          ))}
        </CourseSection>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <CourseSection
          title="Completed Courses"
          badge={`${totalNumberOfCompletedPackage} completed`}
          badgeColor="green"
        >
          {completedCourses.map((course, idx) => (
            <CourseCard
              key={idx}
              {...course}
              instructor={course.instructor.filter(Boolean).join(", ")}
              isCompleted
            />
          ))}
        </CourseSection>
      )}
    </div>
  );
}

export default Page;
