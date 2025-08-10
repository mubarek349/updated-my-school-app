"use client";

import { Trash } from "lucide-react";
import { Button } from "../../ui/button";
import { ConfirmModal } from "../../modals/confirm-modal";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { deleteCourse, publishCourse, unpublishCourse } from "@/actions/admin/creatingCourse";

interface CourseActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
  coursesPackageId: string;
}

export const CourseActions = ({
  disabled,
  courseId,
  isPublished,
  coursesPackageId,
}: CourseActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        const result = await unpublishCourse(coursesPackageId, courseId);

        if (result.status === 200) {
          toast.success(`Course "${result.data?.title}" unpublished`);
          router.refresh();
        } else {
          toast.error(result.error ?? "cannot be unpublished");
        }
      } else {
        const result = await publishCourse(coursesPackageId, courseId);

        if (result.status === 200) {
          toast.success(`Course "${result.data?.title}" published`);

          const end = Date.now() + 3 * 1000; // 3 seconds
          const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

          const frame = () => {
            if (Date.now() > end) return;

            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              startVelocity: 60,
              origin: { x: 0, y: 0.5 },
              colors: colors,
            });
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              startVelocity: 60,
              origin: { x: 1, y: 0.5 },
              colors: colors,
            });

            requestAnimationFrame(frame);
          };

          frame();

          router.refresh();
        } else {
          toast.error(result.error ?? "Unable to publish course");
        }
      }
    } catch {
      toast.error("something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsLoading(true);
      const result = await deleteCourse(coursesPackageId, courseId);
      if (result.status === 200) {
        toast.success("Course deleted");
        router.refresh();
        router.push(`/en/admin/coursesPackages/${coursesPackageId}`);
      } else {
        toast.error(result.error??"can not be deleted");
      }
    } catch {
      toast.error("something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex gap-x-1  ">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
        className={
          isPublished
            ? "bg-red-200 hover:bg-red-300"
            : "bg-blue-100 hover:bg-blue-300"
        }
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm">
          <Trash className="w-4 h-4 " />
        </Button>
      </ConfirmModal>
    </div>
  );
};
