import Link from "next/link";
import React from "react";
import { CourseProgress } from "./course-progress";

interface Course {
  id: string;
  title: string;
  description: string | null;
  progress: number;
}

interface CoursesListProps {
  courses: Course[];
  chat_id: string;
}

export const CoursesList = ({ courses, chat_id }: CoursesListProps) => {
  return (
    <div className="courses-list p-5 grid grid-cols gap-5">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/${chat_id}/courses/${course.id}`}
          className="bg-gray-100 rounded-xl p-5 flex flex-col course-card"
        >
          <h2 className="text-xl font-bold">{course.title}</h2>
          <p>{course.description}</p>
          <CourseProgress value={course.progress} />
        </Link>
      ))}
    </div>
  );
};
