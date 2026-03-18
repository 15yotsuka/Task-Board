import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Todo, Category } from './types';

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
      },

      updateTodo: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          todos: state.todos.map((t) => {
            if (t.id === id) {
              return { ...t, ...updates, updatedAt: now };
            }
            return t;
          }),
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
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
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id === id) {
              return { ...c, ...updates };
            }
            return c;
          }),
        }));
      },

      deleteCategory: (id) => {
        // カテゴリ削除時、関連タスクのcategoryIdをnullに
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          todos: state.todos.map((t) =>
            t.categoryId === id ? { ...t, categoryId: null } : t
          ),
        }));
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
