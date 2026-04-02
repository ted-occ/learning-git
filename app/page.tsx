import Link from "next/link";

export default function Home() {
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
          <Link
            href="/day1"
            className="group rounded-lg border border-zinc-200 bg-white px-6 py-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
              Day 1：書いて、記録して、公開する
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              GitHubアカウント作成、Git基本操作（add / commit / push）
            </p>
          </Link>
          <Link
            href="/day2"
            className="group rounded-lg border border-zinc-200 bg-white px-6 py-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
              Day 2：枝分かれして、合流して、まとめる
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              ブランチ、Pull Request、マージ
            </p>
          </Link>
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
