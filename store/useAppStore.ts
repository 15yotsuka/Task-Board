import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Todo, Category, Group, ThemeMode, Language } from './types';

const CURRENT_SCHEMA_VERSION = 2;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}


export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      todos: [],
      categories: [],
      groups: [],
      schemaVersion: CURRENT_SCHEMA_VERSION,
      themeMode: 'system' as ThemeMode,
      language: 'ja' as Language,
      hasSeenTutorial: false,
      adsRemoved: false,

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

      deleteTodos: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({ todos: state.todos.filter((t) => !idSet.has(t.id)) }));
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

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      setLanguage: (lang) => {
        set({ language: lang });
      },

      setHasSeenTutorial: (seen) => {
        set({ hasSeenTutorial: seen });
      },

      setAdsRemoved: (removed) => {
        set({ adsRemoved: removed });
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          todos: state.todos.map((t) =>
            t.categoryId === id ? { ...t, categoryId: null } : t
          ),
        }));
      },

      // === Group Actions ===
      addGroup: (groupData) => {
        const newGroup: Group = {
          ...groupData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ groups: [...state.groups, newGroup] }));
      },

      updateGroup: (id, updates) => {
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      deleteGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
          todos: state.todos.map((t) =>
            t.groupId === id ? { ...t, groupId: null } : t
          ),
        }));
      },
    }),
    {
      name: 'taskboard-data',
      storage: createJSONStorage(() => AsyncStorage),
      version: CURRENT_SCHEMA_VERSION,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // v2: add groups, add groupId to todos
          return {
            ...persistedState,
            groups: persistedState.groups ?? [],
            todos: (persistedState.todos ?? []).map((t: any) => ({
              ...t,
              groupId: t.groupId ?? null,
            })),
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        todos: state.todos,
        categories: state.categories,
        groups: state.groups,
        schemaVersion: state.schemaVersion,
        themeMode: state.themeMode,
        language: state.language,
        hasSeenTutorial: state.hasSeenTutorial,
        adsRemoved: state.adsRemoved,
      }),
    }
  )
);
