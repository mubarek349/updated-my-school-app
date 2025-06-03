"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { TooltipProvider } from "./tooltip";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

type Props = {
  className?: string;
};

export function LightDarkToggle({ className }: Props) {
  // Detect initial mode from <html> class
  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={className}
          onClick={() => setIsDarkMode((prev) => !prev)}
        >
          {isDarkMode ? <MoonIcon /> : <SunIcon />}
        </TooltipTrigger>
        <TooltipContent>
          {isDarkMode ? "Enable Light Mode" : "Enable Dark Mode"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
