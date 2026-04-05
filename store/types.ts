export type Priority = "high" | "medium" | "low";
export type ThemeMode = "system" | "light" | "dark";
export type Language = "ja" | "en";

export interface Group {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  memo: string;
  dueDate: string | null;
  isDateOnly: boolean;
  priority: Priority;
  categoryId: string | null;
  groupId: string | null;
  isCompleted: boolean;
  orderIndex: number;
  notificationMinutesBefore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  todos: Todo[];
  categories: Category[];
  groups: Group[];
  schemaVersion: number;
  themeMode: ThemeMode;
  language: Language;

  hasSeenTutorial: boolean;
  adsRemoved: boolean;
  notificationsEnabled: boolean;
  defaultNotificationMinutes: number;

  addTodo: (
    todo: Omit<Todo, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => string;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  deleteTodos: (ids: string[]) => void;
  toggleComplete: (id: string) => void;
  reorderTodos: (orderedIds: string[]) => void;
  setHasSeenTutorial: (seen: boolean) => void;
  setAdsRemoved: (removed: boolean) => void;

  addCategory: (
    category: Omit<Category, "id" | "userId" | "createdAt">,
  ) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addGroup: (group: Omit<Group, "id" | "createdAt">) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDefaultNotificationMinutes: (n: number) => void;
}
