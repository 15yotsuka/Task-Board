# かんたんタスクカレンダー (TaskBoard) — STATUS.md
最終更新: 2026-04-01

## 現在地
v1.1.0 (Build 26): App Store審査提出済み（WAITING_FOR_REVIEW）

## 直近の変更（最新3件）
- 2026-04-01: v1.1.0 App Store申請提出（WAITING_FOR_REVIEW）Build 26紐付け済み
- 2026-04-01: プロモスクリーンショット修正（見切れ修正）→ ASC v1.1.0にアップロード完了（iPhone+iPad各4枚）
- 2026-04-01: Build 26 TestFlight配布完了（Build 25から変更なし・usesNonExemptEncryption設定漏れ修正）

## 動作状況
- ✅ Build 24 (buildNumber: 24): App Store審査中（WAITING_FOR_REVIEW）
- ✅ ASC メタデータ: アプリ名「かんたんタスクカレンダー」・説明文・キーワード・App Review Notes（7セクション）設定済み
- ✅ カテゴリ: PRODUCTIVITY 設定済み
- ✅ ビルド: Build 24 紐付け済み（usesNonExemptEncryption=false）
- ✅ スクリーンショット: iPhone 4枚・iPad 4枚（COMPLETE）

## スクリーンショット管理
- gen_v2.py の REAL_SS_DIR = `Downloads/画像/`（画像ファイルはここ）
- 出力先: `/Users/yuotsuka/taskboard/screenshots/v2/`（プロジェクト外）
- upload_v2.py の VER_LOC_ID = `e20b9f95...`（v1.1.0 ja）
- fit_to_frame は幅優先フィット（水平クロップなし）に変更済み

## バグ・注意事項
- `expo prebuild --clean` が Info.plist を再生成するため、CFBundleDisplayName は app.json の ios.infoPlist に設定すること（対応済み）
- post_upload.py は 30秒待機では不足 → ship.sh の Step 5 が失敗する場合は `python3 scripts/post_upload.py` を手動実行
- presubmit_check.js は prebuild 前に Info.plist を読む → buildNumber 更新時は Info.plist も同時に更新が必要
- `やることカレンダー`・`ToDoカレンダー` は他アカウントが使用中 → `かんたんタスクカレンダー`を使用
- ASC API: UNRESOLVED_ISSUES 状態の submission は `canceled: true` で PATCH すれば CANCELING → COMPLETE に移行できる（Web UIは不要だった）
- expo prebuild --clean 後はXcode署名設定がリセットされる → xcodebuild に `CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=A5D536VS8R` を必ず付ける

## 次やること
1. 審査通過を待つ（通常1〜2日）
2. 審査通過後: リリース → TestFlightのプレビュースクショも自動更新される
3. 将来: react-native-google-mobile-ads を再導入して広告＋IAP を有効化（v1.2）

## 技術スタック
- React Native (Expo SDK 55), TypeScript, React 19
- Zustand v5 + AsyncStorage persist（ローカルオンリー）
- expo-router v3, expo-notifications
- react-native-reanimated v4, react-native-gesture-handler v2
- date-fns v4, @react-native-community/datetimepicker

## ファイル構成（主要ファイル）
- app/(tabs)/index.tsx — ホーム（MonthView/WeekView切替 + FAB + チュートリアル）
- app/(tabs)/tasks.tsx — タスク一覧（セクション分け・一括削除）
- store/useAppStore.ts — Zustand全状態管理
- lib/notifications.ts — 通知スケジューリング
- lib/i18n/ — 日英翻訳（ja.ts / en.ts / index.ts）
- scripts/asc_submit.js — ASCメタデータ更新スクリプト
- scripts/ship.sh — ビルド→TestFlight配布自動化
