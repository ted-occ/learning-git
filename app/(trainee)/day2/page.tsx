import fs from "fs";
import path from "path";
import { extractSteps } from "@/app/lib/extract-steps";
import { registerSteps } from "@/app/lib/store";
import Day2Client from "./day2-client";
import Day2Header from "./day2-header";

export const dynamic = "force-dynamic";

export default function Day2Page() {
  const filePath = path.join(process.cwd(), "docs", "handson-day2.md");
  const content = fs.readFileSync(filePath, "utf-8");

  const steps = extractSteps(content);
  registerSteps("day2", steps);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Day2Header />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Day2Client content={content} steps={steps} />
      </main>
    </div>
  );
}
