import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Todo, Category } from './types';
import { supabase } from '../lib/supabase';

const CURRENT_SCHEMA_VERSION = 1;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      todos: [],
      categories: [],
      schemaVersion: CURRENT_SCHEMA_VERSION,

      // === Todo Actions ===
      addTodo: (todoData) => {
        const now = new Date().toISOString();
        const newTodo: Todo = {
          ...todoData,
          id: generateId(),
          userId: '',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ todos: [...state.todos, newTodo] }));
        get().syncTodoToSupabase(newTodo);
      },

      updateTodo: (id, updates) => {
        const now = new Date().toISOString();
        let updated: Todo | undefined;
        set((state) => ({
          todos: state.todos.map((t) => {
            if (t.id === id) {
              updated = { ...t, ...updates, updatedAt: now };
              return updated;
            }
            return t;
          }),
        }));
        if (updated) get().syncTodoToSupabase(updated);
      },

      deleteTodo: (id) => {
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
        get().deleteTodoFromSupabase(id);
      },

      toggleComplete: (id) => {
        const todo = get().todos.find((t) => t.id === id);
        if (todo) {
          get().updateTodo(id, { isCompleted: !todo.isCompleted });
        }
      },

      reorderTodos: (orderedIds) => {
        set((state) => ({
          todos: state.todos.map((t) => {
            const newIndex = orderedIds.indexOf(t.id);
            if (newIndex !== -1) {
              return { ...t, orderIndex: newIndex };
            }
            return t;
          }),
        }));
      },

      // === Category Actions ===
      addCategory: (categoryData) => {
        const newCategory: Category = {
          ...categoryData,
          id: generateId(),
          userId: '',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        get().syncCategoryToSupabase(newCategory);
      },

      updateCategory: (id, updates) => {
        let updated: Category | undefined;
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id === id) {
              updated = { ...c, ...updates };
              return updated;
            }
            return c;
          }),
        }));
        if (updated) get().syncCategoryToSupabase(updated);
      },

      deleteCategory: (id) => {
        // カテゴリ削除時、関連タスクのcategoryIdをnullに
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          todos: state.todos.map((t) =>
            t.categoryId === id ? { ...t, categoryId: null } : t
          ),
        }));
        get().deleteCategoryFromSupabase(id);
      },

      // === Supabase Sync ===
      loadFromSupabase: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const [todosRes, categoriesRes] = await Promise.all([
            supabase.from('todos').select('*').eq('user_id', user.id),
            supabase.from('categories').select('*').eq('user_id', user.id),
          ]);

          if (todosRes.data) {
            const todos: Todo[] = todosRes.data.map((row: any) => ({
              id: row.id,
              userId: row.user_id,
              title: row.title,
              memo: row.memo ?? '',
              dueDate: row.due_date,
              priority: row.priority ?? 'medium',
              categoryId: row.category_id,
              isCompleted: row.is_completed ?? false,
              orderIndex: row.order_index ?? 0,
              notificationMinutesBefore: row.notification_minutes_before,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            }));
            set({ todos });
          }

          if (categoriesRes.data) {
            const categories: Category[] = categoriesRes.data.map((row: any) => ({
              id: row.id,
              userId: row.user_id,
              name: row.name,
              color: row.color ?? '#007AFF',
              createdAt: row.created_at,
            }));
            set({ categories });
          }
        } catch (e) {
          console.error('Failed to load from Supabase:', e);
        }
      },

      syncTodoToSupabase: async (todo) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          await supabase.from('todos').upsert({
            id: todo.id,
            user_id: user.id,
            title: todo.title,
            memo: todo.memo,
            due_date: todo.dueDate,
            priority: todo.priority,
            category_id: todo.categoryId,
            is_completed: todo.isCompleted,
            order_index: todo.orderIndex,
            notification_minutes_before: todo.notificationMinutesBefore,
            updated_at: todo.updatedAt,
          });
        } catch (e) {
          console.error('Failed to sync todo:', e);
        }
      },

      syncCategoryToSupabase: async (category) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          await supabase.from('categories').upsert({
            id: category.id,
            user_id: user.id,
            name: category.name,
            color: category.color,
          });
        } catch (e) {
          console.error('Failed to sync category:', e);
        }
      },

      deleteTodoFromSupabase: async (id) => {
        try {
          await supabase.from('todos').delete().eq('id', id);
        } catch (e) {
          console.error('Failed to delete todo from Supabase:', e);
        }
      },

      deleteCategoryFromSupabase: async (id) => {
        try {
          await supabase.from('categories').delete().eq('id', id);
        } catch (e) {
          console.error('Failed to delete category from Supabase:', e);
        }
      },
    }),
    {
      name: 'taskboard-data',
      storage: createJSONStorage(() => AsyncStorage),
      version: CURRENT_SCHEMA_VERSION,
      migrate: (persistedState: any, version: number) => {
        // v1: initial version
        return persistedState;
      },
      partialize: (state) => ({
        todos: state.todos,
        categories: state.categories,
        schemaVersion: state.schemaVersion,
      }),
    }
  )
);
