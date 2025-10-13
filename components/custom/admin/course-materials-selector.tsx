"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Brain } from "lucide-react";
import { CourseMaterialsManager } from "./course-materials-manager";
import { AiPdfUploader } from "./ai-pdf-uploader";
import { AiAssistantSelector } from "./ai-selector";

interface CoursePackage {
  id: string;
  name: string;
  description: string | null;
  courseMaterials: string | null;
  aiPdfData: string | null;
  isPublished: boolean;
  aiProvider: string | null;
  _count: {
    courses: number;
  };
}

interface CourseMaterialsSelectorProps {
  coursePackages: CoursePackage[];
}

export function CourseMaterialsSelector({
  coursePackages,
}: CourseMaterialsSelectorProps) {
  const [selectedAiPdfPackage, setSelectedAiPdfPackage] = useState<string>(
    coursePackages.length > 0 ? coursePackages[0].id : ""
  );
  const [selectedMaterialsPackage, setSelectedMaterialsPackage] = useState<string>(
    coursePackages.length > 0 ? coursePackages[0].id : ""
  );

  const [selectedAiPdfData, setSelectedAiPdfData] = useState<CoursePackage | undefined>();
  const [selectedMaterialsData, setSelectedMaterialsData] = useState<CoursePackage | undefined>();
   
  useEffect(() => {
    const aiPdfData = coursePackages.find((pkg) => pkg.id === selectedAiPdfPackage);
    setSelectedAiPdfData(aiPdfData);
  }, [selectedAiPdfPackage, coursePackages]);
  useEffect(() => {
    const materialsData = coursePackages.find((pkg) => pkg.id === selectedMaterialsPackage);
    setSelectedMaterialsData(materialsData);
  }, [selectedMaterialsPackage, coursePackages]);

  return (
    <div className="space-y-6">

      {/* AI PDF Data Section */}
      <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-800">AI PDF Data</h2>
          </div>
          <Select value={selectedAiPdfPackage} onValueChange={setSelectedAiPdfPackage}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose course package for AI PDF" />
            </SelectTrigger>
            <SelectContent>
              {coursePackages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {selectedAiPdfData && (
            <AiAssistantSelector 
              key={`ai-selector-${selectedAiPdfData.id}`}
              packageId={selectedAiPdfData.id}
              currentAIProvider={selectedAiPdfData.aiProvider}
            />
          )}
          {selectedAiPdfData && (
            <AiPdfUploader
              key={`ai-uploader-${selectedAiPdfData.id}`}
              packageId={selectedAiPdfData.id}
              currentAiPdfData={selectedAiPdfData.aiPdfData}
              aiProvider={selectedAiPdfData.aiProvider}
            />
          )}
        </CardContent>
      </Card>

      {/* Course Materials Section */}
      <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">Course Materials</h2>
          </div>
          <Select value={selectedMaterialsPackage} onValueChange={setSelectedMaterialsPackage}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose course package for materials" />
            </SelectTrigger>
            <SelectContent>
              {coursePackages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {selectedMaterialsData && (
            <CourseMaterialsManager
              key={selectedMaterialsData.id}
              packageId={selectedMaterialsData.id}
              packageName={selectedMaterialsData.name}
              initialMaterials={selectedMaterialsData.courseMaterials}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
