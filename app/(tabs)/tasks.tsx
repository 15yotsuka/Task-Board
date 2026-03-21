import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SectionList,
  Alert,
} from 'react-native';
import type { SectionListData } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { useTranslation } from '../../lib/useTranslation';
import { getSection, Section } from '../../lib/dateUtils';
import type { TranslationKey } from '../../lib/i18n/index';
import { startOfDay, parseISO, isValid } from 'date-fns';
import { TaskCard } from '../../components/tasks/TaskCard';
import { AddTaskForm } from '../../components/tasks/AddTaskForm';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { GroupManageSheet } from '../../components/groups/GroupManageSheet';
import { Todo } from '../../store/types';
import { radius, spacing, typography, shadow, withAlpha } from '../../lib/theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { AdBanner } from '../../components/common/AdBanner';

type SortMode = 'dueDate' | 'manual' | 'priority';
type FilterMode = 'incomplete' | 'completed' | 'all';
type TaskSection = SectionListData<Todo, { title: string; section: Section }>;

const SECTION_KEY_MAP: Record<Section, TranslationKey> = {
  overdue: 'section.overdue',
  today: 'section.today',
  thisWeek: 'section.thisWeek',
  thisMonth: 'section.thisMonth',
  later: 'section.later',
  unset: 'section.unset',
  completed: 'section.completed',
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const SECTION_ORDER: Section[] = ['overdue', 'today', 'thisWeek', 'thisMonth', 'later', 'unset', 'completed'];

export default function TasksScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const SORT_OPTIONS = useMemo(() => [
    { key: 'dueDate' as SortMode, label: t('sort.dueDate') },
    { key: 'manual' as SortMode, label: t('sort.manual') },
    { key: 'priority' as SortMode, label: t('sort.priority') },
  ], [t]);

  const FILTER_OPTIONS = useMemo(() => [
    { key: 'all' as FilterMode, label: t('filter.all') },
    { key: 'incomplete' as FilterMode, label: t('filter.incomplete') },
    { key: 'completed' as FilterMode, label: t('filter.completed') },
  ], [t]);
  const todos = useAppStore(useShallow((s) => s.todos));
  const categories = useAppStore(useShallow((s) => s.categories));
  const groups = useAppStore(useShallow((s) => s.groups));
  const toggleComplete = useAppStore((s) => s.toggleComplete);
  const deleteTodos = useAppStore((s) => s.deleteTodos);

  const [sortMode, setSortMode] = useState<SortMode>('dueDate');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGroupManage, setShowGroupManage] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
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
        title: t(SECTION_KEY_MAP[key]),
        data: grouped[key],
        section: key,
      }));
  }, [filteredAndSorted, t]);

  const handleOpenDetail = useCallback((todo: Todo) => {
    setSelectedTodo(todo);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const handleLongPress = useCallback((id: string) => {
    setIsSelectionMode(true);
    setSelectedIds([id]);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    Alert.alert(t('tasks.deleteAlert.title'), t('tasks.deleteAlert.message', { count: selectedIds.length }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          deleteTodos(selectedIds);
          exitSelectionMode();
        },
      },
    ]);
  }, [selectedIds, deleteTodos, exitSelectionMode, t]);

  const handleBulkDelete = useCallback(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const overdueIds = todos
      .filter((t) => {
        if (t.isCompleted || !t.dueDate) return false;
        const d = parseISO(t.dueDate);
        return isValid(d) && d < todayStart;
      })
      .map((t) => t.id);
    const completedIds = todos.filter((t) => t.isCompleted).map((t) => t.id);
    const allIds = todos.map((t) => t.id);

    Alert.alert(t('tasks.bulkDelete.title'), t('tasks.bulkDelete.message'), [
      {
        text: t('tasks.bulkDelete.overdue', { count: overdueIds.length }),
        style: overdueIds.length === 0 ? 'default' : 'destructive',
        onPress: overdueIds.length === 0 ? undefined : () => {
          Alert.alert(t('common.confirm'), t('tasks.bulkDelete.confirmOverdue', { count: overdueIds.length }), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.delete'), style: 'destructive', onPress: () => deleteTodos(overdueIds) },
          ]);
        },
      },
      {
        text: t('tasks.bulkDelete.completed', { count: completedIds.length }),
        style: completedIds.length === 0 ? 'default' : 'destructive',
        onPress: completedIds.length === 0 ? undefined : () => {
          Alert.alert(t('common.confirm'), t('tasks.bulkDelete.confirmCompleted', { count: completedIds.length }), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.delete'), style: 'destructive', onPress: () => deleteTodos(completedIds) },
          ]);
        },
      },
      {
        text: t('tasks.bulkDelete.all', { count: allIds.length }),
        style: allIds.length === 0 ? 'default' : 'destructive',
        onPress: allIds.length === 0 ? undefined : () => {
          Alert.alert(t('common.confirm'), t('tasks.bulkDelete.confirmAll', { count: allIds.length }), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.delete'), style: 'destructive', onPress: () => deleteTodos(allIds) },
          ]);
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }, [todos, deleteTodos, t]);

  const renderItem = useCallback(({ item }: { item: Todo }) => (
    <TaskCard
      todo={item}
      onPress={handleOpenDetail}
      onToggleComplete={toggleComplete}
      isSelectionMode={isSelectionMode}
      isSelected={selectedIds.includes(item.id)}
      onLongPress={() => handleLongPress(item.id)}
      onSelect={() => handleSelect(item.id)}
    />
  ), [handleOpenDetail, toggleComplete, isSelectionMode, selectedIds, handleLongPress, handleSelect]);

  return (
    <View style={[styles.container, { backgroundColor: theme.pageBg, paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('tab.tasks')}
        right={
          <View style={styles.headerRight}>
            <Pressable
              onPress={handleBulkDelete}
              hitSlop={spacing.sm}
              style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
            >
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </Pressable>
            <Pressable
              onPress={() => setShowGroupManage(true)}
              style={({ pressed }) => [
                styles.groupBtn,
                { borderColor: theme.border, backgroundColor: theme.cardBg, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="layers-outline" size={14} color={theme.primary} />
              <Text style={[styles.groupBtnText, { color: theme.primary }]}>{t('tasks.manageGroups')}</Text>
            </Pressable>
          </View>
        }
      />

      {/* Selection mode bar */}
      {isSelectionMode && (
        <View style={[styles.selectionBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Pressable onPress={exitSelectionMode} hitSlop={spacing.sm} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.selectionBarAction, { color: theme.primary }]}>{t('common.cancel')}</Text>
          </Pressable>
          <Text style={[styles.selectionBarCount, { color: theme.text }]}>
            {selectedIds.length > 0 ? t('tasks.selectedCount', { count: selectedIds.length }) : t('tasks.tapToSelect')}
          </Text>
          <Pressable
            onPress={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            hitSlop={spacing.sm}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.selectionBarAction, { color: selectedIds.length > 0 ? theme.danger : theme.secondaryText }]}>
              {t('common.delete')}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Sort + Filter chips — single row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipScroll, isSelectionMode && { display: 'none' }]} contentContainerStyle={styles.chipContent}>
        {/* Sort */}
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

        {/* Divider */}
        <View style={[styles.chipDivider, { backgroundColor: theme.border }]} />

        {/* Filter */}
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
            <Text style={[styles.empty, { color: theme.secondaryText }]}>{t('tasks.empty')}</Text>
            <Text style={[styles.emptyHint, { color: theme.secondaryText }]}>{t('tasks.emptyHint')}</Text>
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
      <AdBanner />
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
  chipDivider: {
    width: 1,
    height: 20,
    alignSelf: 'center',
    marginHorizontal: spacing.xs,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectionBarCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionBarAction: {
    fontSize: 15,
    fontWeight: '600',
  },
});
