"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useParams } from "next/navigation";
import useAction from "@/hooks/useAction";
import { getActivePackageProgress } from "@/actions/student/progress";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

// Skeleton loader for progress bar
function ProgressSkeleton() {
  return (
    <motion.div
      className="w-[90%] mx-auto h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
      initial={{ opacity: 0.5 }}
      animate={{
        opacity: 1,
        transition: { repeat: Infinity, repeatType: "reverse", duration: 0.8 },
      }}
    />
  );
}

export default function ProgressPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(1); // Avoid division by zero
  const [error, setError] = useState<string | null>(null);

  const params = useParams();

  const wdt_ID = Number(params?.wdt_ID);

  // Fetch progress data using useAction
  const [progressData, , isLoading] = useAction(
    getActivePackageProgress,
    [true, (response) => console.log(response)],

    wdt_ID
  );

  useEffect(() => {
    if (isLoading) return;
    if (!progressData) {
      setError("Failed to load progress data.");
      return;
    }
    try {
      const completedChapters = progressData.completedChapters || 0;
      const totalChapters = progressData.totalChapters || 1;
      setCompleted(completedChapters);
      setTotal(totalChapters);
      setProgress((completedChapters / totalChapters) * 100);
      setError(null);
    } catch (err) {
      setError("Error processing progress data.");
      console.error(err);
    }
  }, [progressData, isLoading]);

  // Animation variants for progress bar
  // const progressVariants = {
  //   initial: { width: 0 },
  //   animate: {
  //     width: `${progress}%`,
  //     transition: { duration: 1, ease: "easeOut" },
  //   },
  // };

  return (
    <div className="py-4 md:py-6 bg-blue-50 grid">
      <TooltipProvider>
        {/* Mobile Layout */}
        {isMobile && (
          <motion.div
            className="grid gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading ? (
              <ProgressSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-[90%] mx-auto">
                    <Progress
                      value={progress}
                      className={cn(
                        "h-3 rounded-full",
                        "bg-gray-100 dark:bg-gray-800",
                        "[&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-green-600"
                      )}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </Progress>
                    <div className="text-center text-sm mt-2 max-md:hidden text-gray-600 dark:text-gray-300">
                      {completed} / {total} chapters completed
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {progress.toFixed(1)}% of your learning path completed
                </TooltipContent>
              </Tooltip>
            )}
          </motion.div>
        )}

        {/* Desktop Layout */}
        {!isMobile && (
          <motion.div
            className={cn(
              "p-6 z-40 bg-gradient-to-b from-sky-50 to-sky-100 dark:from-sky-900 dark:to-sky-950",
              "shadow-md sticky top-0"
            )}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading ? (
              <ProgressSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-[90%] mx-auto">
                    <Progress
                      value={progress}
                      className={cn(
                        "h-4 rounded-full",
                        "bg-gray-100 dark:bg-gray-800",
                        "[&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-green-600"
                      )}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </Progress>
                    <div className="text-center text-sm mt-2 font-medium text-gray-600 dark:text-gray-300">
                      {completed} / {total} chapters completed
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {progress.toFixed(1)}% of your learning path completed
                </TooltipContent>
              </Tooltip>
            )}
          </motion.div>
        )}
      </TooltipProvider>
    </div>
  );
}
