"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  PlayCircle,
  Lock,
  Trophy,
} from "lucide-react";

import {
  getStudentProgressPerChapter,
  isCompletedAllChaptersInthePackage,
} from "@/actions/student/progress";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import Loading from "../admin/loading";

interface MainMenuProps {
  data:
    | {
        wdt_ID: number;
        name: string | null;
        status: string | null;
        subject: string | null;
        activePackage: {
          name: string;
          id: string;
          courses: {
            id: string;
            title: string;
            order: number;
            chapters: {
              id: string;
              isPublished: boolean;
              title: string;
              position: number;
            }[];
          }[];
        } | null;
      }
    | null
    | undefined;
  className?: string;
}

export default function MainMenu({ data, className }: MainMenuProps) {
  const params = useParams();
  const wdt_ID = Number(params?.wdt_ID ?? 0);

  const [chapterProgress, setChapterProgress] = React.useState<
    Record<string, boolean | null>
  >({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [allCoursesCompleted, setAllCoursesCompleted] = React.useState(false);

  React.useEffect(() => {
    async function fetchAllProgress() {
      if (!data || !data.activePackage) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const allChapters = data.activePackage.courses.flatMap(
          (course) => course.chapters
        );
        const progressEntries = await Promise.all(
          allChapters.map(async (chapter) => {
            const result = await getStudentProgressPerChapter(
              chapter.id,
              wdt_ID
            );
            return [chapter.id, result?.isCompleted ?? null] as [
              string,
              boolean | null
            ];
          })
        );
        setChapterProgress(Object.fromEntries(progressEntries));
        const areAllChaptersTrulyCompleted =
          await isCompletedAllChaptersInthePackage(
            data.activePackage.id,
            data.wdt_ID
          );
        setAllCoursesCompleted(areAllChaptersTrulyCompleted);
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllProgress();
  }, [data, wdt_ID]);

 
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const handleFinalExamClick = () => {
    if (allCoursesCompleted) {
      window.location.href = `/en/student/${data?.wdt_ID}/finalexam/${data?.activePackage?.id}`;
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-white overflow-y-auto",
        className
      )}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loading />
        </div>
      ) : !data || !data.activePackage ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No active package found.
        </div>
      ) : (
        <div className="w-full">
          {/* Course Title */}
          {/* <motion.div
            className="px-4 py-3 border-b border-gray-200 bg-gray-50"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-lg font-semibold text-black">
              {data.activePackage.name}
            </h2>
          </motion.div> */}

          {/* Course Content */}
            {data.activePackage.courses.map((course, courseIndex) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="w-full"
              >
                {/* Section Header */}
                <div className="py-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Section {courseIndex + 1} - {course.title}
                  </h3>
                </div>

                {/* Lessons List */}
                <div className="w-full ">
                  {course.chapters.map((chapter, chapterIndex) => {
                    const isCompleted = chapterProgress?.[chapter.id];
                    const chapterLink = `/en/student/${wdt_ID}/${course.id}/${chapter.id}`;
                    const isActive = false; // You can determine this based on current route
                    
                    return (
                      <motion.div
                        key={chapter.id}
                        variants={itemVariants}
                        className="w-full"
                      >
                        <button
                          disabled={isCompleted === null}
                          onClick={() => {
                            if (isCompleted === true || isCompleted === false) {
                              window.location.href = `${chapterLink}?isClicked=true`;
                            }
                          }}
                          className={cn(
                            "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200",
                            isCompleted === false && "bg-blue-50",
                            isCompleted === null && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Lesson Number */}
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                              <span className="text-xs font-medium text-gray-600">
                                {chapterIndex + 1}
                              </span>
                            </div>

                            {/* Lesson Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "text-sm font-medium text-gray-900 truncate",
                                  isActive && "font-semibold"
                                )}>
                                  {chapter.title}
                                </h4>
                                {isCompleted === true && (
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                )}
                                {isCompleted === false && (
                                  <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                )}
                                {isCompleted === null && (
                                  <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Video</span>
                                <span>•</span>
                                <span>
                                  {isCompleted === true ? "Completed" : 
                                   isCompleted === false ? "In Progress" : 
                                   "Locked"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {/* Final Exam Section */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full"
            >
              <div className="py-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  Final Assessment
                </h3>
              </div>
              
              <button
                onClick={handleFinalExamClick}
                disabled={!allCoursesCompleted}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200",
                  !allCoursesCompleted && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <Trophy className="w-3 h-3 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Final Exam
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Assessment</span>
                      {!allCoursesCompleted && (
                        <>
                          <span>•</span>
                          <span>Complete all lessons to unlock</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
        </div>
      )}
    </div>
  );
}
