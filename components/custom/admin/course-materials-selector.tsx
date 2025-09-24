"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Package } from "lucide-react";
import { CourseMaterialsManager } from "./course-materials-manager";

interface CoursePackage {
  id: string;
  name: string;
  description: string | null;
  courseMaterials: string | null;
  isPublished: boolean;
  _count: {
    courses: number;
  };
}

interface CourseMaterialsSelectorProps {
  coursePackages: CoursePackage[];
}

export function CourseMaterialsSelector({ coursePackages }: CourseMaterialsSelectorProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>(
    coursePackages.length > 0 ? coursePackages[0].id : ""
  );

  const selectedPackageData = coursePackages.find(pkg => pkg.id === selectedPackage);

  return (
    <>
      {/* Package Selector */}
      <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-800">Select Course Package</h2>
        </CardHeader>
        <CardContent>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a course package" />
            </SelectTrigger>
            <SelectContent>
              {coursePackages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Selected Package Details & Uploader */}
      {selectedPackageData && (
        <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-xl text-slate-800">
                  {selectedPackageData.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedPackageData.isPublished ? "default" : "secondary"}>
                    {selectedPackageData.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Package className="h-3 w-3" />
                    {selectedPackageData._count.courses} courses
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <FileText className="h-4 w-4" />
                {selectedPackageData.courseMaterials ? 
                  selectedPackageData.courseMaterials.split(',').filter(Boolean).length : 0} files
              </div>
            </div>
            {selectedPackageData.description && (
              <p className="text-sm text-slate-600 mt-2">
                {selectedPackageData.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <CourseMaterialsManager
              packageId={selectedPackageData.id}
              initialMaterials={selectedPackageData.courseMaterials}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}