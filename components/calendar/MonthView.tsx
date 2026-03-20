import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
  parseISO,
  isValid,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { Todo } from '../../store/types';
import { radius, spacing } from '../../lib/theme';

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];

interface Props {
  currentMonth: Date;
  onDayPress: (date: Date) => void;
  selectedDate: Date | null;
}

export function MonthView({ currentMonth, onDayPress, selectedDate }: Props) {
  const theme = useThemeColors();
  const todos = useAppStore(useShallow((s) => s.todos));
  const categories = useAppStore(useShallow((s) => s.categories));
  const groups = useAppStore(useShallow((s) => s.groups));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const getTodosForDay = (date: Date): Todo[] => {
    return todos.filter((t) => {
      if (!t.dueDate || t.isCompleted) return false;
      const d = parseISO(t.dueDate);
      return isValid(d) && isSameDay(d, date);
    });
  };

  const today = new Date();

  return (
    <View>
      {/* Month header */}
      <Text style={[styles.monthTitle, { color: theme.text }]}>
        {format(currentMonth, 'yyyy年M月', { locale: ja })}
      </Text>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd, i) => (
          <Text
            key={wd}
            style={[
              styles.weekdayText,
              { color: i >= 5 ? theme.primary : theme.secondaryText },
            ]}
          >
            {wd}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((d) => {
            const isCurrentMonth = isSameMonth(d, currentMonth);
            const isToday = isSameDay(d, today);
            const isSelected = selectedDate && isSameDay(d, selectedDate);
            const dayTodos = getTodosForDay(d);

            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => onDayPress(d)}
                style={({ pressed }) => [
                  styles.dayCell,
                  isSelected && !isToday && { backgroundColor: theme.primaryBg, borderRadius: radius.button },
                  isSelected && isToday && { borderWidth: 2, borderColor: theme.primary, borderRadius: radius.button },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.dayInner,
                    isToday && { backgroundColor: theme.primary, borderRadius: radius.pill },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isCurrentMonth ? theme.text : theme.secondaryText,
                        opacity: isCurrentMonth ? 1 : 0.3,
                      },
                      isToday && { color: '#FFFFFF', fontWeight: '700', opacity: 1 },
                    ]}
                  >
                    {format(d, 'd')}
                  </Text>
                </View>
                {/* Dots */}
                <View style={styles.dotRow}>
                  {dayTodos.slice(0, 3).map((t) => {
                    const grp = groups.find((g) => g.id === t.groupId);
                    const cat = categories.find((c) => c.id === t.categoryId);
                    const dotColor = grp?.color ?? cat?.color ?? theme.primary;
                    return (
                      <View
                        key={t.id}
                        style={[styles.dot, { backgroundColor: dotColor }]}
                      />
                    );
                  })}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md - 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 44,
  },
  dayInner: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
