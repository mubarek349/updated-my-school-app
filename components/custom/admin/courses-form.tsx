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
import { course, coursePackage } from "@prisma/client";
import axios from "axios";
import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { CoursesList } from "./courses-list";

interface CoursesFormProps {
  initialData: coursePackage & { courses: course[] };
  coursesPackageId: string;
}

const formSchema = z.object({
  title: z.string().min(1),
});

export const CoursesForm = ({
  initialData,
  coursesPackageId,
}: CoursesFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreating = () => setIsCreating((current) => !current);
  const lang = "en";
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" }, // Ensure default values
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(
        `/api/coursesPackages/${coursesPackageId}/courses`,
        values
      );
      form.reset();
      toast.success("Course Created");
      toggleCreating();
      router.refresh();
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Something went wrong.");
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      await axios.put(
        `/api/coursesPackages/${coursesPackageId}/courses/reorder`,
        {
          list: updateData,
        }
      );
      toast.success("Courses reordered");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/${lang}/admin/coursesPackages/${coursesPackageId}/${id}`);
  };
  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {isUpdating && (
        <div className="absolute w-full h-full bg-slate-500/200 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Courses of the Package
        <Button onClick={toggleCreating} variant="ghost">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" /> Add Course
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
                      placeholder="e.g. 'Introducton to the course'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={!isValid || isSubmitting}>
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
            !initialData.courses.length && "text-slate-500 italic"
          )}
        >
          {!initialData.courses.length && " NO Courses"}
          <CoursesList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.courses || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs mt-4 text-muted-foreground">
          Drag and drop to reorder Courses.
        </p>
      )}
    </div>
  );
};
