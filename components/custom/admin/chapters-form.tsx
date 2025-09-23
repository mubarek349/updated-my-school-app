"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormMessage,
  FormControl,
  FormItem,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { chapter, course } from "@prisma/client";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { ChaptersList } from "./chapters-list";
import { createChapter, reorderChapters } from "@/actions/admin/creatingChapter";
interface ChaptersFormProps {
  initialData: course & { chapters: chapter[] };
  courseId: string;
  coursesPackageId: string;
}

const formSchema = z.object({
  title: z.string().min(1),
});
const lang = "en";
export const ChaptersForm = ({
  initialData,
  courseId,
  coursesPackageId,
}: ChaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreating = () => setIsCreating((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" }, // Ensure default values
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await createChapter(
        coursesPackageId,
        courseId,
        values.title
      );
      if (result.status === 200) {
        toast.success("Chapter created");
        toggleCreating();
        router.refresh();
      } else {
        toast.error(result.error ?? "");
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Something went wrong.");
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      const result = await reorderChapters(updateData);
      if (result.status === 200) {
        toast.success(result.message??"Chapters reordered");
        router.refresh();
      } else {
        toast.error(result.error??"");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(
      `/${lang}/admin/coursesPackages/${coursesPackageId}/${courseId}/${id}`
    );
  };
  return (
    <div className="mt-6 border bg-blue-100 rounded-md p-4 sm:p-6 overflow-auto scrollbar-hide">
      {isUpdating && (
        <div className="absolute inset-0 bg-slate-500/20 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base sm:text-lg font-medium">Course Chapters</h2>
        <Button
          onClick={toggleCreating}
          variant="ghost"
          className="w-full sm:w-auto"
        >
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" /> Add a chapter
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4 px-1 sm:px-0"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction to the course'"
                      className="min-h-[120px] text-sm sm:text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full sm:w-auto"
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
            !initialData.chapters.length && "text-slate-500 italic"
          )}
        >
          {!initialData.chapters.length && "No chapters"}
          <ChaptersList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.chapters || []}
            coursesPackageId={coursesPackageId}
            courseId={courseId}
          />
        </div>
      )}

      {!isCreating && (
        <p className="text-xs mt-4 text-muted-foreground">
          Drag and drop to reorder chapters.
        </p>
      )}
    </div>
  );
};
