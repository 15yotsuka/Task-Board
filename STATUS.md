# TaskBoard STATUS

## 概要
「開けば今日〜今後のタスクが一目でわかる」Todo管理iOSアプリ。React Native (Expo) + ローカルストレージ。

## 現在の状態
- 開発フェーズ: MVP開発中（Step 1 完了 → ローカルオンリー化完了）
- 最終更新: 2026-03-17
- 動作ステータス: ✅ TypeScriptエラー0件・Metro Bundler正常起動

## 最後にやったこと
- Supabase依存を完全除去しローカルオンリーに変更
- store/useAppStore.ts: Supabase同期コード5アクション削除、CRUD内のsync呼び出し削除
- store/types.ts: Supabase同期アクション型5つ削除
- app/_layout.tsx: 認証ガード除去、シンプルなレイアウトに変更
- app/(auth)/ ディレクトリ削除（login.tsx, _layout.tsx）
- lib/supabase.ts 削除
- .env.local 削除
- package.json: @supabase/supabase-js, expo-auth-session, expo-web-browser, expo-crypto 削除
- app.json: expo-web-browser plugin削除、scheme削除

## 未解決・次やること
- 実機テスト（通知・SafeArea）
- 設定画面（カテゴリ管理・テーマ切替）

## 技術スタック
- React Native (Expo SDK 55), TypeScript, React 19
- Zustand v5 + AsyncStorage persist（ローカルオンリー）
- expo-router v3, expo-notifications
- react-native-reanimated v4, react-native-gesture-handler v2
- date-fns v4, @react-native-community/datetimepicker

## ファイル構成（主要ファイル）
- app/_layout.tsx — ルートレイアウト（GestureHandler Provider）
- app/(tabs)/index.tsx — ホーム（サマリーカード + カテゴリ進捗）
- app/(tabs)/tasks.tsx — タスク一覧（セクション分け・ソート・フィルター・FAB）
- app/(tabs)/calendar.tsx — カレンダー（月/週切替）
- store/useAppStore.ts — Zustand全状態管理（AsyncStorage永続化）
- store/types.ts — Todo, Category, AppState型定義
- lib/theme.ts — カラーパレット・デザイントークン
- lib/dateUtils.ts — セクション判定・日付フォーマット
- lib/notifications.ts — 通知スケジュール
