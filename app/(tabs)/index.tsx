import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { TaskCard } from '../../components/tasks/TaskCard';
import { AddTaskForm } from '../../components/tasks/AddTaskForm';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { MonthView } from '../../components/calendar/MonthView';
import { WeekView } from '../../components/calendar/WeekView';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { TutorialModal } from '../../components/common/TutorialModal';
import { AdBanner } from '../../components/common/AdBanner';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../../store/types';
import { addMonths, subMonths, addWeeks, subWeeks, isSameDay, parseISO, isValid, format } from 'date-fns';
import { useTranslation } from '../../lib/useTranslation';
import { radius, spacing, shadow } from '../../lib/theme';

type ViewMode = 'month' | 'week';

export default function HomeScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t, locale, language } = useTranslation();
  const todos = useAppStore(useShallow((s) => s.todos));
  const toggleComplete = useAppStore((s) => s.toggleComplete);
  const hasSeenTutorial = useAppStore((s) => s.hasSeenTutorial);
  const setHasSeenTutorial = useAppStore((s) => s.setHasSeenTutorial);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const calOpacity = useSharedValue(1);
  const animatedCalStyle = useAnimatedStyle(() => ({ opacity: calOpacity.value }));

  const navigate = useCallback((dir: 1 | -1) => {
    const doUpdate = () => {
      setCurrentDate((d) =>
        viewMode === 'month'
          ? (dir === 1 ? addMonths(d, 1) : subMonths(d, 1))
          : (dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1))
      );
    };
    calOpacity.value = withTiming(0, { duration: 120 }, () => {
      runOnJS(doUpdate)();
      calOpacity.value = withTiming(1, { duration: 180 });
    });
  }, [calOpacity, viewMode]);

  const goToday = useCallback(() => {
    const doUpdate = () => {
      setCurrentDate(new Date());
      setSelectedDate(new Date());
    };
    calOpacity.value = withTiming(0, { duration: 120 }, () => {
      runOnJS(doUpdate)();
      calOpacity.value = withTiming(1, { duration: 180 });
    });
  }, [calOpacity]);

  const dayTasks = useMemo(() => {
    return todos.filter((t) => {
      if (!t.dueDate || t.isCompleted) return false;
      const d = parseISO(t.dueDate);
      return isValid(d) && isSameDay(d, selectedDate);
    });
  }, [todos, selectedDate]);

  const handleOpenDetail = useCallback((todo: Todo) => setSelectedTodo(todo), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.pageBg, paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('tab.home')}
        right={
          <View style={[styles.viewToggle, { borderColor: theme.primary }]}>
            <Pressable
              onPress={() => setViewMode('month')}
              style={({ pressed }) => [
                styles.toggleBtn,
                styles.toggleLeft,
                { backgroundColor: viewMode === 'month' ? theme.primary : 'transparent', opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={{ color: viewMode === 'month' ? '#FFF' : theme.primary, fontSize: 13, fontWeight: '600' }}>{t('home.viewMonth')}</Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('week')}
              style={({ pressed }) => [
                styles.toggleBtn,
                styles.toggleRight,
                { backgroundColor: viewMode === 'week' ? theme.primary : 'transparent', opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={{ color: viewMode === 'week' ? '#FFF' : theme.primary, fontSize: 13, fontWeight: '600' }}>{t('home.viewWeek')}</Text>
            </Pressable>
          </View>
        }
      />

      {/* Navigation row */}
      <View style={styles.navRow}>
        <Pressable onPress={() => navigate(-1)} style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]} hitSlop={spacing.sm}>
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
        </Pressable>
        <Pressable onPress={goToday} style={({ pressed }) => [styles.todayBtn, { borderColor: theme.primary, opacity: pressed ? 0.6 : 1 }]}>
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>{t('common.today')}</Text>
        </Pressable>
        <Pressable onPress={() => navigate(1)} style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]} hitSlop={spacing.sm}>
          <Ionicons name="chevron-forward" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.tabBarOffset + spacing.xl },
        ]}
      >
        <Animated.View style={[styles.calCard, animatedCalStyle, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {viewMode === 'month' ? (
            <MonthView
              currentMonth={currentDate}
              onDayPress={setSelectedDate}
              selectedDate={selectedDate}
            />
          ) : (
            <WeekView currentWeek={currentDate} onTodoPress={handleOpenDetail} />
          )}
        </Animated.View>

        {/* Day tasks — only shown in month mode */}
        {viewMode === 'month' && (
          <View style={styles.daySection}>
            <Text style={[styles.daySectionTitle, { color: theme.text }]}>
              {t('home.dayTasksTitle', { date: format(selectedDate, language === 'en' ? 'MMMM d (EEE)' : 'M月d日(E)', { locale }) })}
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
                  {t('home.noTasksForDay')}
                </Text>
              </View>
            )}
          </View>
        )}
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
      <TutorialModal visible={!hasSeenTutorial} onComplete={() => setHasSeenTutorial(true)} />
      <AdBanner />
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
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  navBtn: {
    padding: spacing.sm,
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
