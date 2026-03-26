# TaskBoard — STATUS.md
最終更新: 2026-03-26

## 現在地
TestFlight 反映完了 — Build 6 が VALID になった・審査提出待ち

## 直近の変更（最新3件）
- 2026-03-26: app.json + Info.plist → buildNumber 5 → 6 にインクリメント
- 2026-03-26: app/_layout.tsx → mobileAds().initialize() を RootLayout に追加（起動クラッシュ修正）
- 2026-03-26: docs/index.html → GitHub Pages サポートページ追加・push済み

## 動作状況
- ✅ Build 6 (buildNumber: 6): TestFlight VALID（ID: 43a53694-3811-462d-a960-f07e4f87aa92）
- ⚠️ GitHub Pages: push済み・有効化待ち（Yu手動でSettings→Pages設定必要）
- ❌ Build 4 (buildNumber: "3"): リジェクト（Guideline 2.1a クラッシュ・Guideline 1.5 URL切れ）
- ✅ presubmit チェック: npm run presubmit で提出前検証可能

## バグ・注意事項
- NSUserTrackingUsageDescription をプラグイン設定に入れると App Privacy 宣言が必要になり Submission ブロッカーになる → 入れない（AdMob は非パーソナライズ広告で動作）
- ASC API で UNRESOLVED_ISSUES 状態からの再提出は不可 → Web UI から「審査に提出」が必須
- mobileAds().initialize() は必ず RootLayout の useEffect に入れること（未コミットのまま提出しないこと）
- 提出前は必ず npm run presubmit を実行してチェックをパスさせること

## 次やること
1. [Yu手動] ASC Web UI から Build 6 を選んで「審査に提出」
2. [Yu手動] GitHub: Settings → Pages → Source: Deploy from branch / Branch: main / Folder: /docs → Save
3. 承認後: AdMob お支払いプロファイルを完成させる

## 技術スタック
- React Native (Expo SDK 55), TypeScript, React 19
- Zustand v5 + AsyncStorage persist（ローカルオンリー）
- expo-router v3, expo-notifications
- react-native-reanimated v4, react-native-gesture-handler v2
- date-fns v4, @react-native-community/datetimepicker
- react-native-google-mobile-ads v16（ネイティブ統合済み、pod install必須）
- react-native-iap v14（非消耗型IAP: 広告削除 ¥370）

## ファイル構成（主要ファイル）
- app/_layout.tsx — ルートレイアウト（GestureHandler + AdMob初期化）
- app/(tabs)/index.tsx — ホーム（MonthView/WeekView切替 + チュートリアル）
- app/(tabs)/tasks.tsx — タスク一覧（セクション分け・一括削除）
- app/(tabs)/calendar.tsx — カレンダー（月/週切替）
- store/useAppStore.ts — Zustand全状態管理
- lib/notifications.ts — 通知スケジューリング
- lib/useIAP.ts — IAP購入・復元
- screenshots/gen_v2.py — スクリーンショット生成（就活ボードスタイル）
- screenshots/upload_v2.py — ASCアップロードスクリプト
