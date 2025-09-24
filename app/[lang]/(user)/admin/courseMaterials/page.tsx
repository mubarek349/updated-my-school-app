import prisma from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/icon-badge";
import { Book, FileText, Package } from "lucide-react";
import { CourseMaterialsManager } from "@/components/custom/admin/course-materials-manager";

const CourseMaterialsPage = async () => {
  const coursePackages = await prisma.coursePackage.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      courseMaterials: true,
      isPublished: true,
      _count: {
        select: {
          courses: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {coursePackages.map((coursePackage) => (
            <Card key={coursePackage.id} className="shadow-sm border-0 bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-800 line-clamp-2">
                      {coursePackage.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={coursePackage.isPublished ? "default" : "secondary"}>
                        {coursePackage.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Package className="h-3 w-3" />
                        {coursePackage._count.courses} courses
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FileText className="h-4 w-4" />
                    {coursePackage.courseMaterials ? 
                      coursePackage.courseMaterials.split(',').filter(Boolean).length : 0} files
                  </div>
                </div>
                {coursePackage.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                    {coursePackage.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <CourseMaterialsManager
                  packageId={coursePackage.id}
                  packageName={coursePackage.name}
                  initialMaterials={coursePackage.courseMaterials}
                />
              </CardContent>
            </Card>
          ))}
        </div>

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