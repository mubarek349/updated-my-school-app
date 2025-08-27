"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormMessage,
  FormControl,
  FormItem,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; // Add Input for options
import { Input } from "@/components/ui/input"; // Add Input for options
// import { zodResolver } from "@hookform/resolvers/zod";
import { chapter, question } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form"; // Add useFieldArray for dynamic fields
import toast from "react-hot-toast";
// import { z } from "zod";
import { cn } from "@/lib/utils";
import { ChapterQuestionsList } from "./chapter-questions-list";
import {
  createQuestion,
  deleteQuestion,
} from "@/actions/admin/creatingQuestion";

interface ChapterQuestionFormProps {
  initialData: chapter & { questions: question[] };
  courseId: string;
  chapterId: string;
  coursesPackageId: string;
}

export const ChapterQuestionForm = ({
  initialData,
  courseId,
  chapterId,
  coursesPackageId,
}: ChapterQuestionFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  //   const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreating = () => setIsCreating((current) => !current);

  const router = useRouter();

  // z.infer<typeof formSchema>
  const form = useForm<{
    title: string;
    options: string[];
    answers: string[];
  }>({
    // resolver: zodResolver(formSchema),
    defaultValues: { title: "", options: ["", ""], answers: [] },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options" as never,
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: {
    title: string;
    options: string[];
    answers: string[];
  }) => {
    try {
      const result = await createQuestion(chapterId, values);

      if (result.status === 200) {
        form.reset();
        toast.success(result.message ?? "Question Created");
        toggleCreating();
        router.refresh();
      } else {
        toast.error(result.error ?? "");
      }
    } catch (error) {
      console.error("Create Error:", error);
      toast.error("Something went wrong.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      const result = await deleteQuestion(id);
      if (result.status === 200) {
        toast.success(result.message ?? "Question Deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete the question.");
    }
  };
  const lang = "en";
  const onEdit = (id: string) => {
    router.push(
      `/${lang}/admin/coursesPackages/${coursesPackageId}/${courseId}/${chapterId}/${id}`
    );
  };

  return (
    <div className="relative mt-6 border bg-blue-100 rounded-md px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between text-base sm:text-lg font-medium text-slate-800">
        Chapter Questions
        <Button
          onClick={toggleCreating}
          variant="ghost"
          className="text-sm sm:text-base"
        >
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" /> Add Question
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="e.g. 'What is the main concept of this chapter?'"
                      className="resize-none text-sm"
                      {...field}
                      onPaste={(e) => {
                        e.preventDefault(); // Prevent default paste behavior
                        const pastedText = e.clipboardData.getData("text");
                        const lines = pastedText
                          .split(/\r?\n/)
                          .filter((line) => line.trim() !== "");

                        form.setValue("title", lines.shift() ?? "");

                        lines.forEach((line, i) => {
                          if (fields[i]) {
                            form.setValue(`options.${i}`, line);
                          } else {
                            // Optionally add new fields if needed
                            append(line);
                          }
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options
              </label>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2"
                  >
                    <Input
                      {...form.register(`options.${index}`)}
                      placeholder={`Option ${index + 1}`}
                      disabled={isSubmitting}
                      className={cn(
                        "text-sm",
                        form
                          .watch("answers")
                          .includes(form.watch("options")[index])
                          ? "bg-green-100 border-2 border-green-500 text-green-700"
                          : ""
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          form.setValue(
                            "answers",
                            form
                              .watch("answers")
                              .includes(form.watch("options")[index])
                              ? form
                                  .watch("answers")
                                  .filter(
                                    (v) => v !== form.watch("options")[index]
                                  )
                              : [
                                  ...form.watch("answers"),
                                  form.watch("options")[index],
                                ]
                          )
                        }
                        className="text-xs sm:text-sm"
                      >
                        {form
                          .watch("answers")
                          .includes(form.watch("options")[index])
                          ? "Not Answer"
                          : "Answer"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 2}
                        className="text-xs sm:text-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => append("")}
                className="mt-3 text-sm"
              >
                Add Option
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={!isValid}
                className="text-sm sm:text-base"
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div
          className={cn(
            "text-sm mt-4",
            !initialData.questions.length && "text-slate-500 italic"
          )}
        >
          {!initialData.questions.length && "No Questions"}
          <ChapterQuestionsList
            onEdit={onEdit}
            onDelete={onDelete}
            coursesPackageId={coursesPackageId}
            courseId={courseId}
            chapterId={chapterId}
            items={initialData.questions || []}
          />
        </div>
      )}
    </div>
  );
};
