# TaskBoard — STATUS.md
最終更新: 2026-03-26

## 現在地
TestFlight 反映完了 — Build 11 が VALID・Internal Testersグループに配布済み

## 直近の変更（最新3件）
- 2026-03-26: AdBanner.tsx → MobileAds().initialize() Promise で SDK 初期化完了を待ってから BannerAd 表示（Build 11）
- 2026-03-26: AppDelegate.swift → MobileAds.shared.start() に completion handler 追加（belt-and-suspenders）
- 2026-03-26: ScreenHeader.tsx に hasOpened フラグ（SettingsSheet + useRnIAP を起動時マウント抑止）→ Build 10

## 動作状況
- ✅ Build 11 (buildNumber: 11): TestFlight VALID・Internal Testers配布済み（ID: cb06f044-ddf1-4c37-b0e6-825d73e106fa）
- ✅ Build 10 (buildNumber: 10): TestFlight VALID（クラッシュ再発のため廃止）
- ⚠️ GitHub Pages: push済み・有効化待ち（Yu手動でSettings→Pages設定必要）
- ❌ Build 4 (buildNumber: "3"): リジェクト（Guideline 2.1a クラッシュ・Guideline 1.5 URL切れ）

## バグ・注意事項
- クラッシュ原因: MobileAds SDK の start() が非同期のため、JS 側が BannerAd を即レンダリングすると初期化前に TurboModule を呼び出して SIGABRT → MobileAds().initialize() Promise で解決
- Google Mobile Ads SDK 13.1.0 では API 名が変更: GADMobileAds → MobileAds、sharedInstance() → shared プロパティ
- NSUserTrackingUsageDescription をプラグイン設定に入れると App Privacy 宣言が必要になり Submission ブロッカー → 入れない（AdMob は非パーソナライズ広告で動作）
- ASC API で UNRESOLVED_ISSUES 状態からの再提出は不可 → Web UI から「審査に提出」が必須
- usesNonExemptEncryption を None のままにすると betaGroups への配布が「not assignable」エラー → PATCH で false に設定してから配布

## 次やること
1. [Yu手動] TestFlight で Build 11 の動作確認（起動してクラッシュしないか、1〜2 秒後に広告が出るか）
2. 問題なければ ASC Web UI から Build 11 を選んで「審査に提出」
3. [Yu手動] GitHub: Settings → Pages → Source: Deploy from branch / Branch: main / Folder: /docs → Save（サポートURL 404 の修正）

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
