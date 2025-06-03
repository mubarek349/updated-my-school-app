"use client";

import { course } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grip, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CoursesListProps {
  items: course[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}
export const CoursesList = ({ items, onReorder, onEdit }: CoursesListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [courses, setCourses] = useState<course[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Always sort courses by order ascending
    const sorted = [...items].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    setCourses(sorted);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(courses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Re-assign position starting from 1
    const updatedCourses = items.map((course, idx) => ({
      ...course,
      position: idx + 1,
    }));
    setCourses(updatedCourses);

    // Prepare bulk update data for all courses
    const bulkUpdateData = updatedCourses.map((course) => ({
      id: course.id,
      position: course.position,
    }));
    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="courses">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {courses.map((course, index) => (
              <Draggable key={course.id} draggableId={course.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      course.isPublished &&
                        "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transiton",
                        course.isPublished &&
                          "border-r-sky-200 hover:bg-sky-200"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {course.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      {/* Show order starting from 1 */}
                      {index + 1}
                      <Badge
                        className={cn(
                          "bg-slate-500",
                          course.isPublished && "bg-sky-700"
                        )}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(course.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
