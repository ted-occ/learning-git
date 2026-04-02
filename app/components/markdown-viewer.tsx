"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
import CheckpointButton from "./checkpoint-button";
import CommandStatusButtons from "./command-status-buttons";
import InteractiveCheckbox from "./interactive-checkbox";
import type { StepInfo } from "@/app/lib/extract-steps";
import type { CommandRecord } from "@/app/lib/store";

const markdownComponents: Components = {
  input: ({ type, checked, ...props }) => {
    if (type === "checkbox") {
      return <InteractiveCheckbox defaultChecked={checked} />;
    }
    return <input type={type} checked={checked} {...props} />;
  },
};

type Section = {
  type: "body" | "column";
  content: string;
};

type SubSection = {
  stepId: string | null;
  content: string;
};

type ContentPart = {
  type: "markdown" | "codeblock";
  content: string;
};

function extractColumnTitle(content: string): string {
  const match = content.match(/^###\s+コラム[：:]\s*(.+)$/m);
  return match ? match[1] : "コラム";
}

function removeColumnHeading(content: string): string {
  return content.replace(/^###\s+コラム[：:].*$/m, "").trim();
}

function splitSections(markdown: string): Section[] {
  const parts = markdown.split(/^---$/m);
  const sections: Section[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const isColumn = /^###\s+コラム[：:]/.test(trimmed);
    sections.push({
      type: isColumn ? "column" : "body",
      content: trimmed,
    });
  }

  return sections;
}

function splitSubSections(content: string): SubSection[] {
  const stepPattern = /^(### \d+-\d+\.\s+.+)$/m;
  const parts = content.split(stepPattern);
  const subs: SubSection[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const stepMatch = part.match(/^### (\d+-\d+)\.\s+/);

    if (stepMatch) {
      const heading = part;
      const body = i + 1 < parts.length ? parts[i + 1] : "";
      subs.push({
        stepId: stepMatch[1],
        content: heading + "\n" + body.trim(),
      });
      i++;
    } else if (part.trim()) {
      subs.push({ stepId: null, content: part.trim() });
    }
  }

  return subs;
}

function splitByCodeBlocks(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const regex = /^(```[^\n]*\n[\s\S]*?^```)/gm;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim();
    if (before) {
      parts.push({ type: "markdown", content: before });
    }
    parts.push({ type: "codeblock", content: match[1] });
    lastIndex = match.index + match[0].length;
  }

  const after = content.slice(lastIndex).trim();
  if (after) {
    parts.push({ type: "markdown", content: after });
  }

  return parts;
}

interface MarkdownViewerProps {
  content: string;
  dayId?: string;
  seatNumber?: number;
  steps?: StepInfo[];
}

export default function MarkdownViewer({
  content,
  dayId,
  seatNumber,
  steps,
}: MarkdownViewerProps) {
  const [savedStatuses, setSavedStatuses] = useState<Record<string, CommandRecord>>({});

  useEffect(() => {
    if (seatNumber === undefined) return;
    fetch("/api/command-status")
      .then((r) => r.json())
      .then((data) => {
        const mine = data.commandStatuses?.[seatNumber];
        if (mine) setSavedStatuses(mine);
      });
  }, [seatNumber]);

  const sections = splitSections(content);
  const showCheckpoints = dayId !== undefined && seatNumber !== undefined;

  // Build a map from stepId to commandStartIndex
  const stepStartMap = new Map<string, number>();
  if (steps) {
    for (const step of steps) {
      stepStartMap.set(step.id, step.commandStartIndex);
    }
  }

  return (
    <div>
      {sections.map((section, i) =>
        section.type === "column" ? (
          <details
            key={i}
            className="group my-10 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
          >
            <summary className="flex cursor-pointer items-center gap-2 px-6 py-4 text-base font-semibold text-amber-900 select-none dark:text-amber-200">
              <svg
                className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              コラム：{extractColumnTitle(section.content)}
              <span className="ml-auto text-xs font-normal text-amber-600 dark:text-amber-400">
                クリックで展開
              </span>
            </summary>
            <div className="border-t border-amber-200 px-8 py-1 dark:border-amber-900">
              <div className="prose prose-zinc max-w-none dark:prose-invert jp-article">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                  {removeColumnHeading(section.content)}
                </ReactMarkdown>
              </div>
            </div>
          </details>
        ) : showCheckpoints ? (
          <BodyWithCheckpoints
            key={i}
            content={section.content}
            dayId={dayId}
            seatNumber={seatNumber}
            stepStartMap={stepStartMap}
            savedStatuses={savedStatuses}
          />
        ) : (
          <div
            key={i}
            className="prose prose-zinc max-w-none dark:prose-invert jp-article"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
              {section.content}
            </ReactMarkdown>
          </div>
        )
      )}
    </div>
  );
}

function BodyWithCheckpoints({
  content,
  dayId,
  seatNumber,
  stepStartMap,
  savedStatuses,
}: {
  content: string;
  dayId: string;
  seatNumber: number;
  stepStartMap: Map<string, number>;
  savedStatuses: Record<string, CommandRecord>;
}) {
  const subs = splitSubSections(content);

  return (
    <div>
      {subs.map((sub, j) => (
        <div key={sub.stepId ?? `frag-${j}`}>
          <StepContent
            content={sub.content}
            stepId={sub.stepId}
            dayId={dayId}
            seatNumber={seatNumber}
            globalStartIndex={
              sub.stepId ? (stepStartMap.get(sub.stepId) ?? 0) : 0
            }
            savedStatuses={savedStatuses}
          />
        </div>
      ))}
    </div>
  );
}

function StepContent({
  content,
  stepId,
  dayId,
  seatNumber,
  globalStartIndex,
  savedStatuses,
}: {
  content: string;
  stepId: string | null;
  dayId: string;
  seatNumber: number;
  globalStartIndex: number;
  savedStatuses: Record<string, CommandRecord>;
}) {
  const parts = splitByCodeBlocks(content);
  let localCmdIndex = 0;

  return (
    <div id={stepId ? `step-${stepId}` : undefined}>
      {parts.map((part, k) => {
        if (part.type === "codeblock") {
          const currentLocal = localCmdIndex++;
          const globalNum = globalStartIndex + currentLocal + 1; // 1-based display
          const commandId = `${dayId}:${stepId || "intro"}:cmd${currentLocal}`;
          return (
            <div key={k}>
              <div className="prose prose-zinc max-w-none dark:prose-invert jp-article overflow-visible">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                  {part.content}
                </ReactMarkdown>
              </div>
              <CommandStatusButtons
                commandId={commandId}
                seatNumber={seatNumber}
                globalNumber={globalNum}
                initialStatus={savedStatuses[commandId]?.status ?? null}
              />
            </div>
          );
        }
        return (
          <div
            key={k}
            className="prose prose-zinc max-w-none dark:prose-invert jp-article"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
              {part.content}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
