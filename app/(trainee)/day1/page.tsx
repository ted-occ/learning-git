import fs from "fs";
import path from "path";
import Link from "next/link";
import { extractSteps } from "@/app/lib/extract-steps";
import { registerSteps } from "@/app/lib/store";
import Day1Client from "./day1-client";

export const dynamic = "force-dynamic";

export default function Day1Page() {
  const filePath = path.join(process.cwd(), "docs", "handson-day1.md");
  const content = fs.readFileSync(filePath, "utf-8");

  const steps = extractSteps(content);
  registerSteps("day1", steps);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            &larr; トップへ戻る
          </Link>
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Day 1
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Day1Client content={content} steps={steps} />
      </main>
    </div>
  );
}
