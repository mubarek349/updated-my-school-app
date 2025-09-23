"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AnimatedCircularProgressProps {
  count: number;
}

export default function AnimatedCircularProgress({
  count,
}: AnimatedCircularProgressProps) {
  const max = 30;
  const radius = 45; // Circle size
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - count / max); // Adjust stroke dynamically

  // Animation variants
  // const circleVariants = {
  //   initial: { strokeDashoffset: circumference },
  //   animate: {
  //     strokeDashoffset,
  //     transition: { duration: 1, ease: "easeInOut" },
  //   },
  // };

  const textVariants = {
    initial: { scale: 1, opacity: 0.8 },
    animate: {
      scale: count <= 5 ? [1, 1.1, 1] : 1, // Pulse effect for low counts
      opacity: 1,
      transition: { duration: 0.5, repeat: count <= 5 ? Infinity : 0 },
    },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            role="timer"
            aria-label={`Countdown timer: ${count} seconds remaining`}
          >
            {/* Circular Progress Bar */}
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className="drop-shadow-md"
            >
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
                className="dark:stroke-gray-700"
              />
              {/* Progress Circle with Gradient */}
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)" // Start from top
                animate={{
                  strokeDashoffset: strokeDashoffset,
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                }}
                initial="initial"
                className={cn(
                  count <= 5 && "animate-pulse",
                  "shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                )}
              />
              {/* Countdown Text */}
              <motion.text
                x="50"
                y="55"
                fontSize="24"
                textAnchor="middle"
                fill="currentColor"
                className="font-semibold text-gray-800 dark:text-gray-200"
                variants={textVariants}
                initial="initial"
                animate="animate"
              >
                {count}
              </motion.text>
            </svg>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          {count} second{count !== 1 ? "s" : ""} remaining
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
