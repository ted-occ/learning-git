import fs from "fs";
import path from "path";
import { extractSteps } from "@/app/lib/extract-steps";
import { registerSteps } from "@/app/lib/store";
import Day0Client from "./day0-client";
import Day0Header from "./day0-header";

export const dynamic = "force-dynamic";

export default function Day0Page() {
  const filePath = path.join(process.cwd(), "docs", "handson-day0.md");
  const content = fs.readFileSync(filePath, "utf-8");

  const steps = extractSteps(content);
  registerSteps("day0", steps);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Day0Header />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Day0Client content={content} steps={steps} />
      </main>
    </div>
  );
}
