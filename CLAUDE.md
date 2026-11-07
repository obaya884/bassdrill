# CLAUDE.md — Bass Drill 開発ガイド

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ベースの基礎練習メニュー（キー → メジャースケール → ペンタ → セブンス 4 種 → 度数 → ダイアトニック → ノンダイアトニック）を止まらずに一周させる、オーナー 1 人用の練習画面。PC のブラウザが主で、スマホ（移動中・レッスン中）でも使う静的な Web アプリ。サーバー・DB・認証を持たない。**判断に迷ったら[要求定義書](./docs/仕様/11_要求定義書.md)の価値 C-1〜C-5 とスコープ外表に照らす。** 練習の内容はレッスンで言われた形に合わせ、理論的に正しくても勝手に広げない（C-5）。

アプリ内の表示文言・コードコメント・docs・コミットメッセージは日本語。コミットメッセージは `type(scope): 要約` の形（`feat(key): …`・`fix(ui): …`・`style(quiz): …`・`refactor(ui): …`・`docs: …`）。本番は Vercel（https://bassdrill.vercel.app）。

## 最重要ルール: 仕様変更は docs/ 反映が先

挙動の契約はドキュメント群にある。実装中に挙動レベルの仕様判断が発生した場合、**コードより先に該当ドキュメントを更新する**。判断はオーナーとの対話でのみ決め、AI が単独で決めない。

- 価値・スコープ・要求の一覧（機能 F-XXX・非機能 N-XX）: [要求定義書](./docs/仕様/11_要求定義書.md) §6
- 要求 ID 単位の**挙動の規則**（キー決定のアルゴリズム・綴りの規則・出題の状態遷移・キー割り当て）: [要件定義書](./docs/仕様/12_要件定義書.md) §5
- 画面の構成・配置・寸法・色・文言: [画面定義書](./docs/仕様/13_画面定義書.md)。色と寸法は 13 §5 のトークンが正で、`src/index.css` の `@theme` はそこから写す
- 実装計画は `docs/案件/` に置き、完了したら削除する（経緯は git 履歴）

## docs の書き方の規約（hitosuji・Re-Buy と同じ）

- ファイル名は全体で一意な 2 桁番号（1X = 仕様 / 2X = 案件 / 3X = 検討）。`log_` の付属ファイルは親の番号を引き継ぐ
- **詳細は下位文書に 1 か所だけ書く**。上位文書は 1〜2 行の要約＋参照リンク
- **判断の経緯（「なぜそうしたか」）は本文に書かず、同階層の `log_<文書名>.md` へ日付順に積む**。本文は現在の仕様だけ
- 文書の分離・改番・節の移動をしたら、旧参照を grep で洗い出して追随させてから閉じる
- 表のセル内に `|` を書かない

## 技術スタックとコマンド

Vite 8 / React 19 / TypeScript 7 / Tailwind CSS 4（`@tailwindcss/vite`）/ Vitest 5 + jsdom + Testing Library / oxlint。Node 22 以上。

```sh
npm run dev        # 開発サーバー（http://localhost:5173）
npm test           # vitest run（全件）
npx vitest run src/domain/scale.test.ts          # 1 ファイルだけ
npx vitest run src/domain/scale.test.ts -t "次"   # 名前で絞る
npm run test:watch # vitest（監視）
npm run build      # tsc -b && vite build → dist/
npm run lint       # oxlint（.oxlintrc.json。react/rules-of-hooks はエラー）
npx tsc -p tsconfig.app.json --noEmit   # 型検査だけ
```

vitest の設定は `vite.config.ts` の `test` にある（jsdom・`globals: false`・`src/test/setup.ts`）。

## コード構成と設計原則

```
src/domain/      音楽理論の純粋関数。I/O・Date・Math.random を直接呼ばず引数で受ける。React を知らない
src/components/  指板（SVG）・コード表・キー選択の中身（KeyChooser。12 キーを 5 度圏の円に並べ、今のキーを強調し、今日のキーに `pick!!` の札）・PC のポップオーバー（KeyPopover）・度数カード（QuizCard）。ロジックを持たず domain の結果を描く
  sections/      節の中身。ScaleSection・PentaSection・ChordSection（コード表＋選択コードの指板の共通部）と、それにコード列を渡す薄い包み chordSections（Seventh／Diatonic／NonDiatonic）
  phone/         スマホ専用の部品（ヘッダー・点・シート・指板のスクロール箱）
src/app/         App.tsx（表示モードで DesktopApp か PhoneApp を描くだけ）・DesktopApp／PhoneApp（節の並べ方だけが違い、中身は同じ部品に compact を渡す）・useDrillState（状態と操作。両方の木が共有）・useDisplayMode（幅 1024 未満か pointer: coarse）・useSwipe（Pointer Events のスワイプ／タップ）・useQuizRunner（出題の状態遷移）・useKeyRoulette（開いた瞬間のルーレット）・useSound（音の入切と鳴らす入口。既定は切）・audioPlayer（Web Audio で段取りを鳴らす。AudioContext は注入し、テストは `src/test/fakeAudio.ts` の偽物）・sections.ts（6 節の ID と見出し）
```

domain の流れ: `pitch`（音名＝文字＋変化記号、ピッチクラス、文字送りの綴り）→ `scale`（`KEYS` は 5 度圏の順、`majorScale`、ペンタ、`nextOnCircle`）→ `chord`（`buildChord`。ダブル変化記号なら根音を読み替える F-305）→ `progression`（セブンス 4・ダイアトニック 7・ノンダイアトニック 8 と外れ音）→ `quiz`（コード度数の出題）→ `fretboard`（4 弦 0〜12 フレットのマーカー）→ `sound`（音の高さと鳴らす段取り `SoundStep[]`）。`dailyKey` は通算日と 12 日ブロックの順列。`table12.test.ts` が 12 キー全件の期待値表（N-04）で、理論の変更はまずこの表を直す。

- 依存方向は domain ← components ← app
- **理論の正しさは domain のテスト（12 キー全件の期待値表）で守る**（N-04）。テストの無い導出を画面に出さない。音名の綴り（F-105・F-305。ダブル変化記号の読み替え 12 箇所）はテストの期待値に明示してある
- 今日のキーは「12 日ブロックごとの順列」から通算日で引く（F-101）。日付は Asia/Tokyo の暦日。保存は要らない。開いた瞬間のルーレット（F-103）はヘッダーの文字だけを回す見た目で、キーの決定とは無関係。テストの既定は `prefers-reduced-motion: reduce`（`src/test/setup.ts`）で回さない。ルーレットのテストだけ `setReducedMotion(false)` にする
- **キーボードショートカットは持たない**（F-502）。`keydown` を購読しない。操作の入口はヘッダーのキー（キー選択の面。5 度圏の円と次のキー）・コード表の行・度数カードのボタン・ペンタのボタン・スマホの点と ‹ › とスワイプだけ
- **イベントハンドラは setState の更新関数の中で副作用を起こさない**。StrictMode で更新関数が二重実行され、2 つ進んだことがある
- **localStorage を使わない**（F-505 は廃止）。開き直すと手の選択なし・今日のキーで始まる。「次のキー」は今のキーの 5 度上（`nextOnCircle`。F-102）で、順列の位置は持たない。開いたまま日付をまたいだときの戻しは `useDrillState` が持つ
- **音は domain が段取り（何を何秒）を組み、app が Web Audio で鳴らす**（F-306・F-406）。入切は `useDrillState` の `sound` で既定は切（F-506）。鳴るのはコード表の行タップと度数の「答え」だけで、キー変更・「次」・節の移動では鳴らさない
- 外れ音の強調（赤・下線）はノンダイアトニックの節だけ（F-303）。セブンス・ダイアトニックではスケール外の音を含むコードでも強調しない
- **PC とスマホは両方の木を描いて片方を隠すのではなく、どちらか一方だけを描く**（F-606）。状態は `useDrillState` にあるので切り替えで失わない。キーを変えても見ている場所は動かさない（PC のスクロール位置・スマホの節）。節は 6 つで番号を付けない。PC は 6 節を等倍で縦に並べ、フォーカスの概念を持たない
- スワイプは Pointer Events で受ける（jsdom は Touch を作れない）。指板の箱 `[data-fretboard-scroll]` の中で始まったタッチはページ送りにしない。追随や iOS のパン衝突は jsdom で再現できないので実機で見る
- 描画中に `Date` や `Math.random` を直接呼ばない（lint の purity）。`useDrillState` は `now` を state に持ち、1 分ごとと `visibilitychange` で日付をまたいだか確かめる。テストは `App` / `useDrillState` の `now` 引数で日付を注入する
- テストの既定ビューポートは幅 1280・タッチなし（`src/test/setup.ts`）。スマホの木を描くテストは `setViewport(390)` を明示する（タッチ主体は第 2 引数 `true`。`src/test/viewport.ts` の matchMedia ポリフィルと組）
- Testing Library は `globals: false` なので `src/test/setup.ts` で `cleanup` を明示している。コード表は 3 節が同時に描かれるので、テストでは PC は `#section-<id>`、スマホは `section[data-focused="true"]`（`src/test/focused.ts`）に絞って要素を探す

## 開発の進め方

- TDD。テストを先に書いて失敗を見てから実装する
- 挙動レベルの仕様判断は委譲せず、オーナーとの対話で決めて docs/ を先に更新する
- Vercel へのデプロイ・GitHub への push は、オーナーに確認してから行う
