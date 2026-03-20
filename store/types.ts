export type Priority = 'high' | 'medium' | 'low';
export type ThemeMode = 'system' | 'light' | 'dark';

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

  addTodo: (todo: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleComplete: (id: string) => void;
  reorderTodos: (orderedIds: string[]) => void;

  addCategory: (category: Omit<Category, 'id' | 'userId' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  setThemeMode: (mode: ThemeMode) => void;
}
