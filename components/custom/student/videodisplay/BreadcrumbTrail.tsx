import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface BreadcrumbTrailProps {
  packageName?: string;
  courseTitle?: string;
  chapterTitle?: string;
}

export const BreadcrumbTrail = ({ packageName, courseTitle, chapterTitle }: BreadcrumbTrailProps) => (
  <TooltipProvider>
    <Breadcrumb className="py-4 md:py-6 mb-4">
      <BreadcrumbList className="text-sm md:text-base">
        <BreadcrumbItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <BreadcrumbLink className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {packageName ?? "Package"}
              </BreadcrumbLink>
            </TooltipTrigger>
            <TooltipContent>Back to Package</TooltipContent>
          </Tooltip>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-gray-400 dark:text-gray-500" />

        <BreadcrumbItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <BreadcrumbLink className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {courseTitle ?? "Course"}
              </BreadcrumbLink>
            </TooltipTrigger>
            <TooltipContent>Back to Course</TooltipContent>
          </Tooltip>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-gray-400 dark:text-gray-500" />

        <BreadcrumbItem>
          <BreadcrumbPage className="text-gray-800 dark:text-gray-100 font-medium">
            {chapterTitle ?? "Chapter"}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </TooltipProvider>
);
