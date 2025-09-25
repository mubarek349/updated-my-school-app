"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, Copy, Check } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  const [copied, setCopied] = useState(false);

  // useEffect(() => {
  //   // Log the error for debugging in the console
  //   // eslint-disable-next-line no-console
  //   console.error(error);
  // }, []);

  const errorText = useMemo(() => {
    const parts = [
      `Message: ${error?.message || "Unknown error"}`,
      error?.name ? `Name: ${error.name}` : undefined,
      error?.cause ? `Cause: ${String(error.cause)}` : undefined,
      error?.stack ? `\nStack:\n${error.stack}` : undefined,
      error?.digest ? `\nDigest: ${error.digest}` : undefined,
    ].filter(Boolean);
    return parts.join("\n");
  }, [error]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: open a selectable modal-like window
      alert("Copy failed. You can select and copy the error details manually.");
    }
  }

  return (
    <main className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header / Brand */}
        <div className="mb-6 flex items-center gap-3">
          <div className="size-10 rounded bg-zinc-900 dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 font-extrabold text-lg">
              PR
            </span>
          </div>
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">darulkubra</p>
            <p className="text-xs text-zinc-500">Black & White</p>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/40 dark:to-zinc-900">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_10%,black,transparent)]">
            <div className="absolute -top-24 left-1/2 h-64 w-[110%] -translate-x-1/2 rotate-6 bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.06),transparent)] dark:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.06),transparent)]" />
          </div>

          <div className="relative p-6 sm:p-10">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="inline-block size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                  Unexpected error
                  {error?.digest && (
                    <span className="ml-2 rounded bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-mono">
                      digest:{error.digest.slice(0, 8)}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  Something went wrong
                </h1>
                <p className="mt-2 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
                  We hit a snag while loading this page. You can try again, go
                  back, or head home. If the issue persists, copy the error
                  details and share them with support.
                </p>
              </div>

              <div className="hidden sm:block text-zinc-300 dark:text-zinc-700">
                <AlertTriangle size={120} strokeWidth={1.75} aria-hidden />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <AlertTriangle className="size-4" aria-hidden />
                Try again
              </button>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Go back
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Home className="size-4" aria-hidden />
                Go home
              </Link>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                {copied ? (
                  <>
                    <Check className="size-4" aria-hidden /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" aria-hidden /> Copy error
                  </>
                )}
              </button>
              <a
                href="mailto:support@darulkubra.com?subject=App%20Error&body=Please%20paste%20the%20error%20details%20below:%0D%0A%0D%0A"
                className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Contact support
              </a>
            </div>

            {/* Error details */}
            <details className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/60">
              <summary className="cursor-pointer select-none font-medium text-zinc-800 dark:text-zinc-100">
                Show error details
              </summary>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-3 font-mono text-[12px] leading-relaxed text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {errorText}
              </pre>
            </details>

            <p className="mt-4 text-xs text-zinc-500">
              Tip: If the issue keeps happening, try clearing your cache or
              signing out and back in.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
