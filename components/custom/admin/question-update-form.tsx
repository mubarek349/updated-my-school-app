"use client";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { updateQuestion } from "@/actions/admin/creatingQuestion";

interface QuestionUpdateFormProps {
  initialData: {
    question: string;
  };
  coursesPackageId: string;
  courseId: string;
  chapterId: string;
  questionId: string;
  questionOptions?: string[];
  questionAnswer?: string[];
}

type FormValues = {
  question: string;
  options: string[];
  answer: string[];
};

export default function QuestionUpdateForm({
  coursesPackageId,
  initialData,
  courseId,
  chapterId,
  questionId,
  questionOptions,
  questionAnswer,
}: QuestionUpdateFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      question: initialData.question,
      options: questionOptions,
      answer: questionAnswer,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options" as never,
  });

  const isSubmitting = form.formState.isSubmitting;
  const isValid = form.formState.isValid;
  const router = useRouter();
  const addInputRef = useRef<HTMLInputElement>(null);

  // Toggle answer in the array
  const toggleAnswer = (optionText: string) => {
    const currentAnswers = form.getValues("answer") || [];
    if (currentAnswers.includes(optionText)) {
      form.setValue(
        "answer",
        currentAnswers.filter((ans) => ans !== optionText)
      );
    } else {
      form.setValue("answer", [...currentAnswers, optionText]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await updateQuestion(questionId, {
        question: values.question,
        options: values.options,
        answer: values.answer,
      });
      if (result.status === 200) {
        toast.success("Question updated successfully!");
        router.refresh();
        router.push(
          `/en/admin/coursesPackages/${coursesPackageId}/${courseId}/${chapterId}`
        );
      } else toast.error(result.error ?? "");
    } catch {
      toast.error("Failed to update question.");
    }
  };

  // Add option with Enter key
  const handleAddOption = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && addInputRef.current) {
      e.preventDefault();
      const value = addInputRef.current.value.trim();
      if (value) {
        append(value);
        addInputRef.current.value = "";
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 mt-4 bg-white p-6 rounded-lg shadow-lg"
      >
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <label className="block text-base font-semibold mb-2">
                Question
              </label>
              <FormControl>
                <Textarea
                  disabled={isSubmitting}
                  placeholder="e.g. 'What is the main concept of this chapter?'"
                  {...field}
                  className="resize-none min-h-[80px] border-2 border-slate-300 focus:border-sky-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <label className="block text-base font-semibold mb-2">
            Options{" "}
            <span className="text-xs text-gray-500">
              (Select all correct answers)
            </span>
          </label>
          <div className="space-y-2">
            {fields.map((field, index) => {
              const optionValue = form.watch("options")[index];
              const checked = (form.watch("answer") || []).includes(
                optionValue
              );
              return (
                <div
                  key={field.id}
                  className={cn(
                    "flex items-center gap-x-2 p-2 rounded-md border transition-all group",
                    checked
                      ? "bg-green-50 border-green-400"
                      : "bg-slate-50 border-slate-200"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAnswer(optionValue)}
                    className={cn(
                      "rounded-full p-1 transition-colors",
                      checked ? "text-green-600" : "text-gray-400"
                    )}
                    aria-label={
                      checked ? "Unmark as correct" : "Mark as correct"
                    }
                  >
                    {checked ? <CheckCircle size={20} /> : <Circle size={20} />}
                  </button>
                  <Input
                    {...form.register(`options.${index}` as const, {
                      required: true,
                    })}
                    placeholder={`Option ${index + 1}`}
                    disabled={isSubmitting}
                    className={cn(
                      "flex-1",
                      checked
                        ? "bg-green-100 border-green-400 text-green-700"
                        : ""
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 2 || isSubmitting}
                    className="ml-2 text-red-500 hover:text-red-700 transition-opacity opacity-60 hover:opacity-100"
                    aria-label="Remove option"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
            <div className="flex items-center gap-x-2 mt-2">
              <Input
                ref={addInputRef}
                placeholder="Add new option and press Enter"
                disabled={isSubmitting}
                onKeyDown={handleAddOption}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  if (addInputRef.current) {
                    const value = addInputRef.current.value.trim();
                    if (value) {
                      append(value);
                      addInputRef.current.value = "";
                    }
                  }
                }}
                className="text-sky-600 hover:text-sky-800 transition"
                aria-label="Add option"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-2 justify-end">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-6 py-2 text-base"
          >
            {isSubmitting ? "Updating..." : "Update Question"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
