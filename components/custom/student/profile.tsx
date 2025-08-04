"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { Download, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { CheckCircle,GraduationCap } from "lucide-react";

interface ProfileProps {
  activeCourse: {
    course: string;
    grade: string;
    remarks: string;
  };
  lastLearnedCourses: {
    course: string;
    grade: string;
    remarks: string;
    url: string;
  }[];
}

const Profile = ({ activeCourse, lastLearnedCourses }: ProfileProps) => {
  const router = useRouter();

  const getGradeIcon = (grade: string) => {
    const [scoreStr, totalStr] = grade.split("/");
    const score = parseFloat(scoreStr);
    const total = parseFloat(totalStr);
    const percent = Math.round((score / total) * 100);

    if (percent >= 90) {
      return (
        <div className="flex items-center gap-1">
          <GraduationCap className="text-green-900 w-5 h-5" />
          <span>{grade}</span>
        </div>
      );
    } else if (percent >= 75) {
      return (
        <div className="flex items-center gap-1">
          <GraduationCap className="text-yellow-900 w-5 h-5" />
          <span>{grade}</span>
        </div>
      );
    } else if (percent >= 60) {
      return (
        <div className="flex items-center gap-1 ">
          <GraduationCap className="text-orange-900 w-5 h-5" />
          <span>{grade}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 ">
          <GraduationCap className="text-red-900 w-5 h-5" />
          <span>{grade}</span>
        </div>
      );
    }
  };

  return (
    <div className="p-4 space-y-1">
      {/* Active Course */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className=" my-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-green-600 dark:text-green-200 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          አሁን ላይ የሚማሩት
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-semibold">ትምህርት</span>
            <p>{activeCourse.course}</p>
          </div>
          <div>
            <span className="font-semibold">ውጤት</span>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold">
              {getGradeIcon(activeCourse.grade)}
            </span>
          </div>
          <div>
            <span className="font-semibold">ሁኔታ</span>
            <p>{activeCourse.remarks}</p>
          </div>
        </div>
      </motion.section>

      {/* Completed Courses */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="my-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          ያጠናቀቋቸው የኮርስ ጥቅሎች
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          {lastLearnedCourses.map((course, idx) => (
            <div
              key={idx}
              className="grid grid-rows-4 bg-white/100 dark:bg-gray-900 m-0 p-4 rounded-xl shadow"
            >
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2">
                {course.course}
              </h3>
              {/* <div className="flex items-center justify-between mb-2"> */}
                <span className="text-sm font-bold">
                  {getGradeIcon(course.grade)}
                </span>
                
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {course.remarks}
              </p>
              <Button
                  className="text-sm text-green-700 bg-amber-100"
                  onClick={() => router.push(course.url)}
                >
                  <Download className="w-4 h-4" />
                  ሰርተፍኬት
                </Button>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Profile;
