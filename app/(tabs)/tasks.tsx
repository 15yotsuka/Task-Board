import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { getSection, sectionLabels, Section } from '../../lib/dateUtils';
import { TaskCard } from '../../components/tasks/TaskCard';
import { AddTaskForm } from '../../components/tasks/AddTaskForm';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { Todo } from '../../store/types';
import { radius, spacing } from '../../lib/theme';
import { parseISO, isValid } from 'date-fns';

type SortMode = 'dueDate' | 'manual' | 'priority' | 'combined';
type FilterMode = 'incomplete' | 'completed' | 'all';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'dueDate', label: '期限順' },
  { key: 'manual', label: '手動' },
  { key: 'priority', label: '優先度' },
  { key: 'combined', label: '複合' },
];

const FILTER_OPTIONS: { key: FilterMode; label: string }[] = [
  { key: 'incomplete', label: '未完了' },
  { key: 'completed', label: '完了済み' },
  { key: 'all', label: 'すべて' },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const SECTION_ORDER: Section[] = ['overdue', 'today', 'thisWeek', 'thisMonth', 'later', 'unset', 'completed'];

export default function TasksScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const todos = useAppStore(useShallow((s) => s.todos));
  const categories = useAppStore(useShallow((s) => s.categories));
  const toggleComplete = useAppStore((s) => s.toggleComplete);

  const [sortMode, setSortMode] = useState<SortMode>('dueDate');
  const [filterMode, setFilterMode] = useState<FilterMode>('incomplete');
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const filteredAndSorted = useMemo(() => {
    let filtered = [...todos];

    // Filter by completion status
    if (filterMode === 'incomplete') {
      filtered = filtered.filter((t) => !t.isCompleted);
    } else if (filterMode === 'completed') {
      filtered = filtered.filter((t) => t.isCompleted);
    }

    // Filter by category
    if (filterCategoryId) {
      filtered = filtered.filter((t) => t.categoryId === filterCategoryId);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortMode === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortMode === 'manual') {
        return a.orderIndex - b.orderIndex;
      }
      if (sortMode === 'priority') {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      // combined
      const pa = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (pa !== 0) return pa;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const da = a.dueDate.localeCompare(b.dueDate);
      if (da !== 0) return da;
      return a.orderIndex - b.orderIndex;
    });

    return filtered;
  }, [todos, sortMode, filterMode, filterCategoryId]);

  // Group into sections
  const sections = useMemo(() => {
    const groups: Record<Section, Todo[]> = {
      overdue: [], today: [], thisWeek: [], thisMonth: [], later: [], unset: [], completed: [],
    };

    filteredAndSorted.forEach((t) => {
      const section = getSection(t.dueDate, t.isCompleted);
      groups[section].push(t);
    });

    return SECTION_ORDER
      .filter((key) => groups[key].length > 0)
      .map((key) => ({
        title: sectionLabels[key],
        data: groups[key],
        section: key,
      }));
  }, [filteredAndSorted]);

  const handleOpenDetail = useCallback((todo: Todo) => {
    setSelectedTodo(todo);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.pageBg, paddingTop: insets.top }]}>
      <Text style={[styles.pageTitle, { color: theme.text }]}>タスク</Text>

      {/* Sort chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setSortMode(opt.key)}
            style={[
              styles.chip,
              {
                backgroundColor: sortMode === opt.key ? theme.primary : theme.cardBg,
                borderColor: sortMode === opt.key ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={{ color: sortMode === opt.key ? '#FFF' : theme.text, fontSize: 13, fontWeight: '600' }}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {FILTER_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setFilterMode(opt.key)}
            style={[
              styles.chip,
              {
                backgroundColor: filterMode === opt.key ? theme.primaryBg : theme.cardBg,
                borderColor: filterMode === opt.key ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={{ color: filterMode === opt.key ? theme.primary : theme.text, fontSize: 13 }}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setFilterCategoryId(filterCategoryId === cat.id ? null : cat.id)}
            style={[
              styles.chip,
              {
                backgroundColor: filterCategoryId === cat.id ? cat.color + '1A' : theme.cardBg,
                borderColor: filterCategoryId === cat.id ? cat.color : theme.border,
              },
            ]}
          >
            <View style={[styles.catDot, { backgroundColor: cat.color }]} />
            <Text style={{ color: theme.text, fontSize: 13 }}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Task list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard todo={item} onPress={handleOpenDetail} onToggleComplete={toggleComplete} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: theme.secondaryText }]}>{title}</Text>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + 100 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.secondaryText }]}>タスクがありません</Text>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => setShowAddForm(true)}
        style={[styles.fab, { backgroundColor: theme.primary, bottom: insets.bottom + 80 }]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <AddTaskForm visible={showAddForm} onClose={() => setShowAddForm(false)} />
      <TaskDetailModal
        todo={selectedTodo}
        visible={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
    marginBottom: 8,
    marginTop: 16,
  },
  chipScroll: {
    paddingHorizontal: spacing.md,
    marginBottom: 8,
    flexGrow: 0,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
