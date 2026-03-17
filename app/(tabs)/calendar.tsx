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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>カレンダー</Text>
        <View style={styles.viewToggle}>
          <Pressable
            onPress={() => setViewMode('month')}
            style={[
              styles.toggleBtn,
              {
                backgroundColor: viewMode === 'month' ? theme.primary : 'transparent',
                borderColor: theme.primary,
              },
            ]}
          >
            <Text style={{ color: viewMode === 'month' ? '#FFF' : theme.primary, fontSize: 13, fontWeight: '600' }}>
              月
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('week')}
            style={[
              styles.toggleBtn,
              {
                backgroundColor: viewMode === 'week' ? theme.primary : 'transparent',
                borderColor: theme.primary,
              },
            ]}
          >
            <Text style={{ color: viewMode === 'week' ? '#FFF' : theme.primary, fontSize: 13, fontWeight: '600' }}>
              週
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Navigation arrows */}
      <View style={styles.navRow}>
        <Pressable onPress={handlePrev} style={styles.navBtn}>
          <Text style={{ color: theme.primary, fontSize: 18 }}>{'◀'}</Text>
        </Pressable>
        <Pressable onPress={() => setCurrentDate(new Date())} style={styles.navBtn}>
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '600' }}>今日</Text>
        </Pressable>
        <Pressable onPress={handleNext} style={styles.navBtn}>
          <Text style={{ color: theme.primary, fontSize: 18 }}>{'▶'}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + 80 }}
      >
        {viewMode === 'month' ? (
          <>
            <MonthView
              currentMonth={currentDate}
              onDayPress={setSelectedDate}
              selectedDate={selectedDate}
            />
            {/* Selected day's tasks */}
            {selectedDate && selectedDayTodos.length > 0 && (
              <View style={styles.dayTasks}>
                <Text style={[styles.dayTasksTitle, { color: theme.text }]}>
                  選択日のタスク
                </Text>
                {selectedDayTodos.map((todo) => (
                  <TaskCard
                    key={todo.id}
                    todo={todo}
                    onPress={setSelectedTodo}
                    onToggleComplete={toggleComplete}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <WeekView currentWeek={currentDate} onTodoPress={setSelectedTodo} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: 16,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 0,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
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
  dayTasks: {
    marginTop: 16,
  },
  dayTasksTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
});
