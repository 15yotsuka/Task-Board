import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  startOfWeek,
  addDays,
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
import { radius, spacing, withAlpha } from '../../lib/theme';

interface Props {
  currentWeek: Date;
  onTodoPress: (todo: Todo) => void;
}

export function WeekView({ currentWeek, onTodoPress }: Props) {
  const theme = useThemeColors();
  const todos = useAppStore(useShallow((s) => s.todos));
  const categories = useAppStore(useShallow((s) => s.categories));
  const groups = useAppStore(useShallow((s) => s.groups));

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const getTodosForDay = (date: Date): Todo[] => {
    return todos.filter((t) => {
      if (!t.dueDate || t.isCompleted) return false;
      const d = parseISO(t.dueDate);
      return isValid(d) && isSameDay(d, date);
    });
  };

  return (
    <View>
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        const dayTodos = getTodosForDay(day);

        return (
          <View key={day.toISOString()} style={styles.dayRow}>
            <View style={[styles.dayHeader, isToday && { backgroundColor: theme.primaryBg }]}>
              <Text
                style={[
                  styles.dayLabel,
                  { color: isToday ? theme.primary : theme.text },
                ]}
              >
                {format(day, 'M/d(E)', { locale: ja })}
              </Text>
            </View>
            {dayTodos.length === 0 ? (
              <Text style={[styles.empty, { color: theme.secondaryText }]}>予定なし</Text>
            ) : (
              dayTodos.map((todo) => {
                const grp = groups.find((g) => g.id === todo.groupId);
                const cat = categories.find((c) => c.id === todo.categoryId);
                const accentColor = grp?.color ?? cat?.color ?? theme.primary;
                return (
                  <Pressable
                    key={todo.id}
                    onPress={() => onTodoPress(todo)}
                    style={({ pressed }) => [
                      styles.todoBlock,
                      {
                        backgroundColor: withAlpha(accentColor, 0.1),
                        borderLeftColor: accentColor,
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                  >
                    <Text style={[styles.todoTitle, { color: theme.text }]} numberOfLines={1}>
                      {todo.title}
                    </Text>
                    {todo.dueDate && (
                      <Text style={[styles.todoTime, { color: theme.secondaryText }]}>
                        {format(parseISO(todo.dueDate), 'HH:mm')}
                      </Text>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dayRow: {
    marginBottom: spacing.sm,
  },
  dayHeader: {
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.button,
    marginBottom: spacing.xs,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    fontSize: 13,
    paddingLeft: spacing.md - 4,
    paddingVertical: spacing.xs,
  },
  todoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  todoTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  todoTime: {
    fontSize: 12,
    marginLeft: spacing.sm,
  },
});
