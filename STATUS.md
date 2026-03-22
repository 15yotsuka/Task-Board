# TaskBoard STATUS

## 概要
「開けば今日〜今後のタスクが一目でわかる」Todo管理iOSアプリ。React Native (Expo) + ローカルストレージ。

## 現在の状態
- 開発フェーズ: **審査中（Waiting for Review）**
- 最終更新: 2026-03-22
- 動作ステータス: ✅ 審査提出済み

## 最後にやったこと（2026-03-22）【i18n修正・全タスク削除追加・コード品質改善】
- PriorityBadge.tsx: 高/中/低のハードコードを t('priority.*') に変更
- SettingsSheet.tsx: サンプルデータのグループ名・タスク名を language === 'en' で英語切替
- useIAP.ts: Alert メッセージを t('iap.*') キーで翻訳化。ErrorCode.UserCancelled に統一
- useIAP.ts: restore関数を getAvailablePurchasesLib() の戻り値で判定するよう修正
- app/(tabs)/index.tsx:86: title="ホーム" → title={t('tab.home')}
- tasks.tsx: ゴミ箱ボタンに「全タスクを削除」を追加（3つ目の選択肢）
- tasks.tsx: 0件のとき破壊的スタイル→defaultスタイルに変更（2段アラート解消）
- tasks.tsx sections useMemo: 依存配列に t を追加（言語切替時の再計算）
- lib/dateUtils.ts: locale === ja → locale?.code === 'ja' に変更（3関数）
- lib/dateUtils.ts: 未使用の sectionLabels 削除
- lib/i18n/en.ts: settings.removeAds の価格を ¥370 → $2.99 に変更
- lib/i18n/{ja,en,index}.ts: bulkDelete.all, bulkDelete.confirmAll, iap.* キー群追加

## 最後にやったこと（2026-03-21）【アプリアイコン作成・反映】
- scripts/gen_icon.py: 青グラデーション背景+白いチェックリストカードのアイコン生成 (1024x1024)
- assets/icon.png を更新（デザインガイド付きプレースホルダー→本番アイコン）
- expo prebuild --clean → xcodebuild SUCCEEDED → xcrun devicectl install で実機反映
- pbxproj に DEVELOPMENT_TEAM=A5D536VS8R, CODE_SIGN_STYLE=Automatic を追記

## 前回（2026-03-21）【就活ボードスタイルでスクリーンショット再生成 + iPad追加 + ASCアップロード】
- gen_v2.py: 就活ボードスタイルで全8枚生成（グラデーション背景+デバイスフレーム+テキスト）
  - iPhone 6.7" (1290x2796) x4 → screenshots/v2/iphone/ss1-ss4.png
  - iPad 12.9" (2048x2732) x4 → screenshots/v2/ipad/ss1-ss4.png
  - スタイル: 上部にタイトル+サブタイトル（白）、白枠デバイスフレーム+ドロップシャドウ
- upload_v2.py: ASC に全8枚アップロード → 全件 COMPLETE
  - APP_IPHONE_67 Set ID: 467f079f-130a-44f9-98e2-12b02b4665a2
  - APP_IPAD_PRO_3GEN_129 Set ID: eebff9ed-2220-4752-8cd5-e08c7f3f9d14

## 前回（2026-03-21）【多言語対応（日本語/English）+ AdMobクラッシュ修正】
- lib/i18n/index.ts, ja.ts, en.ts: 翻訳ファイル新規作成（85キー）
- lib/useTranslation.ts: useTranslation hook 新規作成（t関数+locale+language）
- store/types.ts, useAppStore.ts: Language型・language/setLanguage追加・パーシスト対応
- lib/dateUtils.ts: format関数に locale パラメータ追加
- SettingsSheet.tsx: 言語ピッカー追加（日本語/English チップUI）
- 全UIファイル（12ファイル）: ハードコード文字列を t() に置換、日付フォーマット locale 対応
- pod install → expo run:ios --device でネイティブリビルド（RNGoogleMobileAdsModule not found 修正）
- 実機で言語切替・日付フォーマット切替・再起動後の保持を確認済み

## 未解決・次やること

### 審査通過後
1. [Yu手動] 審査通過メールを確認（通常1〜3日）
2. [Yu手動] App Store Connect → 「販売開始」を手動リリース or 自動公開を確認
3. [Yu手動] AdMob お支払いプロファイルを完成させる（警告バナーが出ている）

### 審査却下の場合
- 却下理由を確認してClaudeに共有 → 対応策を一緒に検討

### 実機テスト（任意）
4. 長押し選択モード → 複数選択 → 削除
5. ゴミ箱アイコン → 一括削除メニュー
6. 初回起動チュートリアル（スキップ含む）
7. IAP購入フロー（TestFlight経由）

### オプション
8. FABタップ時に選択日を AddTaskForm のデフォルトとして渡す

## 技術スタック
- React Native (Expo SDK 55), TypeScript, React 19
- Zustand v5 + AsyncStorage persist（ローカルオンリー）
- expo-router v3, expo-notifications
- react-native-reanimated v4, react-native-gesture-handler v2
- date-fns v4, @react-native-community/datetimepicker
- react-native-google-mobile-ads（ネイティブ統合済み、pod install必須）

## ファイル構成（主要ファイル）
- app/_layout.tsx — ルートレイアウト（GestureHandler Provider + テーマ切替overlay）
- app/(tabs)/index.tsx — ホーム（MonthView/WeekView切替 + 初回チュートリアル）
- app/(tabs)/tasks.tsx — タスク一覧（セクション分け・ソート・フィルター・長押し選択・一括削除）
- app/(tabs)/calendar.tsx — カレンダー（月/週切替）
- components/common/TutorialModal.tsx — 初回起動チュートリアル（4スライド）
- store/useAppStore.ts — Zustand全状態管理（AsyncStorage永続化）
- store/types.ts — Todo, Category, AppState型定義
- lib/theme.ts — カラーパレット・デザイントークン
- lib/dateUtils.ts — セクション判定・日付フォーマット
- lib/i18n/ja.ts, en.ts, index.ts — 翻訳ファイル（85キー）
- lib/useTranslation.ts — i18n hook（t関数 + date-fns locale）
- screenshots/gen_v2.py — v2スクリーンショット生成スクリプト（就活ボードスタイル）
- screenshots/upload_v2.py — ASCアップロードスクリプト（iPhone+iPad）
