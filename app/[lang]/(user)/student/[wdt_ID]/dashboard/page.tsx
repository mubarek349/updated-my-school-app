"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BadgeCheckIcon, UserCheckIcon, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useAction from "@/hooks/useAction";
import { getPackageData } from "@/actions/student/package";
import { getStudentProgressPerChapter } from "@/actions/student/progress";
import { useParams } from "next/navigation";

function CourseData() {
  const params = useParams();
  const wdt_ID = Number(params?.wdt_ID);
  const completecoursepersent = 66;
  const [data, isLoading] = useAction(
    getPackageData,
    [true, (response) => console.log(response)],
    wdt_ID
  );

  // State to hold progress for all chapters
  const [chapterProgress, setChapterProgress] = React.useState<
    Record<string, boolean | null>
  >({});

  // Fetch progress for all chapters when data is loaded
  React.useEffect(() => {
    async function fetchAllProgress() {
      if (!data || !data.activePackage) return;
      const allChapters = data.activePackage.courses.flatMap(
        (course) => course.chapters
      );
      const progressEntries = await Promise.all(
        allChapters.map(async (chapter) => {
          const result = await getStudentProgressPerChapter(chapter.id, wdt_ID);
          return [chapter.id, result?.isCompleted ?? null] as [
            string,
            boolean | null
          ];
        })
      );
      setChapterProgress(Object.fromEntries(progressEntries));
    }
    fetchAllProgress();
  }, [data, wdt_ID]);

  return (
    <div className="m-4">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-pink-500 flex flex-col gap-2">
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="text-orange-500 text-5xl">
                <BookOpenCheck />
              </span>
              <div className="text-5xl font-bold">
                100 <span className="text-xl text-gray-500">courses</span>
              </div>
            </div>
            <div>
              <Button size="sm" asChild>
                <Link href="#">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="text-green-500 text-5xl">
                <BookOpenCheck />
              </span>
              <div className="text-5xl font-bold">
                200 <span className="text-xl text-gray-500">courses</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {completecoursepersent > 50 ? (
              <span className="text-green-500 flex items-center gap-2">
                <BadgeCheckIcon />
                Great job! Keep it up!
              </span>
            ) : (
              <span className="text-yellow-500 flex items-center gap-2">
                <UserCheckIcon />
                Keep pushing you are almost there!
              </span>
            )}
          </CardFooter>
        </Card>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">
          Active Course Package progress
        </h1>
        {!isLoading ? (
          !data ? (
            <div>No data found.</div>
          ) : "message" in data ? (
            <div className="text-center text-lg text-green-600 py-10">
              {/* {data.message} */}
            </div>
          ) : (
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>{data.activePackage?.name}</AccordionTrigger>
                <AccordionContent>
                  {data.activePackage?.courses.map((course) => (
                    <div key={course.id} className="p-4 border-b">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.title}</p>
                      <div>
                        {course.chapters.map((chapter) => {
                          const isCompleted = chapterProgress[chapter.id];

                          return (
                            <div key={chapter.id} className="p-4 border-b">
                              <h3 className="text-lg font-semibold">
                                {chapter.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {chapter.title}
                              </p>
                              <span>position: {chapter.position}</span>
                              <span
                                className={`ml-2 px-2 py-1 rounded text-xs font-semibold
                                ${
                                  isCompleted === true
                                    ? "bg-green-100 text-green-700"
                                    : isCompleted === false
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {isCompleted === true
                                  ? "Completed"
                                  : isCompleted === false
                                  ? "Not Completed"
                                  : "Not Started"}
                              </span>
                              {isCompleted === true ? (
                                <Link
                                  href={`/en/${wdt_ID}/${data.activePackage?.courses[0].id}/${chapter.id}`}
                                  className="text-blue-500 hover:underline ml-4"
                                >
                                  View Chapter
                                </Link>
                              ) : (
                                <span className="text-gray-400 ml-4 cursor-not-allowed">
                                  View Chapter
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">This is a dashboard page</h1>
      <CourseData />
    </div>
  );
}

export default Page;
