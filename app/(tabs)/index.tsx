import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { TaskCard } from '../../components/tasks/TaskCard';
import { AddTaskForm } from '../../components/tasks/AddTaskForm';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { GroupManageSheet } from '../../components/groups/GroupManageSheet';
import { MonthView } from '../../components/calendar/MonthView';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../../store/types';
import { addMonths, subMonths, isSameDay, parseISO, isValid, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { radius, spacing, shadow } from '../../lib/theme';

export default function HomeScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const todos = useAppStore(useShallow((s) => s.todos));
  const toggleComplete = useAppStore((s) => s.toggleComplete);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGroupManage, setShowGroupManage] = useState(false);

  const dayTasks = useMemo(() => {
    return todos.filter((t) => {
      if (!t.dueDate) return false;
      const d = parseISO(t.dueDate);
      return isValid(d) && isSameDay(d, selectedDate);
    });
  }, [todos, selectedDate]);

  const handleOpenDetail = useCallback((todo: Todo) => setSelectedTodo(todo), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.pageBg, paddingTop: insets.top }]}>
      <ScreenHeader title="ホーム" subtitle="カレンダー＆デイリービュー" />

      {/* Month navigation */}
      <View style={styles.navRow}>
        <Pressable
          onPress={() => setCurrentMonth((m) => subMonths(m, 1))}
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
        </Pressable>
        <Pressable
          onPress={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}
          style={({ pressed }) => [styles.todayBtn, { borderColor: theme.primary, opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>今日</Text>
        </Pressable>
        <Pressable
          onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.tabBarOffset + spacing.xl },
        ]}
      >
        {/* Calendar */}
        <View style={[styles.calCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <MonthView
            currentMonth={currentMonth}
            onDayPress={setSelectedDate}
            selectedDate={selectedDate}
          />
        </View>

        {/* Day tasks */}
        <View style={styles.daySection}>
          <Text style={[styles.daySectionTitle, { color: theme.text }]}>
            {format(selectedDate, 'M月d日(E)', { locale: ja })} のタスク
          </Text>
          {dayTasks.length > 0 ? (
            dayTasks.map((todo) => (
              <TaskCard
                key={todo.id}
                todo={todo}
                onPress={handleOpenDetail}
                onToggleComplete={toggleComplete}
              />
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="checkmark-circle-outline" size={36} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                この日のタスクはありません
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => setShowAddForm(true)}
        style={[
          styles.fab,
          { backgroundColor: theme.primary, bottom: insets.bottom + spacing.tabBarOffset },
          shadow.lg,
        ]}
      >
        <Ionicons name="add" size={28} color="#FFF" />
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
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 8,
  },
  navBtn: {
    padding: 8,
  },
  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  calCard: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  daySection: {
    marginTop: spacing.xs,
  },
  daySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
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
});
