"use client";

import React from "react";

import MenuTitle from "./menu-title";

import { LightDarkToggle } from "@/components/ui/light-dark-toggle";
import { Button } from "@/components/ui/button"; // Import the Button component

import { cn } from "@/lib/utils";

import { CheckCircle, PlayCircle, Lock, Trophy } from "lucide-react"; // Added Trophy icon

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getStudentProgressPerChapter,
  isCompletedAllChaptersInthePackage,
} from "@/actions/student/progress";
import { useParams, useRouter } from "next/navigation"; // Import useRouter

import { motion, AnimatePresence } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const router = useRouter(); // Initialize useRouter

  const wdt_ID = Number(params.wdt_ID);

  const [chapterProgress, setChapterProgress] = React.useState<
    Record<string, boolean | null>
  >({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [allCoursesCompleted, setAllCoursesCompleted] = React.useState(false); // New state for overall completion

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

        // --- START MODIFICATION ---
        // Calculate if ALL chapters in ALL courses are completed
        const areAllChaptersTrulyCompleted =
          await isCompletedAllChaptersInthePackage(
            data.activePackage.id,
            data.wdt_ID
          );
        setAllCoursesCompleted(areAllChaptersTrulyCompleted);
        // --- END MODIFICATION ---
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllProgress();
  }, [data, wdt_ID]); // Add chapterProgress to dependency array

  // Calculate course completion percentage
  const getCourseProgress = (chapters: { id: string }[]) => {
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter(
      (chapter) => chapterProgress[chapter.id] === true
    ).length;
    return totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Handler for the final exam button click
  const handleFinalExamClick = () => {
    // Navigate to the final exam page
    if (allCoursesCompleted) {
      // Only navigate if truly unlocked
      router.push(
        `/en/student/${data?.wdt_ID}/finalexam/${data?.activePackage?.id}`
      ); // Adjust this path as needed
    }
  };

  return (
    <nav
      className={cn(
        "h-full w-96 overflow-y-auto py-6 px-4 md:px-8 flex flex-col gap-6",
        "bg-gradient-to-b from-sky-50 to-sky-100 dark:from-sky-900 dark:to-sky-950",
        "shadow-xl transition-all duration-300",
        className
      )}
      aria-label="Main navigation"
    >
      <header className="border-b border-sky-200 dark:border-sky-800 pb-4">
        <MenuTitle
          title={data?.name || "Student Name"}
          subtitle={data?.subject || "Subject"}
          showBadge={!!data?.activePackage}
          badgeText={data?.status || ""}
          badgeVariant="premium"
          className="hover:scale-[1.02] transition-transform duration-200"
        />
      </header>

      <div className="flex-1">
        {isLoading ? (
          <motion.div
            className="flex justify-center items-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Loading />
          </motion.div>
        ) : !data || !data.activePackage ? (
          <motion.div
            className="text-center py-12 text-gray-500 dark:text-gray-400"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            No active package found.
          </motion.div>
        ) : (
          <>
            <motion.h3
              className="text-xl md:text-2xl font-bold text-sky-800 dark:text-sky-100 mb-6 tracking-tight"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {data.activePackage.name}
            </motion.h3>
            <TooltipProvider>
              <Accordion type="single" collapsible className="space-y-3 w-60">
                <AnimatePresence>
                  {data.activePackage.courses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <AccordionItem
                        value={`course-${course.id}`}
                        className={cn(
                          "border border-sky-200 dark:border-sky-800 rounded-lg",
                          "bg-white/80 dark:bg-sky-900/80 backdrop-blur-sm",
                          "shadow-sm hover:shadow-lg transition-all duration-300"
                        )}
                      >
                        <AccordionTrigger
                          className={cn(
                            "px-4 py-3 text-base md:text-lg font-semibold",
                            "text-sky-800 dark:text-sky-200",
                            "hover:bg-sky-100/50 dark:hover:bg-sky-800/50",
                            "rounded-t-lg transition-colors duration-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sky-600 dark:text-sky-400 font-bold">
                              {course.order}.
                            </span>
                            <span className="truncate">{course.title}</span>
                            <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400">
                              {getCourseProgress(course.chapters)}% Complete
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3 space-y-3 rounded-b-lg">
                          {course.chapters.map((chapter) => {
                            const isCompleted = chapterProgress?.[chapter.id];

                            const chapterLink = `/en/student/${wdt_ID}/${course.id}/${chapter.id}`;

                            return (
                              <motion.div
                                key={chapter.id}
                                className={cn(
                                  "flex items-center p-3 rounded-md",
                                  "transition-all duration-200",
                                  "hover:bg-sky-100/50 dark:hover:bg-sky-800/50",
                                  "group border border-sky-200 dark:border-sky-700"
                                )}
                                variants={itemVariants}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span
                                      className={cn(
                                        "flex items-center text-xs font-semibold",
                                        isCompleted === true
                                          ? "text-green-500"
                                          : isCompleted === false
                                          ? "text-gray-400"
                                          : "text-yellow-500"
                                      )}
                                    >
                                      {isCompleted === true ? (
                                        <CheckCircle className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                                      ) : isCompleted === false ? (
                                        <PlayCircle className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                                      ) : (
                                        <Lock className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isCompleted === true
                                      ? "Completed"
                                      : isCompleted === false
                                      ? "In Progress"
                                      : "Locked"}
                                  </TooltipContent>
                                </Tooltip>
                                <button
                                  disabled={!isCompleted}
                                  className={cn(
                                    "text-left text-sm md:text-base font-medium ml-2",
                                    "transition-colors duration-200 truncate",
                                    isCompleted
                                      ? "text-sky-600 dark:text-sky-400 hover:underline"
                                      : "text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                  )}
                                  onClick={() => {
                                    if (isCompleted) {
                                      router.push(
                                        `${chapterLink}?isClicked=true`
                                      );
                                    }
                                  }}
                                  tabIndex={isCompleted ? 0 : -1}
                                  aria-disabled={!isCompleted}
                                  type="button"
                                  aria-label={`Go to ${chapter.title} ${
                                    isCompleted ? "" : "(Locked)"
                                  }`}
                                >
                                  <span className="text-sm text-sky-600 dark:text-sky-400">
                                    Lesson {chapter.position} : {chapter.title}
                                  </span>
                                </button>
                              </motion.div>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}

                  {/* Final Exam Accordion Item */}
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <AccordionItem
                      value="final-exam"
                      className={cn(
                        "border border-blue-300 dark:border-blue-700 rounded-lg",
                        "bg-blue-50/80 dark:bg-blue-900/80 backdrop-blur-sm",
                        "shadow-lg hover:shadow-xl transition-all duration-300"
                      )}
                    >
                      <AccordionTrigger
                        onClick={handleFinalExamClick} // Trigger navigation directly on click
                        className={cn(
                          "px-4 py-3 text-base md:text-lg font-semibold",
                          "text-blue-800 dark:text-blue-200",
                          "hover:bg-blue-100/50 dark:hover:bg-blue-800/50",
                          "rounded-lg transition-colors duration-200", // Rounded all corners
                          !allCoursesCompleted &&
                            "cursor-not-allowed opacity-50" // Disable if not all courses completed
                        )}
                        disabled={!allCoursesCompleted} // Disable the trigger if not all courses completed
                      >
                        <div className="flex items-center gap-3">
                          <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <span className="truncate">Final Exam</span>
                          {!allCoursesCompleted && (
                            <span className="ml-auto text-xss font-medium text-gray-500 dark:text-gray-400">
                              (Complete all to unlock)
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      {/* You can optionally add AccordionContent here if there's any info to show before clicking */}
                      {/* <AccordionContent className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        Click to begin your final assessment!
                      </AccordionContent> */}
                    </AccordionItem>
                  </motion.div>
                  {/* End Final Exam Accordion Item */}
                </AnimatePresence>
              </Accordion>
            </TooltipProvider>
          </>
        )}
      </div>

      <footer className="flex items-center gap-3 mt-auto pt-4 border-t border-sky-200 dark:border-sky-800">
        {/* The LightDarkToggle remains in the footer */}
        <LightDarkToggle
          className={cn(
            "ml-auto p-2 rounded-full",
            "bg-sky-200 dark:bg-sky-800",
            "hover:bg-sky-300 dark:hover:bg-sky-700",
            "transition-colors duration-200 shadow-sm"
          )}
        />
      </footer>
    </nav>
  );
}
