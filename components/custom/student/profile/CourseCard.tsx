import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  FileText,
  UserRound,
  CalendarDays,
  Clock,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  title: string;
  instructor: string;
  chapters: string;
  progress?: number;
  completed?: string;
  result?: string;
  url?: string;
  isCompleted?: boolean;
}

export default function CourseCard({
  title,
  instructor,
  chapters,
  progress,
  completed,
  result,
  url,
  isCompleted = false,
}: CourseCardProps) {
  const router = useRouter();
  return (
    <Card className="m-3 bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          {isCompleted ? (
            <FileText className="w-5 h-5 text-blue-600" />
          ) : (
            <BookOpen className="w-5 h-5 text-blue-600" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="w-4 h-4 text-gray-500" />
          {instructor}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4 text-gray-500" />
          {chapters}
        </div>
        {isCompleted ? (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-purple-600" />
              Completed: {completed}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm font-medium text-gray-900">
              Result: {result}
              <Button
                className="ml-auto bg-white hover:bg-green-700 border border-gray-100 rounded-md text-black"
                onClick={() => router.push(url!)}
              >
                <Download className="w-3 h-3 text-black" />
                Certificate
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 justify-between text-sm text-muted-foreground">
              <span className="flex gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Progress:
              </span>
              <span className="text-black">{progress}%</span>
            </div>
            <Progress value={progress} className="bg-gray-100" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
