export type Priority = 'high' | 'medium' | 'low';

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
  isCompleted: boolean;
  orderIndex: number;
  notificationMinutesBefore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  todos: Todo[];
  categories: Category[];
  schemaVersion: number;

  addTodo: (todo: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleComplete: (id: string) => void;
  reorderTodos: (orderedIds: string[]) => void;

  addCategory: (category: Omit<Category, 'id' | 'userId' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  loadFromSupabase: () => Promise<void>;
  syncTodoToSupabase: (todo: Todo) => Promise<void>;
  syncCategoryToSupabase: (category: Category) => Promise<void>;
  deleteTodoFromSupabase: (id: string) => Promise<void>;
  deleteCategoryFromSupabase: (id: string) => Promise<void>;
}
