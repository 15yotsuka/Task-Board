import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addMonths, subMonths, addWeeks, subWeeks, parseISO, isValid, isSameDay } from 'date-fns';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { MonthView } from '../../components/calendar/MonthView';
import { WeekView } from '../../components/calendar/WeekView';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { TaskCard } from '../../components/tasks/TaskCard';
import { Todo } from '../../store/types';
import { radius, spacing } from '../../lib/theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';

type ViewMode = 'month' | 'week';

export default function CalendarScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const todos = useAppStore(useShallow((s) => s.todos));
  const toggleComplete = useAppStore((s) => s.toggleComplete);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const handlePrev = () => {
    setCurrentDate((d) => (viewMode === 'month' ? subMonths(d, 1) : subWeeks(d, 1)));
  };

  const handleNext = () => {
    setCurrentDate((d) => (viewMode === 'month' ? addMonths(d, 1) : addWeeks(d, 1)));
  };

  // Todos for selected date (month view)
  const selectedDayTodos = selectedDate
    ? todos.filter((t) => {
        if (!t.dueDate || t.isCompleted) return false;
        const d = parseISO(t.dueDate);
        return isValid(d) && isSameDay(d, selectedDate);
      })
    : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.pageBg, paddingTop: insets.top }]}>
      <ScreenHeader
        title="カレンダー"
        right={
          <View style={[styles.viewToggle, { borderColor: theme.primary }]}>
            <Pressable
              onPress={() => setViewMode('month')}
              style={({ pressed }) => [
                styles.toggleBtn,
                styles.toggleLeft,
                {
                  backgroundColor: viewMode === 'month' ? theme.primary : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: viewMode === 'month' ? '#FFF' : theme.primary, fontSize: 13, fontWeight: '600' }}>
                月
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('week')}
              style={({ pressed }) => [
                styles.toggleBtn,
                styles.toggleRight,
                {
                  backgroundColor: viewMode === 'week' ? theme.primary : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: viewMode === 'week' ? '#FFF' : theme.primary, fontSize: 13, fontWeight: '600' }}>
                週
              </Text>
            </Pressable>
          </View>
        }
      />

      {/* Navigation row */}
      <View style={styles.navRow}>
        <Pressable onPress={handlePrev} style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
        </Pressable>
        <Pressable
          onPress={() => setCurrentDate(new Date())}
          style={({ pressed }) => [styles.todayBtn, { borderColor: theme.primary, opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>今日</Text>
        </Pressable>
        <Pressable onPress={handleNext} style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + 80 }}
      >
        {viewMode === 'month' ? (
          <>
            <View style={[styles.calCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <MonthView
                currentMonth={currentDate}
                onDayPress={setSelectedDate}
                selectedDate={selectedDate}
              />
            </View>
            {/* Selected day's tasks */}
            {selectedDate && (
              <View style={styles.dayTasks}>
                <Text style={[styles.dayTasksTitle, { color: theme.text }]}>
                  選択日のタスク
                </Text>
                {selectedDayTodos.length > 0 ? (
                  selectedDayTodos.map((todo) => (
                    <TaskCard
                      key={todo.id}
                      todo={todo}
                      onPress={setSelectedTodo}
                      onToggleComplete={toggleComplete}
                    />
                  ))
                ) : (
                  <Text style={[styles.dayEmpty, { color: theme.secondaryText }]}>
                    この日のタスクはありません
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={[styles.calCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <WeekView currentWeek={currentDate} onTodoPress={setSelectedTodo} />
          </View>
        )}
      </ScrollView>

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
  viewToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  toggleLeft: {
    borderRightWidth: 0.5,
    borderRightColor: 'transparent',
  },
  toggleRight: {
    borderLeftWidth: 0.5,
    borderLeftColor: 'transparent',
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
    borderRadius: 999,
    borderWidth: 1,
  },
  calCard: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dayTasks: {
    marginTop: spacing.sm,
  },
  dayTasksTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  dayEmpty: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
