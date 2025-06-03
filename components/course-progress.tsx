import { Progress } from "./ui/progress";

interface CourseProgressProps {
  value: number; // Progress percentage
  // variant?: "default" | "success",
  // size?: "default" | "sm";
}

export const CourseProgress = ({ value }: CourseProgressProps) => {
  return (
    <div className="w-full">
      <Progress value={value} />
      <p>
        {Math.round(value)} % Complete
      </p>
    </div>
  );
};
