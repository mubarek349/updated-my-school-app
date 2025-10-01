import prisma from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { IconBadge } from "@/components/icon-badge";
import { MessageCircle, Calendar, Package } from "lucide-react";
import { AnnouncementManager } from "@/components/custom/admin/announcement-manager";
const AnnouncementsPage = async () => {
  const [announcements, coursePackages] = await Promise.all([
    prisma.announcement.findMany({
      include: {
        coursePackage: {
          select: {
            name: true,
            isPublished: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.coursePackage.findMany({
      select: {
        id: true,
        name: true,
        isPublished: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Action Button */}
      <div className="mb-6 flex justify-end">
        <AnnouncementManager coursePackages={coursePackages} />
      </div>

      {/* Main Content */}
      <div>
        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="shadow-sm border-0 bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              >
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <Badge
                      variant={
                        announcement.coursePackage.isPublished
                          ? "default"
                          : "secondary"
                      }
                      className="w-fit"
                    >
                      <Package className="h-3 w-3 mr-1" />
                      <span className="truncate">
                        {announcement.coursePackage.name}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                    {announcement.anouncementDescription}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-slate-100 p-6 mb-4">
                <MessageCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No Announcements Yet
              </h3>
              <p className="text-slate-600 text-center max-w-md mb-6">
                Create your first announcement to keep students informed about
                course updates and important information.
              </p>
              <AnnouncementManager coursePackages={coursePackages} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
