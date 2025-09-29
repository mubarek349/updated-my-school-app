"use client";

import React from "react";
import { MessageCircle, Calendar, User } from "lucide-react";
import { getAnnouncements } from "@/actions/student/courseData";
import useAction from "@/hooks/useAction";

interface Announcement {
  id: string;
  anouncementDescription: string;
  createdAt: Date;
}

export default function CourseAnnouncements({
  courseId,
  lang,
}: {
  courseId: string;
  lang: string;
}) {
  const [announcements, , loading] = useAction(
    getAnnouncements,
    [true, () => {}],
    courseId
  );
  //   const { data: announcements, loading } = useData({
  //     func: getAnnouncements,
  //     args: [courseId],
  //   });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-medium mb-2">
          {lang === "en" ? "No Announcements Yet" : "አንድም ማሳወቂያ የለም"}
        </h3>
        <p className="text-gray-500">
          {lang === "en"
            ? "Check back later for updates from your instructor"
            : "ከአስተማሪዎ ዝመናዎችን ለማግኘት በኋላ በድጋሚ ይመለሱ"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {announcements.map((announcement: Announcement) => (
        <div
          key={announcement.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lang === "en" ? "Instructor" : "አስተማሪ"}
                </span>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(announcement.createdAt).toLocaleDateString(
                      lang === "en" ? "en-US" : "am-ET",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {announcement.anouncementDescription}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
