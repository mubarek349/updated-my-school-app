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
import { coursePackage, question } from "@prisma/client";
import axios from "axios";
import { Loader2, PlusCircle, TimerIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form"; // Add useFieldArray for dynamic fields
import toast from "react-hot-toast";
// import { z } from "zod";
import { cn } from "@/lib/utils";
import { PackageQuestionsList } from "./package-questions-list";
// interface QuestionWithDetails extends question {
//   questionOptionsJson: { id: string; text: string }[]; // Array of objects with id and text
//   correctAnswerIdsJson: string[]; // Array of selected option IDs
// }

interface PackageQuestionFormProps {
  initialData: coursePackage & { questions: question[] };
  coursesPackageId: string;
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

export const PackageQuestionForm = ({
  initialData,
  coursesPackageId,
}: PackageQuestionFormProps) => {
  const [isCreating, setIsCreating] = useState(false);

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
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  // Initialize examTime with data from initialData, or a default
  const [examDurationMinutes, setExamDurationMinutes] = useState<number | "">(
    initialData.examDurationMinutes ?? ""
  );

  // Function to handle saving exam time to the database
  const handleSaveExamTime = async () => {
    setIsUpdatingTime(true);
    try {
      const timeToSend =
        typeof examDurationMinutes === "number" ? examDurationMinutes : null;
      await axios.patch(`/api/coursesPackages/${coursesPackageId}`, {
        examDurationMinutes: timeToSend,
      });
      toast.success("Exam time updated successfully!");
      router.refresh(); // Refresh data to show updated time
    } catch (error) {
      console.error("Failed to update exam time:", error);
      toast.error("Failed to update exam time.");
    } finally {
      setIsUpdatingTime(false);
    }
  };

  const onSubmit = async (values: {
    title: string;
    options: string[];
    answers: string[];
  }) => {
    try {
      await axios.post(
        `/api/coursesPackages/${coursesPackageId}/questions`,
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
        `/api/coursesPackages/${coursesPackageId}/questions/${id}`
      );
      toast.success("Question Deleted");
      router.refresh();
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete the question.");
    }
  };
  const lang = "en";
  const onEdit = (id: string) => {
    router.push(
      `/${lang}/admin/coursesPackages/${coursesPackageId}/questions/${id}`
    );
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {/* Exam Time Setting */}
      <div className="flex items-start gap-3 mb-4">
        {" "}
        {/* Changed to flex-col and items-start */}
        <label
          htmlFor="examTime"
          className="text-gray-700 font-medium whitespace-nowrap"
        >
          Exam Duration (minutes):
        </label>
        <Input
          id="examTime"
          type="number"
          name="examTime"
          placeholder="Set Time for Exam"
          value={examDurationMinutes}
          onChange={(e) => {
            const val = e.target.value;
            setExamDurationMinutes(
              val === "" ? "" : Math.max(0, parseInt(val, 10))
            ); // Ensure non-negative number
          }}
          className="max-w-[150px] w-full" // w-full ensures it takes full width in the column
          disabled={isUpdatingTime}
          min="0"
        />
      </div>
      <div>
        <Button
          onClick={handleSaveExamTime}
          disabled={isUpdatingTime}
          className="w-full max-w-[150px]"
        >
          {" "}
          {/* Added w-full and max-w to button for consistent width */}
          {isUpdatingTime ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <TimerIcon className="w-4 h-4 mr-2" />
          )}
          {isUpdatingTime ? "Saving..." : "Set Time"}
        </Button>
      </div>
      {/* {isUpdating && (
        <div className="absolute w-full h-full bg-slate-500/200 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )} */}
      <div className="font-medium flex items-center justify-between">
        Final Exam Questions for {initialData.name} Pacakge
        <div>
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
                      placeholder="e.g. 'What is the main concept of this package?'"
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
          <PackageQuestionsList
            onEdit={onEdit}
            onDelete={onDelete}
            items={initialData.questions || []}
          />
        </div>
      )}
    </div>
  );
};
