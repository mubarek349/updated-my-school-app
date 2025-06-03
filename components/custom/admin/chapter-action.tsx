"use client";

import { Trash } from "lucide-react";
import { Button } from "../../ui/button";
import { ConfirmModal } from "../../modals/confirm-modal";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
  coursesPackageId: string;
}

export const ChapterActions = ({
  disabled,
  courseId,
  isPublished,
  coursesPackageId,
  chapterId,
}: ChapterActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.patch(
          `/api/coursesPackages/${coursesPackageId}/courses/${courseId}/chapters/${chapterId}/unpublish`
        );
        toast.success("chapter unpublished");
        router.refresh();
      } else {
        await axios.patch(
          `/api/coursesPackages/${coursesPackageId}/courses/${courseId}/chapters/${chapterId}/publish`
        );
        toast.success("chapter published");
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
        router.refresh();
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
      await axios.delete(
        `/api/coursesPackages/${coursesPackageId}/courses/${courseId}/chapters/${chapterId}`
      );
      toast.success("chapter deleted");
      router.refresh();
      router.push(`/en/admin/coursesPackages/${coursesPackageId}/${courseId}`);
    } catch {
      toast.error("something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex gap-x-1">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm">
          <Trash className="w-4 h-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
