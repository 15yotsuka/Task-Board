import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SectionList,
} from 'react-native';
import type { SectionListData } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { getSection, sectionLabels, Section } from '../../lib/dateUtils';
import { TaskCard } from '../../components/tasks/TaskCard';
import { AddTaskForm } from '../../components/tasks/AddTaskForm';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { GroupManageSheet } from '../../components/groups/GroupManageSheet';
import { Todo } from '../../store/types';
import { radius, spacing, typography, shadow, withAlpha } from '../../lib/theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';

type SortMode = 'dueDate' | 'manual' | 'priority' | 'combined';
type FilterMode = 'incomplete' | 'completed' | 'all';
type TaskSection = SectionListData<Todo, { title: string; section: Section }>;

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'dueDate', label: '期限順' },
  { key: 'manual', label: '手動' },
  { key: 'priority', label: '優先度' },
  { key: 'combined', label: '複合' },
];

const FILTER_OPTIONS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'incomplete', label: '未完了' },
  { key: 'completed', label: '完了済み' },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const SECTION_ORDER: Section[] = ['overdue', 'today', 'thisWeek', 'thisMonth', 'later', 'unset', 'completed'];

export default function TasksScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const todos = useAppStore(useShallow((s) => s.todos));
  const categories = useAppStore(useShallow((s) => s.categories));
  const groups = useAppStore(useShallow((s) => s.groups));
  const toggleComplete = useAppStore((s) => s.toggleComplete);

  const [sortMode, setSortMode] = useState<SortMode>('dueDate');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGroupManage, setShowGroupManage] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const filteredAndSorted = useMemo(() => {
    let filtered = [...todos];

    if (filterMode === 'incomplete') {
      filtered = filtered.filter((t) => !t.isCompleted);
    } else if (filterMode === 'completed') {
      filtered = filtered.filter((t) => t.isCompleted);
    }

    if (filterGroupId) {
      filtered = filtered.filter((t) => t.groupId === filterGroupId);
    }

    if (filterCategoryId) {
      filtered = filtered.filter((t) => t.categoryId === filterCategoryId);
    }

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
  }, [todos, sortMode, filterMode, filterCategoryId, filterGroupId]);

  const sections = useMemo(() => {
    const grouped: Record<Section, Todo[]> = {
      overdue: [], today: [], thisWeek: [], thisMonth: [], later: [], unset: [], completed: [],
    };

    filteredAndSorted.forEach((t) => {
      const section = getSection(t.dueDate, t.isCompleted);
      grouped[section].push(t);
    });

    return SECTION_ORDER
      .filter((key) => grouped[key].length > 0)
      .map((key) => ({
        title: sectionLabels[key],
        data: grouped[key],
        section: key,
      }));
  }, [filteredAndSorted]);

  const handleOpenDetail = useCallback((todo: Todo) => {
    setSelectedTodo(todo);
  }, []);

  const renderItem = useCallback(({ item }: { item: Todo }) => (
    <TaskCard todo={item} onPress={handleOpenDetail} onToggleComplete={toggleComplete} />
  ), [handleOpenDetail, toggleComplete]);

  return (
    <View style={[styles.container, { backgroundColor: theme.pageBg, paddingTop: insets.top }]}>
      <ScreenHeader
        title="タスク"
        subtitle="並べ替え・検索・全タスク管理"
        right={
          <Pressable
            onPress={() => setShowGroupManage(true)}
            style={({ pressed }) => [
              styles.groupBtn,
              { borderColor: theme.border, backgroundColor: theme.cardBg, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="layers-outline" size={14} color={theme.primary} />
            <Text style={[styles.groupBtnText, { color: theme.primary }]}>グループ管理</Text>
          </Pressable>
        }
      />

      {/* Sort chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setSortMode(opt.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: sortMode === opt.key ? theme.primary : theme.cardBg,
                borderColor: sortMode === opt.key ? theme.primary : theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: sortMode === opt.key ? '#FFF' : theme.text }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
        {FILTER_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setFilterMode(opt.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: filterMode === opt.key ? theme.primaryBg : theme.cardBg,
                borderColor: filterMode === opt.key ? theme.primary : theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: filterMode === opt.key ? theme.primary : theme.text }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
        {groups.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => setFilterGroupId(filterGroupId === g.id ? null : g.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: filterGroupId === g.id ? withAlpha(g.color, 0.12) : theme.cardBg,
                borderColor: filterGroupId === g.id ? g.color : theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={[styles.catDot, { backgroundColor: g.color }]} />
            <Text style={[styles.chipText, { color: theme.text }]}>{g.name}</Text>
          </Pressable>
        ))}
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setFilterCategoryId(filterCategoryId === cat.id ? null : cat.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: filterCategoryId === cat.id ? withAlpha(cat.color, 0.1) : theme.cardBg,
                borderColor: filterCategoryId === cat.id ? cat.color : theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={[styles.catDot, { backgroundColor: cat.color }]} />
            <Text style={[styles.chipText, { color: theme.text }]}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Task list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        removeClippedSubviews={true}
        renderSectionHeader={({ section }: { section: TaskSection }) => (
          <Text style={[styles.sectionHeader, { color: section.section === 'overdue' ? theme.danger : theme.secondaryText }]}>
            {section.title}
          </Text>
        )}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + spacing.tabBarOffset + spacing.xl,
        }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="checkmark-circle-outline" size={48} color={theme.border} />
            <Text style={[styles.empty, { color: theme.secondaryText }]}>タスクがありません</Text>
            <Text style={[styles.emptyHint, { color: theme.secondaryText }]}>＋ボタンでタスクを追加しましょう</Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => setShowAddForm(true)}
        style={[
          styles.fab,
          { backgroundColor: theme.primary, bottom: insets.bottom + spacing.tabBarOffset },
          shadow.lg,
        ]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <AddTaskForm visible={showAddForm} onClose={() => setShowAddForm(false)} />
      <TaskDetailModal
        todo={selectedTodo}
        visible={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
      />
      <GroupManageSheet visible={showGroupManage} onClose={() => setShowGroupManage(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipScroll: {
    marginBottom: spacing.sm,
    flexGrow: 0,
  },
  chipContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  catDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
  },
  sectionHeader: {
    ...typography.label,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
    gap: spacing.md,
  },
  empty: {
    textAlign: 'center',
    ...typography.body,
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.md + 4,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  groupBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
