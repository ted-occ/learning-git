"use client";

import MarkdownViewer from "@/app/components/markdown-viewer";
import { useSeatNumber } from "@/app/components/seat-number-provider";
import type { StepInfo } from "@/app/lib/extract-steps";

export default function Day0Client({
  content,
  steps,
}: {
  content: string;
  steps: StepInfo[];
}) {
  const seatNumber = useSeatNumber();

  return (
    <MarkdownViewer
      content={content}
      dayId="day0"
      seatNumber={seatNumber}
      steps={steps}
    />
  );
}
