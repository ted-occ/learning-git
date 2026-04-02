"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const days = [
  {
    id: "day0",
    href: "/day0",
    title: "Day 0：Gitをインストールする",
    desc: "Git for Windows のダウンロードとインストール",
  },
  {
    id: "day1",
    href: "/day1",
    title: "Day 1：書いて、記録して、公開する",
    desc: "GitHubアカウント作成、Git基本操作（add / commit / push）",
  },
  {
    id: "day2",
    href: "/day2",
    title: "Day 2：枝分かれして、合流して、まとめる",
    desc: "ブランチ、Pull Request、マージ",
  },
];

export default function Home() {
  const router = useRouter();
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/active-day")
      .then((r) => r.json())
      .then((data) => {
        setActiveDay(data.activeDay);
        setLoaded(true);
      });
  }, []);

  async function handleClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    dayId: string,
    href: string
  ) {
    if (e.shiftKey) {
      e.preventDefault();
      const newDay = activeDay === dayId ? null : dayId;
      const res = await fetch("/api/active-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayId: newDay }),
      });
      const data = await res.json();
      setActiveDay(data.activeDay);
      return;
    }

    if (activeDay !== null && activeDay !== dayId) {
      e.preventDefault();
      return;
    }
  }

  if (!loaded) return null;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="w-full max-w-2xl px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Git ハンズオン研修
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          新入社員向け Git / GitHub ハンズオン資料
        </p>
        <div className="mt-10 grid gap-4">
          {days.map((day) => {
            const isActive = activeDay === day.id;
            const isDisabled = activeDay !== null && activeDay !== day.id;

            return (
              <Link
                key={day.id}
                href={day.href}
                onClick={(e) => handleClick(e, day.id, day.href)}
                className={`group rounded-lg border px-6 py-5 transition ${
                  isActive
                    ? "border-blue-400 bg-blue-50 shadow-sm dark:border-blue-600 dark:bg-blue-950/40"
                    : isDisabled
                      ? "cursor-not-allowed border-zinc-100 bg-zinc-100 opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <h2
                    className={`text-lg font-semibold ${
                      isActive
                        ? "text-blue-700 dark:text-blue-300"
                        : isDisabled
                          ? "text-zinc-400 dark:text-zinc-600"
                          : "text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400"
                    }`}
                  >
                    {day.title}
                  </h2>
                  {isActive && (
                    <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white dark:bg-blue-500">
                      開催中
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-sm ${
                    isDisabled
                      ? "text-zinc-400 dark:text-zinc-600"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {day.desc}
                </p>
              </Link>
            );
          })}
        </div>
        <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            講師ダッシュボード &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
