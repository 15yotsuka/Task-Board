import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Todo, Category } from '../../store/types';
import { useThemeColors } from '../../lib/useTheme';
import { formatDateTime, isOverdue } from '../../lib/dateUtils';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryPill } from '../common/CategoryPill';
import { radius, spacing } from '../../lib/theme';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  todo: Todo;
  onPress: (todo: Todo) => void;
  onToggleComplete?: (id: string) => void;
}

export function TaskCard({ todo, onPress, onToggleComplete }: Props) {
  const theme = useThemeColors();
  const scale = useSharedValue(1);

  const categories = useAppStore((s) => s.categories);
  const category = categories.find((c) => c.id === todo.categoryId);
  const stripColor = category?.color ?? theme.border;
  const overdue = !todo.isCompleted && isOverdue(todo.dueDate);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Pressable
      onPress={() => onPress(todo)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            opacity: todo.isCompleted ? 0.5 : 1,
          },
        ]}
      >
        {/* Color strip */}
        <View style={[styles.strip, { backgroundColor: stripColor }]} />

        <View style={styles.content}>
          {/* Row 1: Title */}
          <View style={styles.titleRow}>
            {/* Checkbox */}
            <Pressable
              onPress={() => onToggleComplete?.(todo.id)}
              hitSlop={8}
              style={[
                styles.checkbox,
                {
                  borderColor: todo.isCompleted ? theme.success : theme.border,
                  backgroundColor: todo.isCompleted ? theme.success : 'transparent',
                },
              ]}
            >
              {todo.isCompleted && <Text style={styles.checkmark}>{'✓'}</Text>}
            </Pressable>
            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                  textDecorationLine: todo.isCompleted ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={1}
            >
              {todo.title}
            </Text>
          </View>

          {/* Row 2: Due date */}
          {todo.dueDate && (
            <Text
              style={[
                styles.dueDate,
                { color: overdue ? theme.danger : theme.secondaryText },
              ]}
            >
              {overdue ? '期限超過 ' : ''}
              {formatDateTime(todo.dueDate)}
            </Text>
          )}

          {/* Row 3: Badges */}
          <View style={styles.badgeRow}>
            <PriorityBadge priority={todo.priority} />
            {category && <CategoryPill name={category.name} color={category.color} />}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  strip: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  dueDate: {
    fontSize: 13,
    marginLeft: 30,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 30,
    marginTop: 2,
  },
});
