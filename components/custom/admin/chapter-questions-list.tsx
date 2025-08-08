"use client";

import { question } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Grip,
  Minus,
  MinusCircle,
  Pencil,
  Plus,
  PlusCircle,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "../../modals/confirm-modal";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ChapterQuestionsListProps {
  items: question[];
  onDelete: (id: string) => void;
  coursesPackageId: string;
  courseId: string;
  chapterId: string;
  // onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const ChapterQuestionsList = ({
  items,
  // onReorder,
  coursesPackageId,
  courseId,
  chapterId,
  onDelete,
  onEdit,
}: ChapterQuestionsListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [questions, setQuestions] = useState(items);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setQuestions(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedQuestions = Array.from(questions);
    const [movedItem] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedItem);

    setQuestions(reorderedQuestions);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4 mt-4"
          >
            {questions.map((question, index) => (
              <Draggable
                key={question.id}
                draggableId={question.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-x-4 bg-sky-100 border border-sky-200 text-sky-700 rounded-md p-3 text-sm transition-shadow hover:shadow-sm"
                    )}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="flex-shrink-0 px-2 py-2 border-r border-sky-200 hover:bg-sky-200 rounded-md transition"
                    >
                      <Grip className="h-5 w-5" />
                    </div>

                    <div className="flex-1 text-sm text-slate-800">
                      {question.question}
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 ml-auto">
                      <ConfirmModal onConfirm={() => onDelete(question.id)}>
                        <Trash className="stroke-red-500 w-4 h-4 cursor-pointer hover:opacity-75 transition" />
                      </ConfirmModal>

                      <Pencil
                        onClick={() => onEdit(question.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />

                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center gap-1 text-xs sm:text-sm px-2 py-1 rounded-md transition",
                          question.packageId === coursesPackageId
                            ? "text-red-500 bg-red-100 hover:bg-red-200"
                            : "text-blue-500 bg-blue-100 hover:bg-blue-200"
                        )}
                        onClick={async () => {
                          const endpoint =
                            question.packageId === coursesPackageId
                              ? "remove"
                              : "add";
                          await axios.patch(
                            `/api/coursesPackages/${coursesPackageId}/courses/${courseId}/chapters/${chapterId}/questions/${question.id}/${endpoint}`
                          );
                          toast.success(`Successfully ${endpoint}ed`);
                          router.refresh();
                        }}
                      >
                        {question.packageId === coursesPackageId ? (
                          <>
                            <MinusCircle className="w-4 h-4" />
                            From Final
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            To Final
                          </>
                        )}
                      </Button>
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
