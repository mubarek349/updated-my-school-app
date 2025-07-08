"use client";
import Link from "next/link";
import React from "react";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <span
          className="text-6xl font-bold text-blue-500 mb-4 animate-bounce drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ animationDuration: "1.5s" }}
        >
          404
        </span>
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-6 text-center">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
