# React Native / Expo モバイルアプリ開発ガイド

就活ボード・タスクボードのような実装パターンをまとめたリファレンス。
実際のコードをベースにしているので、そのまま転用できる。

---

## 目次

1. [セーフエリア（Safe Area）](#1-セーフエリア)
2. [スクロールの滑らかさ](#2-スクロール)
3. [テーマ・ダークモード](#3-テーマダークモード)
4. [アニメーション](#4-アニメーション)
5. [BottomSheet（モーダル）](#5-bottomsheet)
6. [キーボード対応](#6-キーボード対応)
7. [状態管理（Zustand）](#7-状態管理zustand)
8. [デザイントークン](#8-デザイントークン)
9. [Expo Router（ファイルベースルーティング）](#9-expo-router)
10. [日付処理（date-fns）](#10-日付処理)
11. [ローカル通知](#11-ローカル通知)
12. [よくあるレイアウトパターン](#12-よくあるレイアウトパターン)

---

## 1. セーフエリア

### 問題

iPhoneのノッチ・Dynamic Island・ホームバーのある端末では、コンテンツが隠れる。
これを「セーフエリア外」という。

```
┌─────────────────────┐
│  ███ Dynamic Island  │ ← ここはコンテンツを置いてはいけない
│─────────────────────│
│                     │
│   コンテンツ領域     │
│                     │
│─────────────────────│
│  ━━━  ホームバー    │ ← ここもコンテンツを置いてはいけない
└─────────────────────┘
```

### セットアップ

`app/_layout.tsx` でアプリ全体をラップする：

```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* ...アプリ全体 */}
    </SafeAreaProvider>
  );
}
```

### 使い方：useSafeAreaInsets

各画面で `insets` を取得して padding に使う：

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();

  return (
    // paddingTop: insets.top でノッチ・ステータスバー分を避ける
    <View style={{ flex: 1, paddingTop: insets.top }}>
      ...
    </View>
  );
}
```

### insets の各値

| プロパティ | 意味 | 典型的な使い道 |
|---|---|---|
| `insets.top` | ステータスバー+ノッチ高さ | 画面最上部の padding |
| `insets.bottom` | ホームバー高さ | FAB・タブバーの bottom |
| `insets.left` | 左端（iPad横向きなど） | 横スクロール時 |
| `insets.right` | 右端 | 同上 |

### FABのpositioning

FAB（フローティングアクションボタン）はタブバーの上に出す：

```tsx
const TABBAR_HEIGHT = 64; // タブバーの高さ

<Pressable
  style={{
    position: 'absolute',
    right: 20,
    // insets.bottom（ホームバー）+ タブバー高さ + 少し余白
    bottom: insets.bottom + TABBAR_HEIGHT + 8,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
  }}
>
```

### スクロールリストの最下部余白

リストの最後のアイテムがFABやタブバーに隠れないように余白を入れる：

```tsx
<SectionList
  contentContainerStyle={{
    paddingHorizontal: 16,
    // ホームバー + タブバー + FAB + 追加余白
    paddingBottom: insets.bottom + 80 + 32,
  }}
/>
```

---

## 2. スクロール

### ScrollView vs FlatList vs SectionList

| コンポーネント | 用途 | 特徴 |
|---|---|---|
| `ScrollView` | 少量の固定コンテンツ | 全部レンダリングするので大量データに不向き |
| `FlatList` | 単一リスト（大量データ） | 仮想化で画面外は非レンダリング→メモリ効率◎ |
| `SectionList` | セクション付きリスト | 「今日」「今週」など区切りがあるとき |
| `ScrollView horizontal` | 横スクロールチップ列 | タグ・フィルタ行に最適 |

### SectionList の基本パターン（タスク一覧で使用）

```tsx
type Section = { title: string; data: Todo[] };

<SectionList
  sections={sections}                    // Section[]
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TaskCard todo={item} />
  )}
  renderSectionHeader={({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  )}
  contentContainerStyle={{
    paddingHorizontal: 16,
    paddingBottom: insets.bottom + 160,
  }}
  stickySectionHeadersEnabled={false}   // セクションヘッダーを固定しない
  ListEmptyComponent={
    <Text>タスクがありません</Text>
  }
/>
```

### 横スクロールチップ（フィルター行）

```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}  // スクロールバーを非表示
  style={{ paddingHorizontal: 16, marginBottom: 8, flexGrow: 0 }}
  // flexGrow: 0 が重要 → 縦方向に伸びないようにする
>
  {options.map((opt) => (
    <Pressable key={opt.key} style={styles.chip}>
      <Text>{opt.label}</Text>
    </Pressable>
  ))}
</ScrollView>
```

`flexGrow: 0` を忘れると横ScrollViewが縦方向にも伸びてしまうので必須。

### スクロールの滑らかさ改善

```tsx
<FlatList
  // --- 滑らかさ系 ---
  removeClippedSubviews={true}     // 画面外ビューをメモリから除去
  maxToRenderPerBatch={10}         // 一度にレンダリングする最大数
  windowSize={5}                   // 表示範囲の前後に保持するウィンドウ数
  initialNumToRender={10}          // 初期表示数
  getItemLayout={(data, index) => ({  // 行高さが固定の場合これを設定すると激速
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}

  // --- パフォーマンス ---
  keyExtractor={(item) => item.id}   // 必ず安定したキーを使う
/>
```

### renderItem のメモ化

```tsx
// renderItem の関数が毎レンダリングで再生成されると遅い
// useCallback でメモ化する
const renderItem = useCallback(({ item }: { item: Todo }) => (
  <TaskCard todo={item} onPress={handleOpen} />
), [handleOpen]);

<FlatList renderItem={renderItem} />
```

### ScrollView 内で TextInput を使う場合

```tsx
<ScrollView keyboardShouldPersistTaps="handled">
  {/* keyboardShouldPersistTaps="handled" がないと
      スクロール領域をタップしたときキーボードが閉じてしまう */}
  <TextInput ... />
</ScrollView>
```

---

## 3. テーマ・ダークモード

### 設計方針

`useColorScheme()`（システム設定）＋ユーザーの手動設定を組み合わせる。

### カラートークン定義（lib/theme.ts）

```ts
export const colors = {
  light: {
    primary: '#007AFF',
    primaryBg: '#E8F0FE',
    pageBg: '#F2F2F7',      // 画面背景
    cardBg: '#FFFFFF',       // カード背景
    text: '#1C1C1E',
    secondaryText: '#8E8E93',
    border: '#E5E5EA',
    danger: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
  dark: {
    primary: '#0A84FF',
    primaryBg: '#1a2744',
    pageBg: '#09090b',
    cardBg: '#18181b',
    text: '#f4f4f5',
    secondaryText: '#71717a',
    border: '#27272a',
    danger: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
  },
};
```

### テーマフック（lib/useTheme.ts）

```ts
import { useColorScheme } from 'react-native';
import { colors } from './theme';
import { useAppStore } from '../store/useAppStore';

export function useIsDark(): boolean {
  const scheme = useColorScheme();
  const themeMode = useAppStore((s) => s.themeMode);
  // ユーザー設定が 'system' なら端末設定に従う
  return themeMode === 'dark' || (themeMode === 'system' && scheme === 'dark');
}

export function useThemeColors() {
  const isDark = useIsDark();
  return isDark ? colors.dark : colors.light;
}
```

### 使い方

```tsx
export default function MyScreen() {
  const theme = useThemeColors();

  return (
    <View style={{ backgroundColor: theme.pageBg }}>
      <Text style={{ color: theme.text }}>テキスト</Text>
      <View style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        カード
      </View>
    </View>
  );
}
```

### StatusBar の設定

```tsx
import { StatusBar } from 'expo-status-bar';

// _layout.tsx で一度だけ
<StatusBar style="auto" />
// style="auto" → ダーク/ライトに合わせて自動でテキスト色が変わる
// style="light" → 常に白テキスト（dark背景向け）
// style="dark"  → 常に黒テキスト
```

### タブバーのダークモード対応

```tsx
<Tabs
  screenOptions={{
    tabBarStyle: {
      backgroundColor: theme.cardBg + 'F0',  // F0 = 94% 不透明度
      borderTopColor: theme.border,
    },
    tabBarActiveTintColor: theme.primary,
    tabBarInactiveTintColor: theme.secondaryText,
  }}
/>
```

---

## 4. アニメーション

### react-native-reanimated の基本

React Native の標準 `Animated` より高性能。UIスレッドで実行されるのでJSスレッドが詰まっても滑らか。

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
```

### カードのプレスアニメーション（TaskCard で使用）

```tsx
export function TaskCard({ todo, onPress }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* ... */}
      </Animated.View>
    </Pressable>
  );
}
```

### BottomSheet のスライドアニメーション（BottomSheet.tsx で使用）

```tsx
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 初期位置は画面外（下）
const translateY = useSharedValue(SCREEN_HEIGHT);
const overlayOpacity = useSharedValue(0);

// iOS らしいイージング
const iosEase = Easing.bezier(0.32, 0.72, 0, 1);

useEffect(() => {
  if (visible) {
    // 表示: spring でバウンド感
    overlayOpacity.value = withTiming(1, { duration: 200 });
    translateY.value = withSpring(0, {
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    });
  } else {
    // 非表示: timing で素直に落とす
    overlayOpacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(SCREEN_HEIGHT, {
      duration: 280,
      easing: iosEase,
    });
  }
}, [visible]);
```

### withSpring vs withTiming の使い分け

| | withSpring | withTiming |
|---|---|---|
| 特徴 | 物理的なバネ感 | 一定速度（イージング指定可） |
| 用途 | 出現・バウンス | 退場・フェード・正確な時間制御 |
| パラメータ | damping（制動）, stiffness（硬さ）, mass（重さ） | duration, easing |

### フェードアニメーション

```tsx
const opacity = useSharedValue(0);

// マウント時にフェードイン
useEffect(() => {
  opacity.value = withTiming(1, { duration: 300 });
}, []);

const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

return <Animated.View style={animStyle}>{children}</Animated.View>;
```

---

## 5. BottomSheet

### 構造

```
┌─────────────────────┐
│  半透明オーバーレイ  │ ← タップで閉じる
│   ┌─────────────┐   │
│   │ ━━━ グラブバー│   │
│   │             │   │
│   │  コンテンツ  │   │
│   │             │   │
│   └─────────────┘   │
└─────────────────────┘
```

### 実装ポイント

```tsx
<Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
  {/* animationType="none" → 自前でアニメーション制御する */}

  {/* オーバーレイ（タップで閉じる） */}
  <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }, overlayStyle]}>
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
  </Animated.View>

  {/* キーボード対応ラッパー */}
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
    pointerEvents="box-none"  // オーバーレイのタップを通過させる
  >
    <Animated.View
      style={[
        styles.sheet,
        {
          paddingBottom: insets.bottom + 16,  // ホームバー分
        },
        sheetStyle,
      ]}
    >
      {/* グラブバー */}
      <View style={{ width: 36, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: theme.border }} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </Animated.View>
  </KeyboardAvoidingView>
</Modal>
```

---

## 6. キーボード対応

### 問題

TextInput をタップするとキーボードが出て、入力フィールドが隠れることがある。

### KeyboardAvoidingView

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  // iOS: padding を下に追加してコンテンツを押し上げる
  // Android: height を縮小してコンテンツを押し上げる
  style={{ flex: 1 }}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    <TextInput ... />
  </ScrollView>
</KeyboardAvoidingView>
```

### DateTimePicker の iOS vs Android

```tsx
import DateTimePicker from '@react-native-community/datetimepicker';

{showDatePicker && (
  <DateTimePicker
    value={date ?? new Date()}
    mode="datetime"
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    // iOS: spinner（インライン表示）
    // Android: ダイアログ（ポップアップ）
    onChange={(_, selectedDate) => {
      // Android はOKボタン押下で自動的に閉じるので false を返す
      // iOS はスピナーが常時表示なのでユーザーが別途閉じる
      setShowDatePicker(Platform.OS !== 'ios');
      if (selectedDate) setDate(selectedDate);
    }}
    locale="ja"
  />
)}
```

---

## 7. 状態管理（Zustand）

### セットアップ

```
npm install zustand
```

### 基本パターン（AsyncStorage で永続化）

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  deleteTodo: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      todos: [],

      addTodo: (todoData) => {
        const now = new Date().toISOString();
        set((state) => ({
          todos: [...state.todos, {
            ...todoData,
            id: generateId(),
            createdAt: now,
          }],
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        }));
      },
    }),
    {
      name: 'app-storage',          // AsyncStorage のキー名
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({     // 永続化するフィールドだけ選ぶ
        todos: state.todos,
      }),
      version: 1,                   // スキーマバージョン
      migrate: (persistedState, version) => {
        // バージョンアップ時のマイグレーション処理
        return persistedState;
      },
    }
  )
);
```

### 使い方

```tsx
// 単一値
const todos = useAppStore((s) => s.todos);

// 複数値（useShallow で不要な再レンダリングを防ぐ）
import { useShallow } from 'zustand/react/shallow';
const { todos, categories } = useAppStore(useShallow((s) => ({
  todos: s.todos,
  categories: s.categories,
})));

// アクション（参照は変わらないので shallow 不要）
const addTodo = useAppStore((s) => s.addTodo);
```

### useShallow を使うべき場面

```tsx
// NG: 毎回新しいオブジェクトを返すので常に再レンダリング
const { a, b } = useAppStore((s) => ({ a: s.a, b: s.b }));

// OK: useShallow で浅い比較
const { a, b } = useAppStore(useShallow((s) => ({ a: s.a, b: s.b })));

// OK: 単一値はそのまま（プリミティブ or 参照が変わらない場合）
const a = useAppStore((s) => s.a);
```

### ID生成

```ts
function generateId(): string {
  // タイムスタンプ(36進数) + ランダム文字列
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
// 例: "lq3k7a2bc4d"
```

---

## 8. デザイントークン

一貫したUIのため、マジックナンバーを直接書かずに定数を使う。

### spacing（余白）

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  tabBarOffset: 80,  // タブバー分の下部オフセット
};
```

### radius（角丸）

```ts
export const radius = {
  card: 16,
  button: 12,
  input: 14,
  pill: 999,  // 完全な角丸（チップ・バッジ）
};
```

### typography（テキストスタイル）

```ts
export const typography = {
  title:       { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  heading:     { fontSize: 20, fontWeight: '700' },
  body:        { fontSize: 15, fontWeight: '400' },
  bodyMedium:  { fontSize: 15, fontWeight: '600' },
  label:       { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  caption:     { fontSize: 12, fontWeight: '400' },
  tab:         { fontSize: 10, fontWeight: '600' },
};

// 使い方
const styles = StyleSheet.create({
  cardTitle: {
    ...typography.bodyMedium,
    color: theme.text,
  },
});
```

### shadow（影）

```ts
export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,   // Android用（iOSは shadowXxx で制御）
  },
  md: { ... elevation: 5 },
  lg: { ... elevation: 10 },
};

// 使い方
<View style={[styles.card, shadow.md]} />
```

### withAlpha（透明度付きカラー）

```ts
export function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0').toUpperCase();
  return `${hex}${alpha}`;
}

// 使い方
withAlpha('#FF3B30', 0.1)  // → '#FF3B301A'
withAlpha(theme.primary, 0.15)

// または直接16進数で書く（簡便）
`${category.color}1A`  // 0x1A = 10% 透明度
```

### よく使う透明度の16進数対応表

| 透明度 | Hex |
|---|---|
| 5% | 0D |
| 10% | 1A |
| 15% | 26 |
| 20% | 33 |
| 30% | 4D |
| 50% | 80 |
| 75% | BF |
| 90% | E6 |
| 94% | F0 |

---

## 9. Expo Router

### ファイル構成

```
app/
  _layout.tsx          ← ルートレイアウト（SafeAreaProvider などをここで包む）
  index.tsx            ← / ルート（ログイン画面など）
  (tabs)/
    _layout.tsx        ← タブバー定義
    tasks.tsx          ← /tasks タブ
    calendar.tsx       ← /calendar タブ
    settings.tsx       ← /settings タブ
```

`(tabs)` のように括弧で囲むとグループ化できる（URLには含まれない）。

### タブバー設定（app/(tabs)/_layout.tsx）

```tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,           // デフォルトヘッダーを非表示
        tabBarStyle: {
          backgroundColor: theme.cardBg + 'F0',
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
      }}
    >
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'タスク',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 画面遷移

```tsx
import { router } from 'expo-router';

// プッシュ
router.push('/settings');

// 置き換え（戻れない）
router.replace('/home');

// 戻る
router.back();
```

### GestureHandlerRootView

react-native-gesture-handler を使う場合（BottomSheet、ドラッグ等）、ルートに必須：

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* ... */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 10. 日付処理

### date-fns のインストール

```
npm install date-fns
```

### よく使うパターン

```ts
import {
  format, parseISO, isValid,
  startOfDay, endOfDay, endOfWeek, endOfMonth,
  isSameDay,
} from 'date-fns';
import { ja } from 'date-fns/locale';

// ISO文字列 → Dateオブジェクト（バリデーション付き）
function parseDate(str: string | null): Date | null {
  if (!str) return null;
  const d = parseISO(str);
  return isValid(d) ? d : null;
}

// フォーマット（日本語曜日付き）
format(date, 'M/d(E)', { locale: ja })          // → "3/23(月)"
format(date, 'M/d(E) HH:mm', { locale: ja })    // → "3/23(月) 14:00"
format(date, 'yyyy/M/d(E) HH:mm', { locale: ja }) // → "2026/3/23(月) 14:00"

// 今日かどうか
isSameDay(date, new Date())

// 期限超過かどうか
date < new Date()

// 今週末/今月末との比較
const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // 月曜始まり
date <= weekEnd
```

### セクション分類（期限でグループ化）

```ts
export function getSection(dueDate: string | null, isCompleted: boolean): Section {
  if (isCompleted) return 'completed';
  if (!dueDate) return 'unset';

  const date = parseISO(dueDate);
  if (!isValid(date)) return 'unset';

  const now = new Date();
  if (date < startOfDay(now)) return 'overdue';   // 期限超過
  if (date <= endOfDay(now)) return 'today';       // 今日
  if (date <= endOfWeek(now, { weekStartsOn: 1 })) return 'thisWeek';  // 今週
  if (date <= endOfMonth(now)) return 'thisMonth'; // 今月
  return 'later';                                   // それ以降
}
```

---

## 11. ローカル通知

### セットアップ

```
npx expo install expo-notifications
```

### パーミッション取得 + 通知スケジュール

```ts
import * as Notifications from 'expo-notifications';

// 通知の表示設定（フォアグラウンド中も表示する）
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// パーミッション取得
async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 通知をスケジュール
async function scheduleNotification(todo: Todo): Promise<void> {
  if (!todo.dueDate || !todo.notificationMinutesBefore) return;

  const dueDate = parseISO(todo.dueDate);
  const triggerDate = new Date(dueDate.getTime() - todo.notificationMinutesBefore * 60 * 1000);

  if (triggerDate <= new Date()) return; // 過去なら無視

  await Notifications.scheduleNotificationAsync({
    identifier: `todo-${todo.id}`,   // キャンセル時に使うID
    content: {
      title: todo.title,
      body: `${todo.notificationMinutesBefore}分後に期限です`,
    },
    trigger: { date: triggerDate },
  });
}

// 通知をキャンセル
async function cancelNotification(todoId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`todo-${todoId}`);
}
```

### app.json への追記

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#007AFF"
        }
      ]
    ]
  }
}
```

---

## 12. よくあるレイアウトパターン

### 画面の基本骨格

```tsx
export default function MyScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {
      backgroundColor: theme.pageBg,
      paddingTop: insets.top,  // ノッチ回避
    }]}>
      {/* ヘッダー */}
      <ScreenHeader title="タスク" />

      {/* コンテンツ */}
      <SectionList
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 160,  // タブバー+FAB分
        }}
        ...
      />

      {/* FAB */}
      <Pressable style={[styles.fab, {
        backgroundColor: theme.primary,
        bottom: insets.bottom + 80,  // タブバー高さ分上に
      }]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### チップ（フィルター・タグ）

```tsx
<Pressable
  style={[
    styles.chip,
    {
      backgroundColor: isActive ? theme.primary : theme.cardBg,
      borderColor: isActive ? theme.primary : theme.border,
    },
  ]}
  onPress={onPress}
>
  <Text style={{ color: isActive ? '#FFF' : theme.text }}>
    {label}
  </Text>
</Pressable>
```

### カラーつき左ストライプカード（就活ボード・タスクボードで使用）

```tsx
<View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
  {/* 左端のカラーライン */}
  <View style={[styles.strip, { backgroundColor: category?.color ?? theme.border }]} />

  <View style={styles.content}>
    <Text style={{ color: theme.text }}>{title}</Text>
  </View>
</View>

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strip: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 12,
  },
});
```

### タブインジケーター

```tsx
{TABS.map((tab, i) => (
  <Pressable key={tab} onPress={() => setActiveTab(i)} style={styles.tab}>
    <Text style={{ color: activeTab === i ? theme.primary : theme.secondaryText }}>
      {tab}
    </Text>
    {/* アクティブインジケーター */}
    {activeTab === i && (
      <View style={[styles.indicator, { backgroundColor: theme.primary }]} />
    )}
  </Pressable>
))}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '80%',
    borderRadius: 1,
  },
});
```

### Pressable のヒットエリア拡大

小さいボタン（×ボタンや削除ボタン）はタップしにくいので `hitSlop` で拡大：

```tsx
<Pressable
  hitSlop={16}              // 全方向 16px ずつ拡大
  // または
  hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
  onPress={onClose}
>
  <Ionicons name="close" size={20} color={theme.secondaryText} />
</Pressable>
```

### StyleSheet.hairlineWidth

```tsx
borderWidth: StyleSheet.hairlineWidth
// 端末のピクセル密度に合わせた最小幅（Retina では 0.5px）
// 通常の borderWidth: 1 よりも繊細な見た目になる
```

---

## トラブルシューティング

### コンテンツがタブバーに隠れる

`paddingBottom` に `insets.bottom + タブバー高さ` を追加する。

```tsx
contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
```

### キーボードが入力フィールドを隠す

`KeyboardAvoidingView` で包む + `behavior` を Platform で切り替え。

### ScrollView が縦に伸びすぎる

横 ScrollView には `flexGrow: 0` を追加。

### 再レンダリングが多い

- `useAppStore` で複数値を取るときは `useShallow` を使う
- `renderItem` は `useCallback` でメモ化する
- `useMemo` でフィルタ・ソート処理を最適化する

### Android で shadow が効かない

React Native の shadow プロパティは iOS のみ。Android は `elevation` を使う（両方書いておく）。
