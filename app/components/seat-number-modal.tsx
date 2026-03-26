"use client";

import { useState } from "react";

export const LECTURER_SEAT = 0;

export default function SeatNumberModal({
  onSubmit,
}: {
  onSubmit: (seat: number) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 15) {
      setError("1〜15の番号を入力してください");
      return;
    }
    onSubmit(num);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl dark:bg-zinc-900"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          座席番号を入力してください
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          1〜15の番号を入力してください
        </p>
        <input
          type="number"
          min={1}
          max={15}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          autoFocus
          className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-3 text-center text-2xl font-bold text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="1"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          開始する
        </button>
        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => onSubmit(LECTURER_SEAT)}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            講師として参加
          </button>
        </div>
      </form>
    </div>
  );
}
