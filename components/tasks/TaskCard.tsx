import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Todo } from '../../store/types';
import { useThemeColors } from '../../lib/useTheme';
import { formatDateTime, isOverdue } from '../../lib/dateUtils';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryPill } from '../common/CategoryPill';
import { radius, spacing, typography } from '../../lib/theme';
import { useAppStore } from '../../store/useAppStore';

// チェックボックスのサイズ定数
const CHECKBOX_SIZE = 22;

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

  // チェックボックスの左端からバッジ行までのオフセット
  const badgeOffset = CHECKBOX_SIZE + spacing.sm;

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
            <Pressable
              onPress={() => onToggleComplete?.(todo.id)}
              hitSlop={spacing.md}
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
                { color: overdue ? theme.danger : theme.secondaryText, marginLeft: badgeOffset },
              ]}
            >
              {overdue ? '期限超過 ' : ''}
              {formatDateTime(todo.dueDate)}
            </Text>
          )}

          {/* Row 3: Badges */}
          <View style={[styles.badgeRow, { marginLeft: badgeOffset }]}>
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
    padding: spacing.md - 4,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: CHECKBOX_SIZE / 2,
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
    ...typography.bodyMedium,
    flex: 1,
  },
  dueDate: {
    ...typography.caption,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: 2,
  },
});
