"use client";

import { question } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grip, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "../../modals/confirm-modal";

interface QuestionsListProps {
  items: question[];
  onDelete: (id: string) => void;
  // onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const QuestionsList = ({
  items,
  // onReorder,
  onDelete,
  onEdit,
}: QuestionsListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [questions, setQuestions] = useState(items);

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

    // const startIndex = Math.min(result.source.index, result.destination.index);
    // const endIndex = Math.max(result.source.index, result.destination.index);
    // const updatedQuestions = reorderedQuestions.slice(startIndex, endIndex + 1);

    setQuestions(reorderedQuestions);

    // const bulkUpdateData = updatedQuestions.map((question) => ({
    //   id: question.id,
    //   position: reorderedQuestions.findIndex((item) => item.id === question.id),
    // }));

    // onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {questions.map((question, index) => (
              <Draggable
                key={question.id}
                draggableId={question.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        "border-r-sky-200 hover:bg-sky-200"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {question.question}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <ConfirmModal onConfirm={() => onDelete(question.id)}>
                        <Trash className="stroke-red-500 mr-3 w-4 h-4 cursor-pointer hover:opacity-75 transition" />
                      </ConfirmModal>

                      <Pencil
                        onClick={() => onEdit(question.id)}
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
