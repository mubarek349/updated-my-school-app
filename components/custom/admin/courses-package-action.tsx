"use client";

import { FileQuestion, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import { ConfirmModal } from "../../modals/confirm-modal";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

interface coursesPackageActionsProps {
  disabled: boolean;
  isPublished: boolean;
  coursesPackageId: string;
}

export const CoursesPackageActions = ({
  disabled,
  isPublished,
  coursesPackageId,
}: coursesPackageActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.patch(`/api/coursesPackages/${coursesPackageId}/unpublish`);
        toast.success("coursesPackage unpublished");
        router.refresh();
      } else {
        await axios.patch(`/api/coursesPackages/${coursesPackageId}/publish`);
        toast.success("coursesPackage published");

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
      await axios.delete(`/api/coursesPackages/${coursesPackageId}`);
      toast.success("coursesPackage deleted");
      router.refresh();
      router.push(`/en/admin/coursesPackages`);
    } catch {
      toast.error("something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const routers = useRouter();
  return (
    <div className="flex gap-1 flex-wrap items-center justify-end mr-2">
      <Button
        onClick={() => {
          routers.push(
            `/en/admin/coursesPackages/${coursesPackageId}/questions`
          );
        }}
        size="sm"
        className="bg-blue-600"
      >
        <FileQuestion className="w-4 h-4" />
        Final Exam Questions
      </Button>
      <div className="flex items-center gap-1">
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
    </div>
  );
};
