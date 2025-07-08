"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        {/* Bouncing Error SVG */}
        <svg
          className="w-20 h-20 text-red-500 mb-4 animate-bounce drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]"
          fill="none"
          viewBox="0 0 48 48"
          stroke="currentColor"
          style={{ animationDuration: "1.5s" }}
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            strokeWidth="4"
            className="stroke-current text-red-300"
          />
          <line
            x1="24"
            y1="14"
            x2="24"
            y2="28"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="24" cy="34" r="2.5" fill="currentColor" />
        </svg>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">
          Something went wrong!
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
