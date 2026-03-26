# TaskBoard — STATUS.md
最終更新: 2026-03-26

## 現在地
TestFlight 反映完了 — Build 13 が VALID・Internal Testersグループに配布済み

## 直近の変更（最新3件）
- 2026-03-26: AppDelegate.swift から MobileAds.shared.start() を完全削除（Build 13 クラッシュ根本修正）
- 2026-03-26: AdBanner.tsx — Build 12の null return を廃止、JS側から2秒遅延後に MobileAds().initialize() を呼ぶ形に復元
- 2026-03-26: Build 12 診断ビルド（AdBanner null return）→ クラッシュ継続 → AppDelegate start()が根本原因と確認

## 動作状況
- ✅ Build 13 (buildNumber: 13): TestFlight VALID・Internal Testers配布済み（ID: f275ff2d-4909-40a0-8fb0-a399b15302ba）
- ❌ Build 12 (buildNumber: 12): 診断ビルド・クラッシュ（AppDelegate start()が原因と判明）
- ❌ Build 11 (buildNumber: 11): クラッシュ（AppDelegate + JS 二重初期化）
- ⚠️ GitHub Pages: push済み・有効化待ち（Yu手動でSettings→Pages設定必要）

## バグ・注意事項
- クラッシュ根本原因（確定）: AppDelegate で MobileAds.shared.start { _ in } を呼ぶと、~0.5s 後に completion handler がバックグラウンドスレッドで発火。react-native-google-mobile-ads TurboModule が JS にイベントを通知しようとして ObjCTurboModule::performVoidMethodInvocation で ObjC 例外 → SIGABRT（Thread 9）
- 修正: AppDelegate から MobileAds 初期化を完全削除。JS 側から 2s 遅延後に MobileAds().initialize() を呼ぶ
- Google Mobile Ads SDK 13.1.0: API 名変更（GADMobileAds→MobileAds、sharedInstance()→shared）
- NSUserTrackingUsageDescription を入れると App Privacy 宣言必要でブロッカーになる → 入れない
- ASC API で UNRESOLVED_ISSUES 状態からの再提出不可 → Web UI から「審査に提出」が必須
- usesNonExemptEncryption=null のまま配布すると「not assignable」エラー → PATCH で false に設定してから配布

## 次やること
1. [Yu手動] TestFlight で Build 13 の動作確認（起動してクラッシュしないか、2 秒後に広告が出るか）
2. 問題なければ ASC Web UI から Build 13 を選んで「審査に提出」
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
