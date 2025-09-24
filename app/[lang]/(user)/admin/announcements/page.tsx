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
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <IconBadge icon={MessageCircle} variant="default" />
              <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
            </div>
            <AnnouncementManager coursePackages={coursePackages} />
          </div>
          <p className="text-slate-600">
            Create and manage announcements for your course packages to keep students informed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="shadow-sm border-0 bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={announcement.coursePackage.isPublished ? "default" : "secondary"}>
                        <Package className="h-3 w-3 mr-1" />
                        {announcement.coursePackage.name}
                      </Badge>
                    </div>
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {announcement.anouncementDescription}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {announcements.length === 0 && (
          <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-slate-100 p-6 mb-4">
                <MessageCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Announcements Yet</h3>
              <p className="text-slate-600 text-center max-w-md mb-4">
                Create your first announcement to keep students informed about course updates and important information.
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