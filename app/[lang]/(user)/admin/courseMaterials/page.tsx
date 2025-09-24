import { Card, CardContent } from "@/components/ui/card";
import { IconBadge } from "@/components/icon-badge";
import { Book } from "lucide-react";
import { CourseMaterialsSelector } from "@/components/custom/admin/course-materials-selector";
import { getCoursePackages } from "@/actions/admin/course-packages";

const CourseMaterialsPage = async () => {
  const result = await getCoursePackages();
  
  if (!result.success) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-600">Failed to load course packages</div>
          </div>
        </div>
      </div>
    );
  }

  const coursePackages = result.data || [];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <IconBadge icon={Book} variant="default" />
            <h1 className="text-3xl font-bold text-slate-900">Course Materials</h1>
          </div>
          <p className="text-slate-600">
            Upload and manage course materials including PDFs, presentations, documents, and other resources.
          </p>
        </div>

        <CourseMaterialsSelector coursePackages={coursePackages} />

        {coursePackages.length === 0 && (
          <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-slate-100 p-6 mb-4">
                <Book className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Course Packages Found</h3>
              <p className="text-slate-600 text-center max-w-md">
                Create course packages first to upload and manage course materials.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseMaterialsPage;