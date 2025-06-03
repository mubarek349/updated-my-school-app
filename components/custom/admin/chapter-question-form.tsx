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
import axios from "axios";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form"; // Add useFieldArray for dynamic fields
import toast from "react-hot-toast";
// import { z } from "zod";
import { cn } from "@/lib/utils";
import { QuestionsList } from "./questions-list";

interface ChapterQuestionFormProps {
  initialData: chapter & { questions: question[] };
  courseId: string;
  chapterId: string;
  coursesPackageId:string;
}

// const formSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   options: z
//     .array(z.string().nonempty("Option is required"))
//     .min(2, "At least two options are required"),
//   answers: z
//     .array(z.string().min(1, "Option is required"))
//     .min(1, "At least two options are required"),
// });

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
      await axios.post(
        `/api/coursesPackages/${coursesPackageId}/courses/${courseId}/chapters/${chapterId}/questions`,
        values
      );
      form.reset();
      toast.success("Question Created");
      toggleCreating();
      router.refresh();
    } catch (error) {
      console.error("Create Error:", error);
      toast.error("Something went wrong.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await axios.delete(
        `/api/coursesPackages/${coursesPackageId}/courses/${courseId}/chapters/${chapterId}/questions/${id}`
      );
      toast.success("Question Deleted");
      router.refresh();
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete the question.");
    }
  };
const lang="en";
  const onEdit = (id: string) => {
    router.push(
      `/${lang}/admin/coursesPackages/${coursesPackageId}/${courseId}/${chapterId}/${id}`
    );
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {/* {isUpdating && (
        <div className="absolute w-full h-full bg-slate-500/200 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )} */}
      <div className="font-medium flex items-center justify-between">
        Chapter Questions
        <Button onClick={toggleCreating} variant="ghost">
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
            className="space-y-4 mt-4"
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-x-2 mt-2">
                  <Input
                    {...form.register(`options.${index}`)}
                    placeholder={`Option ${index + 1}`}
                    disabled={isSubmitting}
                    className={cn(
                      "",
                      form
                        .watch("answers")
                        .includes(form.watch("options")[index])
                        ? "bg-green-100 border-2 border-green-500 text-green-700 "
                        : ""
                    )}
                  />
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
                              .filter((v) => v !== form.watch("options")[index])
                          : [
                              ...form.watch("answers"),
                              form.watch("options")[index],
                            ]
                      )
                    }
                  >
                    {form
                      .watch("answers")
                      .includes(form.watch("options")[index])
                      ? "not answer"
                      : "answer"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 2}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => append("")}
                className="mt-2"
              >
                Add Option
              </Button>
            </div>
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={!isValid}>
                Create
              </Button>
            </div>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "text-sm mt-2",
            !initialData.questions.length && "text-slate-500 italic"
          )}
        >
          {!initialData.questions.length && " NO Questions"}
          <QuestionsList
            onEdit={onEdit}
            onDelete={onDelete}
            items={initialData.questions || []}
          />
        </div>
      )}
    </div>
  );
};
