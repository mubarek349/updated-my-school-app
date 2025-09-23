import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] bg-red-100 dark:bg-red-900 rounded-xl">
    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
    <span className="text-xl font-semibold text-red-700 dark:text-red-300 mb-4">{error}</span>
    <Button
      onClick={onRetry}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
      aria-label="Retry loading chapter data"
    >
      <RefreshCw className="w-4 h-4" />
      Retry
    </Button>
  </div>
);
