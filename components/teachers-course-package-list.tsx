"use client";
import Link from "next/link";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { coursePackage } from "@prisma/client";
// import { getAssignedSubjects } from "@/actions/admin/packageassign";
// import useAction from "@/hooks/useAction";

interface CreatedCoursePackageListProps {
  coursesPackages: coursePackage[];
}
const lang = "en";

export const CreatedCoursePackageList = ({
  coursesPackages,
}: CreatedCoursePackageListProps) => {
  return (
    <div className="courses-list overflow-auto gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {coursesPackages.map((coursesPackage) => (
        <Link
          key={coursesPackage.id}
          href={`/${lang}/admin/coursesPackages/${coursesPackage.id}`}
          className="hover:scale-[1.005] transition-transform"
        >
          <Card className=" bg-blue-100 h-full flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-xl justify-between gap-2">
                <span>{coursesPackage.name}</span>
                <Badge
                  variant={
                    coursesPackage.isPublished ? "default" : "destructive"
                  }
                  className={coursesPackage.isPublished ? "" : "bg-red-300"}
                >
                  {coursesPackage.isPublished ? "Published" : "Unpublished"}
                </Badge>
              </CardTitle>
              {coursesPackage.description && (
                <CardDescription className="mt-2 text-gray-600">
                  {coursesPackage.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">
                  {coursesPackage.examDurationMinutes ?? null}
                </span>
                <span className="text-xs text-blue-600 font-semibold ml-auto">
                  View Details &rarr;
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};


