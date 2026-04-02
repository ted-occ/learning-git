"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSeatNumber, useClearSeat } from "@/app/components/seat-number-provider";

export default function Day0Header() {
  const seatNumber = useSeatNumber();
  const clearSeat = useClearSeat();
  const router = useRouter();

  function handleSeatClick() {
    if (window.confirm("座席をクリアしてトップに戻りますか？")) {
      clearSeat();
      router.push("/");
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          &larr; トップへ戻る
        </Link>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Day 0
        </h1>
        <button
          onClick={handleSeatClick}
          className="ml-auto inline-flex cursor-pointer items-center rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-red-100 hover:text-red-700 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-red-900 dark:hover:text-red-200"
        >
          座席 #{seatNumber}
        </button>
      </div>
    </header>
  );
}
