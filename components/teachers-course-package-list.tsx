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

interface AllCoursesPackage {
  id: string;
  name: string;
  description: string | null;
  userType: string;
  isPublished: boolean;
}

interface CreatedCoursePackageListProps {
  coursesPackages: AllCoursesPackage[];
}
const lang = "en";

export const CreatedCoursePackageList = ({
  coursesPackages,
}: CreatedCoursePackageListProps) => {
  return (
    <div className="courses-list p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coursesPackages.map((coursesPackage) => (
        <Link
          key={coursesPackage.id}
          href={`/${lang}/admin/coursesPackages/${coursesPackage.id}`}
          className="hover:scale-[1.02] transition-transform"
        >
          <Card className="h-full flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-xl justify-between gap-2">
                <span>{coursesPackage.name}</span>
                <Badge
                  variant={coursesPackage.isPublished ? "default" : "secondary"}
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
                  {/* {coursesPackage?.userType} */}
                </span>
                <span className="text-xs text-blue-600 font-semibold">
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
