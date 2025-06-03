import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BadgeCheckIcon, UserCheckIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
function CourseData() {
  const completecoursepersent = 66;
  return (
    <div className=" m-4">
      <div className="grid lg:grid-cols-2 gap-8 ">
        <Card className="border-pink-500 flex flex-col gap-2">
          <CardHeader>
            <CardTitle>in progress</CardTitle>
          </CardHeader>

          <CardContent className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="text-5xl font-bold">
                <span className="text-orange-500">
                  {" "}
                  <BookOpenCheck />
                </span>
                100 <span className="text-xl text-gray-500">courses</span>
              </div>
            </div>
            {/* <div>
              <Button size={"sm"} asChild>
                <Link href="#">view all</Link>
              </Button>
            </div> */}
          </CardContent>
        </Card>

        {/* the second card */}
        <Card>
          <CardHeader>
            <CardTitle>completted</CardTitle>
          </CardHeader>

          <CardContent className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="text-green-500">
                {" "}
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
                <BadgeCheckIcon /> Great job! Keep it up!
              </span>
            ) : (
              <span className="text-yellow-500 flex items-center gap-2">
                <UserCheckIcon /> {"Keep pushing, you're almost there!"}
              </span>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default CourseData;
