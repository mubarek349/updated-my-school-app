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
import { 
  BookOpen, 
  Clock,  
  ArrowRight, 
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";

interface CreatedCoursePackageListProps {
  coursesPackages: coursePackage[];
}
const lang = "en";

export const CreatedCoursePackageList = ({
  coursesPackages,
}: CreatedCoursePackageListProps) => {
  if (coursesPackages.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages yet</h3>
        <p className="text-gray-600 mb-6">Create your first course package to get started</p>
        <Link href={`/${lang}/admin/create`}>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Create Package
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {coursesPackages.map((coursesPackage) => (
        <Link
          key={coursesPackage.id}
          href={`/${lang}/admin/coursesPackages/${coursesPackage.id}`}
          className="group block"
        >
          <Card className="h-full bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] overflow-hidden">
            {/* Header with status */}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {coursesPackage.name}
                  </CardTitle>
                </div>
                <Badge
                  variant={coursesPackage.isPublished ? "default" : "secondary"}
                  className={`flex items-center gap-1 text-xs font-medium ${
                    coursesPackage.isPublished
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-orange-100 text-orange-700 border-orange-200"
                  }`}
                >
                  {coursesPackage.isPublished ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Published
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      Draft
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Description */}
              {coursesPackage.description && (
                <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {coursesPackage.description}
                </CardDescription>
              )}

              {/* Package details */}
              <div className="space-y-3">
                {/* Exam duration */}
                {coursesPackage.examDurationMinutes && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{coursesPackage.examDurationMinutes} min exam</span>
                  </div>
                )}

                {/* Created date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {new Date(coursesPackage.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">View Details</span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};


