"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { HelpRequest, CommandRecord } from "@/app/lib/store";
import { LECTURER_SEAT } from "@/app/components/seat-number-modal";

interface ProgressData {
  checkpoints: Record<number, Record<string, number>>;
  steps: Record<
    string,
    { id: string; title: string; commandCount: number }[]
  >;
}

interface CommandData {
  commandStatuses: Record<number, Record<string, CommandRecord>>;
}

type Column = {
  type: "checkpoint" | "command";
  label: string;
  fullId: string;
  stepId: string;
  title: string;
};

const TRAINEE_SEATS = Array.from({ length: 15 }, (_, i) => i + 1);
const POLL_INTERVAL = 2000;
const SEAT_COL_W = 90;
const CELL_COL_W = 44;

export default function DashboardClient() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [commandData, setCommandData] = useState<CommandData | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [seatedUsers, setSeatedUsers] = useState<number[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const prevLecturerLastCol = useRef<string | null>(null);
  const syncing = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const [progRes, helpRes, cmdRes, dayRes, seatRes] = await Promise.all([
        fetch("/api/progress"),
        fetch("/api/help"),
        fetch("/api/command-status"),
        fetch("/api/active-day"),
        fetch("/api/seats"),
      ]);
      setProgress(await progRes.json());
      setHelpRequests((await helpRes.json()).requests);
      setCommandData(await cmdRes.json());
      setActiveDay((await dayRes.json()).activeDay);
      setSeatedUsers((await seatRes.json()).seats);
    } catch {
      // retry
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  function syncScroll(source: "header" | "body") {
    if (syncing.current) return;
    syncing.current = true;
    const from = source === "header" ? headerRef.current : bodyRef.current;
    const to = source === "header" ? bodyRef.current : headerRef.current;
    if (from && to) to.scrollLeft = from.scrollLeft;
    syncing.current = false;
  }

  async function dismissHelp(id: string) {
    await fetch(`/api/help/${id}`, { method: "DELETE" });
    setHelpRequests((prev) => prev.filter((r) => r.id !== id));
  }

  // Build columns
  const allSteps = progress?.steps ?? {};
  const dayIds = Object.keys(allSteps).sort().filter((id) => !activeDay || id === activeDay);
  const columns: Column[] = [];
  let globalCmdNum = 0;
  for (const dayId of dayIds) {
    for (const step of allSteps[dayId]) {
      for (let c = 0; c < (step.commandCount ?? 0); c++) {
        globalCmdNum++;
        columns.push({
          type: "command",
          label: `#${globalCmdNum}`,
          fullId: `${dayId}:${step.id}:cmd${c}`,
          stepId: step.id,
          title: `${step.title} — コマンド #${globalCmdNum}`,
        });
      }
    }
  }

  const stepGroups: { key: string; stepId: string; span: number }[] = [];
  for (const col of columns) {
    const last = stepGroups[stepGroups.length - 1];
    const groupKey = col.fullId.split(":").slice(0, 2).join(":");
    if (last && last.key === groupKey) last.span++;
    else stepGroups.push({ key: groupKey, stepId: col.stepId, span: 1 });
  }

  const tableWidth = SEAT_COL_W + columns.length * CELL_COL_W;

  function getCellStatus(seat: number, col: Column): "none" | "ok" | "error" {
    if (col.type === "checkpoint")
      return progress?.checkpoints?.[seat]?.[col.fullId] ? "ok" : "none";
    const cmd = commandData?.commandStatuses?.[seat]?.[col.fullId];
    if (!cmd) return "none";
    return cmd.status;
  }

  function seatHasHelp(seat: number) {
    return helpRequests.some((r) => r.seatNumber === seat);
  }
  function seatHasError(seat: number) {
    const cmds = commandData?.commandStatuses?.[seat];
    if (!cmds) return false;
    return Object.values(cmds).some((v) => v.status === "error");
  }

  // Auto-scroll
  useEffect(() => {
    let lastFullId: string | null = null;
    for (const col of columns) {
      if (getCellStatus(LECTURER_SEAT, col) !== "none") lastFullId = col.fullId;
    }
    if (lastFullId && lastFullId !== prevLecturerLastCol.current && headerRef.current) {
      prevLecturerLastCol.current = lastFullId;
      const cell = headerRef.current.querySelector(`[data-col-id="lecturer-${lastFullId}"]`);
      if (cell) cell.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, commandData]);

  function colGroup() {
    return (
      <colgroup>
        <col style={{ width: SEAT_COL_W, minWidth: SEAT_COL_W }} />
        {columns.map((col) => (
          <col key={col.fullId} style={{ width: CELL_COL_W, minWidth: CELL_COL_W }} />
        ))}
      </colgroup>
    );
  }

  function renderCells(seat: number, isLecturer: boolean) {
    return columns.map((col) => {
      const status = getCellStatus(seat, col);
      return (
        <td
          key={col.fullId}
          data-col-id={isLecturer ? `lecturer-${col.fullId}` : undefined}
          className="border-b border-zinc-100 py-1.5 text-center dark:border-zinc-800"
        >
          {status === "ok" ? (
            <span className="inline-block h-4 w-4 rounded bg-green-500 text-[10px] leading-4 text-white">✓</span>
          ) : status === "error" ? (
            <span className="inline-block h-4 w-4 rounded bg-red-500 text-[10px] leading-4 text-white">!</span>
          ) : (
            <span className="inline-block h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-800" />
          )}
        </td>
      );
    });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Page header */}
      <header className="shrink-0 border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">講師ダッシュボード</h1>
          {activeDay && (
            <span className="rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
              {activeDay.replace("day", "Day ")} 開催中
            </span>
          )}
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Git ハンズオン研修 — リアルタイム進捗</span>
          <div className="ml-auto flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green-500" /> OK</span>
            <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-500" /> エラー</span>
            <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-zinc-200 dark:bg-zinc-700" /> 未報告</span>
          </div>
        </div>
      </header>

      {/* Help Requests */}
      {helpRequests.length > 0 && (
        <div className="shrink-0 border-b border-red-200 bg-red-50 px-6 py-4 dark:border-red-900 dark:bg-red-950/40">
          <h2 className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">ヘルプリクエスト ({helpRequests.length})</h2>
          <div className="flex flex-wrap gap-3">
            {helpRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm shadow-sm animate-pulse dark:border-red-800 dark:bg-zinc-900">
                <span className="font-bold text-red-700 dark:text-red-400">座席 {req.seatNumber}</span>
                {req.currentSection && <span className="text-zinc-500 dark:text-zinc-400">セクション {req.currentSection}</span>}
                <button onClick={() => dismissHelp(req.id)} className="ml-1 rounded px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40">対応済み</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {columns.length === 0 ? (
        <div className="p-6"><p className="text-sm text-zinc-500 dark:text-zinc-400">受講者がページを開くとステップが表示されます...</p></div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Fixed header table (with horizontal scrollbar) */}
          <div
            ref={headerRef}
            onScroll={() => syncScroll("header")}
            className="shrink-0 overflow-x-auto border-b-2 border-blue-300 bg-white shadow-sm dark:border-blue-800 dark:bg-zinc-900"
          >
            <table className="border-collapse text-sm" style={{ width: tableWidth, tableLayout: "fixed" }}>
              {colGroup()}
              <thead>
                <tr>
                  <th rowSpan={2} className="border-b border-r border-zinc-200 bg-white px-2 py-2 text-left text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">座席</th>
                  {stepGroups.map((g) => (
                    <th key={g.key} colSpan={g.span} className="overflow-visible border-b border-x border-zinc-200 p-0 text-center text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                      <div className="relative flex items-center justify-center py-1">
                        <span className="whitespace-nowrap">{g.stepId}</span>
                      </div>
                    </th>
                  ))}
                </tr>
                <tr>
                  {columns.map((col) => (
                    <th key={col.fullId} className="whitespace-nowrap border-b border-zinc-200 py-1 text-center dark:border-zinc-700" title={col.title}>
                      <span className={`text-[10px] ${col.type === "command" ? "font-mono text-zinc-400 dark:text-zinc-500" : "font-medium text-zinc-600 dark:text-zinc-400"}`}>
                        {col.type === "checkpoint" ? "✓" : col.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-50 dark:bg-blue-950/30">
                  <td className="border-b border-r border-zinc-200 bg-blue-50 px-2 py-2 font-medium text-blue-900 dark:border-zinc-700 dark:bg-blue-950/30 dark:text-blue-200">講師</td>
                  {renderCells(LECTURER_SEAT, true)}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Scrollable body table (synced horizontally, scrollable vertically) */}
          <div
            ref={bodyRef}
            onScroll={() => syncScroll("body")}
            className="flex-1 overflow-auto"
          >
            <table className="border-collapse text-sm" style={{ width: tableWidth, tableLayout: "fixed" }}>
              {colGroup()}
              <tbody>
                {TRAINEE_SEATS.map((seat) => {
                  const hasHelp = seatHasHelp(seat);
                  const hasErr = seatHasError(seat);
                  const isSeated = seatedUsers.includes(seat);
                  return (
                    <tr key={seat} className={hasHelp ? "bg-red-50 dark:bg-red-950/30" : hasErr ? "bg-orange-50/50 dark:bg-orange-950/20" : ""}>
                      <td className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-white px-2 py-2 font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {hasHelp && <span className="inline-block h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-500" />}
                          {hasErr && !hasHelp && <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />}
                          {!hasHelp && !hasErr && isSeated && <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />}
                          {seat}
                          {!isSeated && <span className="text-[10px] text-zinc-400">空席</span>}
                        </div>
                      </td>
                      {renderCells(seat, false)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
