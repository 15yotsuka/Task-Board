# TaskBoard STATUS

## 概要
「開けば今日〜今後のタスクが一目でわかる」Todo管理iOSアプリ。React Native (Expo) + Supabase。

## 現在の状態
- 開発フェーズ: MVP開発中（Step 1 完了）
- 最終更新: 2026-03-17
- 動作ステータス: ✅ TypeScriptエラー0件（Supabase未接続のため実行は未確認）

## 最後にやったこと
- Expoプロジェクト初期化（SDK 55, React 19, TypeScript）
- 全依存パッケージインストール済み
- ディレクトリ構成をSPEC.md通りに作成
- store/types.ts: 型定義（Todo, Category, AppState, Priority）
- store/useAppStore.ts: Zustand + AsyncStorage persist + Supabase同期（楽観的更新）
- lib/theme.ts: カラーパレット・デザイントークン（ShukatsuBoard継承）
- lib/dateUtils.ts: セクション判定・日付フォーマット
- lib/supabase.ts: Supabaseクライアント（.env.localからURL/Key読込）
- lib/notifications.ts: expo-notifications通知スケジュール
- components/tasks/TaskCard.tsx: カテゴリカラーストリップ付きカード
- components/tasks/AddTaskForm.tsx: タスク追加ボトムシート
- components/tasks/TaskDetailModal.tsx: 3タブ詳細モーダル
- components/home/SummaryCard.tsx: サマリーカード
- components/home/CategoryProgress.tsx: カテゴリ別進捗バー
- components/calendar/MonthView.tsx: 月表示グリッド
- components/calendar/WeekView.tsx: 週表示タイムライン
- components/common/BottomSheet.tsx, PriorityBadge.tsx, CategoryPill.tsx
- app/_layout.tsx: 認証ガード付きルートレイアウト
- app/(auth)/login.tsx: Googleログイン画面
- app/(tabs)/ : ホーム・タスク・カレンダーの3タブ画面

## 未解決・次やること
- Supabaseプロジェクト作成 → .env.localにURL/Key設定
- Supabase SQLでテーブル作成（profiles, categories, todos）
- Google OAuth設定（Supabase Auth）
- 実機テスト（Google認証・通知・SafeArea）
- 設定画面（カテゴリ管理・テーマ切替・ログアウト）

## 技術スタック
- React Native (Expo SDK 55), TypeScript, React 19
- Zustand v5 + AsyncStorage persist
- expo-router v3, expo-notifications, expo-auth-session
- react-native-reanimated v4, react-native-gesture-handler v2
- @supabase/supabase-js, date-fns v4
- @react-native-community/datetimepicker

## ファイル構成（主要ファイル）
- app/_layout.tsx — ルートレイアウト（認証ガード + GestureHandler Provider）
- app/(auth)/login.tsx — Googleログイン画面
- app/(tabs)/index.tsx — ホーム（サマリーカード + カテゴリ進捗）
- app/(tabs)/tasks.tsx — タスク一覧（セクション分け・ソート・フィルター・FAB）
- app/(tabs)/calendar.tsx — カレンダー（月/週切替）
- store/useAppStore.ts — Zustand全状態管理 + Supabase同期
- store/types.ts — Todo, Category, AppState型定義
- lib/theme.ts — カラーパレット・デザイントークン
- lib/dateUtils.ts — セクション判定・日付フォーマット
- lib/supabase.ts — Supabaseクライアント
- lib/notifications.ts — 通知スケジュール
