# TaskBoard — STATUS.md
最終更新: 2026-03-26

## 現在地
TestFlight 反映完了 — Build 8 が VALID・Internal Testersグループに配布済み

## 直近の変更（最新3件）
- 2026-03-26: AdMob ネイティブ初期化（AppDelegate.swift）Build 8 として TestFlight へアップロード・Internal Testers 配布済み
- 2026-03-26: app.json + Info.plist → buildNumber 7 → 8 にインクリメント
- 2026-03-26: AdMobクラッシュ修正（100ms遅延・.catch追加・GADDelayAppMeasurementInit=true）→ Build 7 としてTestFlightへアップロード

## 動作状況
- ✅ Build 8 (buildNumber: 8): TestFlight VALID・Internal Testers配布済み（ID: 0b34145b-cbc3-4279-98db-378482a671fd）
- ✅ Build 7 (buildNumber: 7): TestFlight VALID（ID: 351a74f6-6a75-4dd0-86e3-5a0a14a7298f）
- ✅ Build 6 (buildNumber: 6): TestFlight VALID（ID: 43a53694-3811-462d-a960-f07e4f87aa92）
- ⚠️ GitHub Pages: push済み・有効化待ち（Yu手動でSettings→Pages設定必要）
- ❌ Build 4 (buildNumber: "3"): リジェクト（Guideline 2.1a クラッシュ・Guideline 1.5 URL切れ）
- ✅ presubmit チェック: npm run presubmit で提出前検証可能

## バグ・注意事項
- Google Mobile Ads SDK 13.1.0 では API 名が変更: GADMobileAds → MobileAds、sharedInstance() → shared プロパティ、start(completionHandler:) → start()
- NSUserTrackingUsageDescription をプラグイン設定に入れると App Privacy 宣言が必要になり Submission ブロッカーになる → 入れない（AdMob は非パーソナライズ広告で動作）
- ASC API で UNRESOLVED_ISSUES 状態からの再提出は不可 → Web UI から「審査に提出」が必須
- mobileAds().initialize() は AdBanner.tsx から削除済み。AppDelegate.swift の MobileAds.shared.start() のみで初期化
- 提出前は必ず npm run presubmit を実行してチェックをパスさせること
- usesNonExemptEncryption を None のままにすると betaGroups への配布が「not assignable」エラーになる → PATCH で false に設定してから配布

## 次やること
1. [Yu手動] TestFlight で Build 8 の動作確認（AdMob ネイティブ初期化でクラッシュが解消されているか）
2. 問題なければ ASC Web UI から Build 8 を選んで「審査に提出」
3. [Yu手動] GitHub: Settings → Pages → Source: Deploy from branch / Branch: main / Folder: /docs → Save
4. 承認後: AdMob お支払いプロファイルを完成させる

## 技術スタック
- React Native (Expo SDK 55), TypeScript, React 19
- Zustand v5 + AsyncStorage persist（ローカルオンリー）
- expo-router v3, expo-notifications
- react-native-reanimated v4, react-native-gesture-handler v2
- date-fns v4, @react-native-community/datetimepicker
- react-native-google-mobile-ads v16（ネイティブ統合済み、pod install必須）
- react-native-iap v14（非消耗型IAP: 広告削除 ¥370）

## ファイル構成（主要ファイル）
- app/_layout.tsx — ルートレイアウト（GestureHandler）
- ios/TaskBoard/AppDelegate.swift — AdMob ネイティブ初期化（MobileAds.shared.start()）
- app/(tabs)/index.tsx — ホーム（MonthView/WeekView切替 + チュートリアル）
- app/(tabs)/tasks.tsx — タスク一覧（セクション分け・一括削除）
- app/(tabs)/calendar.tsx — カレンダー（月/週切替）
- store/useAppStore.ts — Zustand全状態管理
- lib/notifications.ts — 通知スケジューリング
- lib/useIAP.ts — IAP購入・復元
- screenshots/gen_v2.py — スクリーンショット生成（就活ボードスタイル）
- screenshots/upload_v2.py — ASCアップロードスクリプト
