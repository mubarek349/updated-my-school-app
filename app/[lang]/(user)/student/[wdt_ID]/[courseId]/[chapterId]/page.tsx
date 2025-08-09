"use client";
import React, { useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import useAction from "@/hooks/useAction";
import { packageCompleted } from "@/actions/student/progress";
import { getQuestionForActivePackageChapterUpdate } from "@/actions/student/test";
import { noProgress } from "@/actions/student/progress";
import StudentQuestionForm from "@/components/custom/student/StudentQuestionForm";
import ProgressPage from "@/components/custom/student/progressSkeleten";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoursesPackageId } from "@/actions/admin/package";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function Page() {
  const params = useParams();
  const wdt_ID = Number(params.wdt_ID);
  const courseId = String(params.courseId);
  const chapterId = String(params.chapterId);
  const [data, refetch, isLoading] = useAction(
    getQuestionForActivePackageChapterUpdate,
    [true, (response) => console.log(response)],
    wdt_ID,
    courseId,
    chapterId
  );
  const [progressData] = useAction(
    noProgress,
    [true, (response) => console.log(response)],
    wdt_ID,
    courseId
  );
  const [error, setError] = React.useState<string | null>(null);

  // FIX: Correctly access coursesPackageId from the 'data' object.
  // Assuming 'data' will have a 'packageId' property when successfully fetched.

  // Confetti and toast on package complete

  useEffect(() => {
    async function checkPackage() {
      try {
        const packageIsCompleted = await packageCompleted(wdt_ID); // Renamed variable to avoid conflict
        if (packageIsCompleted) {
          toast.success("🎉 Congratulations! You have completed the package!", {
            duration: 5000,
            style: { background: "#10B981", color: "#fff" },
          });

          // FIX: Correct router.push path and ensure data.packageId is ava
          // Confetti side cannons
          const end = Date.now() + 2 * 1000;
          const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
          const frame = () => {
            if (Date.now() > end) return;
            confetti({
              particleCount: 3,
              angle: 60,
              spread: 55,
              startVelocity: 60,
              origin: { x: 0, y: 0.5 },
              colors,
            });
            confetti({
              particleCount: 3,
              angle: 120,
              spread: 55,
              startVelocity: 60,
              origin: { x: 1, y: 0.5 },
              colors,
            });
            requestAnimationFrame(frame);
          };
          frame();
        }
      } catch (err) {
        setError("Failed to check package completion.");
        console.error(err);
      }
    }

    // Only run checkPackage if data is loaded and not an error/message state
    if (!isLoading && !error && data && !("message" in data)) {
      checkPackage();
    }
  }, [wdt_ID, isLoading, error, data]); // Added coursesPackageId and router to dependencies

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  // Handle "package not started" state
  if (progressData === true) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-b from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-950"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <svg
          className="w-16 h-16 text-blue-500 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
          />
        </svg>
        <span className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">
          Package Not Started
        </span>
        <span className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
          Please start your package using our Telegram bot to access the
          content.
        </span>
        <a
          href="https://t.me/MubareksBot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Open Telegram bot to start package"
        >
          Go to Telegram
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
    className="px-4 md:px-12 bg-blue-50 py-6 grid grid-rows-[auto_1fr] min-h-screen"
    style={{
      background:
      "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 50%, #f5f7fa 100%) cl",
      backgroundAttachment: "fixed",
    }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ProgressPage />
      <div className="flex flex-col overflow-auto px-2 bg-blue-50">
        {/* Breadcrumb */}
        <TooltipProvider>
          <Breadcrumb className="py-4 md:py-6 mb-4">
            <BreadcrumbList className="text-sm md:text-base">
              <BreadcrumbItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BreadcrumbLink
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      // href={`/en/student/${wdt_ID}`} // Uncomment and set href if navigation is desired
                    >
                      {data && "packageName" in data
                        ? data.packageName
                        : "Package"}
                    </BreadcrumbLink>
                  </TooltipTrigger>
                  <TooltipContent>Back to Package</TooltipContent>
                </Tooltip>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-400 dark:text-gray-500" />
              <BreadcrumbItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BreadcrumbLink
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      // href={`/en/student/${wdt_ID}/${courseId}`} // Uncomment and set href if navigation is desired
                    >
                      {data && "courseTitle" in data
                        ? data.courseTitle
                        : "Course"}
                    </BreadcrumbLink>
                  </TooltipTrigger>
                  <TooltipContent>Back to Course</TooltipContent>
                </Tooltip>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-400 dark:text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-800 dark:text-gray-100 font-medium">
                  {data && "chapter" in data ? data.chapter?.title : "Chapter"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </TooltipProvider>

        {/* Content */}
        <AnimatePresence>
          {isLoading ? (
            //to show loading skeleton
            <motion.div
              className="flex items-center justify-center min-h-[50vh] bg-gradient-to-r from-gray-100 to-gray-200 dark:from-yellow-900 dark:to-yellow-800 rounded-xl"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="animate-pulse w-4/5 h-96 rounded-lg bg-gray-300/50 dark:bg-gray-700/50" />
            </motion.div>
          ) : error ? (
            <motion.div
              className="flex flex-col items-center justify-center min-h-[50vh] bg-red-100 dark:bg-red-900 rounded-xl"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
              <span className="text-xl font-semibold text-red-700 dark:text-red-300 mb-4">
                {error}
              </span>
              <Button
                onClick={() => refetch()}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                aria-label="Retry loading chapter data"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </motion.div>
          ) : data && "message" in data ? (
            <Message message={data.message} wdt_ID={wdt_ID} />
          ) : (
            <>
              <iframe
                className="w-full mx-auto aspect-video max-md:sticky top-0 z-50 rounded-lg shadow-lg"
                src={
                  data && "chapter" in data && data.chapter?.videoUrl
                    ? `https://www.youtube.com/embed/${data.chapter.videoUrl}`
                    : undefined
                }
                title="Darulkubra video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                aria-label="Chapter video player"
              />
              {data &&
                "chapter" in data &&
                data.chapter &&
                Array.isArray(data.chapter.questions) && (
                  <motion.div
                    className="mt-6"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <StudentQuestionForm
                      chapter={{
                        questions: data.chapter.questions,
                      }}
                      wdt_ID={wdt_ID}
                      courseId={courseId}
                      chapterId={data.chapter.id}
                    />
                  </motion.div>
                )}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Page;

function Message({ message, wdt_ID }: { message: string; wdt_ID: number }) {
  const router = useRouter();
  console.log("showed message in message");
  useEffect(() => {
    (async () => {
      if (await packageCompleted(wdt_ID)) {
        const coursesPackageId = await getCoursesPackageId(wdt_ID);
        setTimeout(() => {
          router.push(`/en/student/${wdt_ID}/finalexam/${coursesPackageId}`);
        }, 5000);
      }
    })();
  }, [router, wdt_ID]);

  return (
    <AnimatePresence>
      <motion.div
        className="flex flex-col items-center justify-center min-h-[50vh] bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <svg
              className="w-12 h-12 text-green-600 dark:text-green-400 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </TooltipTrigger>
          <TooltipContent>{message}</TooltipContent>
        </Tooltip>
        <span className="text-xl font-bold text-green-700 dark:text-green-300 text-center">
          {message}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
