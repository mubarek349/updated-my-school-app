import prisma from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/icon-badge";
import { MessageSquare, Star, User, Calendar, Package } from "lucide-react";
import { FeedbackFilters } from "@/components/custom/admin/feedback-filters";

const FeedbacksPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const params = await searchParams;
  const packageFilter = params.package as string;
  const ratingFilter = params.rating as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};
  if (packageFilter) {
    whereClause.coursePackageId = packageFilter;
  }
  if (ratingFilter) {
    whereClause.rating = parseInt(ratingFilter);
  }

  const [feedbacks, coursePackages] = await Promise.all([
    prisma.feedback.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            phoneno: true,
          },
        },
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-50 border-green-200";
    if (rating >= 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex">
                    <IconBadge icon={MessageSquare} variant="default" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student Feedback</h1>
                    <p className="text-sm sm:text-base text-slate-600 mt-1">
                      View and analyze student feedback to improve your courses and learning experience.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <FeedbackFilters coursePackages={coursePackages} />
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="rounded-full bg-blue-100 p-1.5 sm:p-2">
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-slate-900">{feedbacks.length}</p>
                        <p className="text-xs sm:text-sm text-slate-600">Total Feedback</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="rounded-full bg-yellow-100 p-1.5 sm:p-2">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-slate-900">
                          {feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : "0.0"}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600">Average Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="rounded-full bg-green-100 p-1.5 sm:p-2">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-slate-900">{feedbacks.filter((f) => f.rating >= 4).length}</p>
                        <p className="text-xs sm:text-sm text-slate-600">Positive Reviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-0">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="rounded-full bg-red-100 p-1.5 sm:p-2">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-slate-900">{feedbacks.filter((f) => f.rating <= 2).length}</p>
                        <p className="text-xs sm:text-sm text-slate-600">Needs Attention</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
              {feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <Card key={feedback.id} className="shadow-sm border-0 bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-500" />
                                <span className="font-medium text-slate-800">{feedback.student.name || "Anonymous"}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                <Package className="h-3 w-3 mr-1" />
                                <span className="truncate">{feedback.coursePackage.name}</span>
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1">
                                {renderStars(feedback.rating)}
                                <span className="text-sm font-medium text-slate-700 ml-1">{feedback.rating}/5</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="h-3 w-3" />
                                {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full border text-xs font-medium w-fit ${getRatingColor(feedback.rating)}`}>
                            {feedback.rating >= 4 ? "Positive" : feedback.rating >= 3 ? "Neutral" : "Negative"}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700 leading-relaxed">{feedback.feedback}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="rounded-full bg-slate-100 p-6 mb-4">
                      <MessageSquare className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Feedback Yet</h3>
                    <p className="text-slate-600 text-center max-w-md">
                      Student feedback will appear here once they start providing reviews for your courses.
                    </p>
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

export default FeedbacksPage;
