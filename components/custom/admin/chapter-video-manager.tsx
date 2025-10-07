"use client";

import { useState } from "react";
import { Video, Link, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChapterVideoForm } from "@/components/custom/admin/chapter-video-form";
import { ChapterVideoUpload } from "@/components/custom/admin/chapter-video-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChapterVideoManagerProps {
  coursesPackageId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any;
  courseId: string;
  chapterId: string;
}

type VideoSourceType = "url" | "upload";

export function ChapterVideoManager({
  coursesPackageId,
  initialData,
  courseId,
  chapterId,
}: ChapterVideoManagerProps) {
  // Determine initial video source based on existing data
  const getInitialSource = (): VideoSourceType => {
    if (initialData.customVideo) return "upload";
    if (initialData.videoUrl) return "url";
    return "upload"; // Default to custom video upload
  };

  const [videoSource, setVideoSource] = useState<VideoSourceType>(getInitialSource());

  const getSourceLabel = (source: VideoSourceType) => {
    switch (source) {
      case "url":
        return "Video URL";
      case "upload":
        return "Upload Video";
      default:
        return "Select Source";
    }
  };

  const getSourceIcon = (source: VideoSourceType) => {
    switch (source) {
      case "url":
        return <Link className="h-4 w-4" />;
      case "upload":
        return <Upload className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getActiveVideoType = () => {
    if (initialData.customVideo) return "Custom Upload";
    if (initialData.videoUrl) return "External URL";
    return "No Video";
  };

  return (
    <div className="space-y-6">
      {/* Video Source Selector */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-800">
              Video Source Configuration
            </CardTitle>
            <Badge variant={initialData.customVideo || initialData.videoUrl ? "default" : "secondary"}>
              {getActiveVideoType()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Choose Video Source Type
              </label>
              <Select
                value={videoSource}
                onValueChange={(value: VideoSourceType) => setVideoSource(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {getSourceIcon(videoSource)}
                      <span>{getSourceLabel(videoSource)}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Video URL</span>
                        <span className="text-xs text-slate-500">
                          Link to external video (YouTube, Vimeo, etc.)
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="upload">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Upload Video</span>
                        <span className="text-xs text-slate-500">
                          Upload video file directly to server
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Type Description */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-2">
                {getSourceIcon(videoSource)}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-800">
                    {videoSource === "url" ? "External Video URL" : "Direct Video Upload"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {videoSource === "url"
                      ? "Provide a direct link to your video hosted on external platforms. Supports YouTube, Vimeo, and direct video URLs."
                      : "Upload video files directly to your server. Supports MP4, AVI, MOV formats up to 100MB."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Content Based on Selection */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-800 flex items-center gap-2">
            {getSourceIcon(videoSource)}
            {getSourceLabel(videoSource)} Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {videoSource === "url" ? (
            <ChapterVideoForm
              coursesPackageId={coursesPackageId}
              initialData={initialData}
              courseId={courseId}
              chapterId={chapterId}
            />
          ) : (
            <ChapterVideoUpload
              coursesPackageId={coursesPackageId}
              initialData={initialData}
              courseId={courseId}
              chapterId={chapterId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}