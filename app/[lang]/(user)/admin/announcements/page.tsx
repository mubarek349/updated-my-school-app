import prisma from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/icon-badge";
import { MessageCircle, Plus, Calendar, Package } from "lucide-react";
import { AnnouncementManager } from "@/components/custom/admin/announcement-manager";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <IconBadge icon={MessageCircle} variant="default" className="hidden sm:flex" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Announcements</h1>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">
                    Create and manage announcements for your course packages to keep students informed.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <AnnouncementManager coursePackages={coursePackages} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
              {announcements.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id} className="shadow-sm border-0 bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                      <CardHeader className="pb-3">
                        <div className="space-y-2">
                          <Badge variant={announcement.coursePackage.isPublished ? "default" : "secondary"} className="w-fit">
                            <Package className="h-3 w-3 mr-1" />
                            <span className="truncate">{announcement.coursePackage.name}</span>
                          </Badge>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Announcements Yet</h3>
                    <p className="text-slate-600 text-center max-w-md mb-6">
                      Create your first announcement to keep students informed about course updates and important information.
                    </p>
                    <AnnouncementManager coursePackages={coursePackages} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;