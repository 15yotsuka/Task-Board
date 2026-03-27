# TaskBoard — STATUS.md
最終更新: 2026-03-27

## 現在地
Build 16 起動成功 — クラッシュ解消・審査提出待ち

## 直近の変更（最新3件）
- 2026-03-27: app.json に `"scheme": "taskboard"` 追加（Build 16 — 起動クラッシュ根本修正）
- 2026-03-27: expo-notifications を lazy require に変更、react-native-google-mobile-ads を完全除去（Build 14-15）
- 2026-03-26: Build 6〜15 のクラッシュ原因調査（最終的にシミュレータ Release ビルドで再現・特定）

## 動作状況
- ✅ Build 16 (buildNumber: 16): TestFlight 起動確認済み（ID: 0bb61e69-b396-4b6d-91aa-adcea239e1ab）
- ⚠️ GitHub Pages: push済み・有効化待ち（Yu手動でSettings→Pages設定必要）

## バグ・注意事項
- クラッシュ根本原因（確定）: app.json に `scheme` が未定義だったため、expo-router の ContextNavigator が起動時に "Cannot make a deep link into a standalone app with no custom scheme defined" で JS 例外 → ExceptionsManager.reportException が TurboModule void メソッド（バックグラウンドキュー）で ObjC 例外 → SIGABRT。開発ビルドでは `exp://` がデフォルトスキームのため発生しない
- react-native-google-mobile-ads は v1.0.0 から除去済み。v1.0.1 以降で再導入予定
- expo-notifications は lazy require に変更済み（起動時にネイティブモジュールをロードしない）
- ASC API で UNRESOLVED_ISSUES 状態からの再提出不可 → Web UI から「審査に提出」が必須
- usesNonExemptEncryption=null のまま配布すると「not assignable」エラー → PATCH で false に設定してから配布

## 次やること
1. [Yu手動] GitHub: Settings → Pages → Source: Deploy from branch / Branch: main / Folder: /docs → Save（サポートURL 404 修正）
2. [Yu手動] ASC Web UI から Build 16 を選んで「審査に提出」
3. 審査通過後: react-native-google-mobile-ads を再導入して広告を有効化（v1.0.1）

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
