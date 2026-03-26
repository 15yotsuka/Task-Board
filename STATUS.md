# TaskBoard — STATUS.md
最終更新: 2026-03-24

## 現在地
審査待ち（Waiting for Review）— Build 4 を 2026-03-24 に再提出済み

## 直近の変更（最新3件）
- 2026-03-24: app/_layout.tsx → mobileAds().initialize() 追加（起動クラッシュ修正）
- 2026-03-24: ASC Support URL → https://github.com/15yotsuka/Task-Board に変更（API経由）
- 2026-03-24: App Review Notes → 7セクション形式に拡充（アプリ説明・IAP・外部サービス等）

## 動作状況
- ✅ Build 4 (buildNumber: "3"): VALID・ASCアップロード済み・審査待ち
- ✅ Support URL: https://github.com/15yotsuka/Task-Board（生きているリポジトリ）
- ✅ usesNonExemptEncryption: false（Build 4に設定済み）
- ✅ usesIdfa: false（バージョンに設定済み）
- ✅ App Review Notes: 7セクション形式で記入済み

## バグ・注意事項
- NSUserTrackingUsageDescription をプラグイン設定に入れると App Privacy 宣言が必要になり Submission ブロッカーになる → 入れない（AdMob は非パーソナライズ広告で動作）
- ASC API で UNRESOLVED_ISSUES 状態からの再提出は不可 → Web UI から「審査に提出」が必須
- react-native-google-mobile-ads は mobileAds().initialize() を明示的に呼ばないと iOS 26 でクラッシュする可能性

## 次やること
1. 審査結果を待つ — 再開条件: 承認 or 却下メールが届いたら
2. 承認後: App Store Connect → 「販売開始」を確認（自動リリース設定済み）
3. 承認後: AdMob お支払いプロファイルを完成させる（警告バナーが出ている）
4. 却下の場合: 却下理由を確認して対応（動画要求なら iPhone で画面収録して Reply）

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
