# TaskBoard STATUS

## 概要
「開けば今日〜今後のタスクが一目でわかる」Todo管理iOSアプリ。React Native (Expo) + ローカルストレージ。

## 現在の状態
- 開発フェーズ: 品質スコア100点達成（ビルドエラー0件）
- 最終更新: 2026-03-20
- 動作ステータス: ✅ ビルドエラー0件（expo export確認済み）

## 最後にやったこと（2026-03-20）【品質改善ラウンド4・checkスキル100点達成】
- BottomSheet.tsx: KeyboardAvoidingView → Keyboard.addListener方式に変更（Modal内でKAVが機能しないiOS仕様バグ修正）
- BottomSheet.tsx: styles.sheetにflex:1追加（ScrollView 0px高さバグ解消）
- calendar.tsx: 選択日のタスクなし時に「この日のタスクはありません」表示追加（空状態UX改善）

## 前回（2026-03-20）【品質改善ラウンド2】
- index.tsx: `type TaskSection` をimport文の間から正しい位置へ移動
- index.tsx: `handleOpenDetail` を `renderItem` より前に宣言（TDZ修正）
- tasks.tsx: 同上（TDZ修正）
- AddTaskForm.tsx: `cat.color + '1A'` → `withAlpha(cat.color, 0.1)` に統一

## 前回（2026-03-20）【品質改善ラウンド1】
- BottomSheet.tsx: Modal内GestureHandlerRootView追加・open時withSpring化・grabBarにhitSlop追加
- useAppStore.ts: サンプルデータ削除・初期値空配列化
- index.tsx: ListEmptyComponent初回ガイダンスUI、groups→groupedシャドーイング修正、renderItem useCallback化、removeClippedSubviews
- tasks.tsx: chipScrollをcontentContainerStyle化、ListEmptyComponent改善（icon+hint）、groups→grouped、renderItem useCallback、overdue赤色、removeClippedSubviews、SectionListData型追加
- ScreenHeader.tsx: title flex:1追加
- calendar.tsx: トグルをセグメントコントロール風に（overflow:hidden+角丸統一）
- TaskCard.tsx: categories/groupsセレクターにuseShallow追加（不要再レンダリング防止）
- WeekView.tsx: accentColor+'1A' → withAlpha(accentColor, 0.1) に統一
- CategoryProgress.tsx, SummaryCard.tsx: 未使用削除

## 未解決・次やること
1. 実機テスト: FABタップ→BottomSheet開閉・ドラッグ閉じ動作確認（BottomSheet修正後の確認必須）
2. 実機テスト: キーボード表示時にBottomSheet内コンテンツが正しく表示されるか確認
3. 実機テスト: 通知・SafeArea確認
4. AsyncStorageに古いサンプルデータが残っている端末はアプリ再インストールが必要
5. （オプション）expo-blur インストールでBottomSheetオーバーレイをblur対応できる

## 技術スタック
- React Native (Expo SDK 55), TypeScript, React 19
- Zustand v5 + AsyncStorage persist（ローカルオンリー）
- expo-router v3, expo-notifications
- react-native-reanimated v4, react-native-gesture-handler v2
- date-fns v4, @react-native-community/datetimepicker

## ファイル構成（主要ファイル）
- app/_layout.tsx — ルートレイアウト（GestureHandler Provider）
- app/(tabs)/index.tsx — ホーム（アジェンダ + フィルターchip + statBar）
- app/(tabs)/tasks.tsx — タスク一覧（セクション分け・ソート・フィルター・FAB）
- app/(tabs)/calendar.tsx — カレンダー（月/週切替）
- store/useAppStore.ts — Zustand全状態管理（AsyncStorage永続化）
- store/types.ts — Todo, Category, AppState型定義
- lib/theme.ts — カラーパレット・デザイントークン
- lib/dateUtils.ts — セクション判定・日付フォーマット
- lib/notifications.ts — 通知スケジュール
