# Git ハンズオン研修

新入社員向け Git / GitHub ハンズオン研修のプレビュー & 進捗管理アプリです。

## 概要

2日間のハンズオン研修で使用するマークダウン資料を、ブラウザ上で見やすく表示します。
講師がリアルタイムで受講者の進捗を把握できるダッシュボード機能を備えています。

### 研修内容

- **Day 1** — Git基本操作（GitHubアカウント作成、add / commit / push）
- **Day 2** — ブランチとPull Request

### 主な機能

- マークダウンプレビュー（コラムの折りたたみ表示）
- 受講者の座席番号による識別
- セクションごとの「できた」チェックポイント
- コマンド実行ごとのOK / エラー報告（通し番号付き）
- 「助けてほしい」ヘルプシグナルボタン
- 講師ダッシュボード（リアルタイム進捗マトリクス、ヘルプリクエスト通知）

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 でアプリが起動します。

## 使い方

### 受講者

1. `http://<講師のIP>:3000/day1` にアクセス
2. 座席番号（1〜15）を入力
3. ハンズオンを進めながら、コマンド実行後に「OK」または「エラーが出た」を報告
4. セクション完了時に「できた」をクリック
5. 困ったら右下の「助けてほしい」ボタンを押す

### 講師

1. `http://localhost:3000/day1?seat=0` で講師としてハンズオンを進行
2. `http://localhost:3000/dashboard` で全受講者の進捗をリアルタイム確認

### テスト

同じブラウザで複数の座席をテストする場合は、URLパラメータを使います。

```
http://localhost:3000/day1?seat=0   # 講師
http://localhost:3000/day1?seat=1   # 座席1
http://localhost:3000/day1?seat=2   # 座席2
```

## 技術スタック

- [Next.js](https://nextjs.org/) 16（App Router）
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) v4
- [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm
- インメモリデータストア（外部DB不要）

## ライセンス

[MIT](./LICENSE)
