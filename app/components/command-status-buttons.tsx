"use client";

import { useState } from "react";

interface Props {
  commandId: string;
  seatNumber: number;
  globalNumber: number;
}

type Status = "ok" | "error" | null;

export default function CommandStatusButtons({
  commandId,
  seatNumber,
  globalNumber,
}: Props) {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);

  const label = `#${globalNumber}`;

  async function report(newStatus: "ok" | "error") {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/command-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatNumber, commandId, status: newStatus }),
      });
      setStatus(newStatus);
    } finally {
      setLoading(false);
    }
  }

  if (status === "ok") {
    return (
      <div className="mb-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
          {label}
        </span>
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        OK
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
          {label}
        </span>
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
            />
          </svg>
          エラーを報告しました
        </span>
        <button
          onClick={() => report("ok")}
          className="ml-2 rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          解決した
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <button
        onClick={() => report("ok")}
        disabled={loading}
        className="flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        OK
      </button>
      <button
        onClick={() => report("error")}
        disabled={loading}
        className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        エラーが出た
      </button>
    </div>
  );
}
