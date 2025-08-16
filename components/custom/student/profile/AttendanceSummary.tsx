import { CheckCircle, XCircle } from "lucide-react";

type AttendanceSummaryProps = {
  present: number;
  absent: number;
};

export default function AttendanceSummary({ present, absent }: AttendanceSummaryProps) {
  const total = present + absent;
  const presentPercent = total ? Math.round((present / total) * 100) : 0;
  const absentPercent = total ? Math.round((absent / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 w-full max-w-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📋 Attendance Summary</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Present</span>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {present} days ({presentPercent}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Absent</span>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {absent} days ({absentPercent}%)
          </span>
        </div>
      </div>

      <div className="mt-4 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-black"
          style={{ width: `${presentPercent}%` }}
          aria-label={`Present: ${presentPercent}%`}
        />
      </div>
    </div>
  );
}
