import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { Todo } from '../../store/types';
import { useThemeColors } from '../../lib/useTheme';
import { formatDate, isOverdue } from '../../lib/dateUtils';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryPill } from '../common/CategoryPill';
import { radius, spacing, shadow, withAlpha } from '../../lib/theme';
import { useAppStore } from '../../store/useAppStore';

const CHECKBOX_SIZE = 22;

interface Props {
  todo: Todo;
  onPress: (todo: Todo) => void;
  onToggleComplete?: (id: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onLongPress?: () => void;
  onSelect?: () => void;
}

export function TaskCard({ todo, onPress, onToggleComplete, isSelectionMode, isSelected, onLongPress, onSelect }: Props) {
  const theme = useThemeColors();
  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);
  const checkScale = useSharedValue(todo.isCompleted ? 1 : 0);
  const categories = useAppStore(useShallow((s) => s.categories));
  const groups = useAppStore(useShallow((s) => s.groups));
  const category = categories.find((c) => c.id === todo.categoryId);
  const group = groups.find((g) => g.id === todo.groupId);
  const stripColor = group?.color ?? category?.color ?? theme.border;
  const overdue = !todo.isCompleted && isOverdue(todo.dueDate);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pressOpacity.value,
  }));

  // Sync checkmark scale when todo.isCompleted changes from external source (e.g. bulk operations)
  useEffect(() => {
    checkScale.value = todo.isCompleted ? 1 : 0;
  }, [todo.isCompleted]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 120 });
    pressOpacity.value = withTiming(0.75, { duration: 120 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 26, stiffness: 200 });
    pressOpacity.value = withTiming(1, { duration: 150 });
  };

  const handleToggle = () => {
    const next = !todo.isCompleted;
    checkScale.value = next
      ? withSpring(1, { damping: 12, stiffness: 400 })
      : withTiming(0, { duration: 150, easing: Easing.out(Easing.quad) });
    onToggleComplete?.(todo.id);
  };

  return (
    <Pressable
      onPress={isSelectionMode ? onSelect : () => onPress(todo)}
      onPressIn={isSelectionMode ? undefined : handlePressIn}
      onPressOut={isSelectionMode ? undefined : handlePressOut}
      onLongPress={isSelectionMode ? undefined : onLongPress}
      delayLongPress={400}
      style={{ opacity: todo.isCompleted ? 0.5 : 1 }}
    >
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          shadow.sm,
          {
            backgroundColor: isSelected ? withAlpha(theme.primary, 0.08) : theme.cardBg,
            borderColor: isSelected ? theme.primary : theme.border,
            borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        {/* Left color strip */}
        <View style={[styles.strip, { backgroundColor: stripColor }]} />

        <View style={styles.content}>
          {/* Row 1: Checkbox + Title + Date */}
          <View style={styles.topRow}>
            <Pressable
              onPress={isSelectionMode ? undefined : handleToggle}
              disabled={isSelectionMode}
              hitSlop={spacing.md}
              style={[
                styles.checkbox,
                {
                  borderColor: todo.isCompleted ? theme.success : theme.border,
                  backgroundColor: todo.isCompleted ? theme.success : 'transparent',
                },
              ]}
            >
              <Animated.Text style={[styles.checkmark, checkmarkStyle]}>✓</Animated.Text>
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

            {todo.dueDate && (
              <Text
                style={[
                  styles.dueDate,
                  { color: overdue ? theme.danger : theme.secondaryText },
                ]}
              >
                {formatDate(todo.dueDate)}
              </Text>
            )}
            {isSelectionMode && (
              <View
                style={[
                  styles.selCircle,
                  {
                    borderColor: isSelected ? theme.primary : theme.border,
                    backgroundColor: isSelected ? theme.primary : 'transparent',
                  },
                ]}
              >
                {isSelected && <Text style={styles.selCheck}>✓</Text>}
              </View>
            )}
          </View>

          {/* Row 2: Memo preview */}
          {todo.memo ? (
            <Text
              style={[styles.memo, { color: theme.secondaryText, marginLeft: CHECKBOX_SIZE + spacing.sm }]}
              numberOfLines={1}
            >
              {todo.memo}
            </Text>
          ) : null}

          {/* Row 3: Badges */}
          <View style={[styles.badgeRow, { marginLeft: CHECKBOX_SIZE + spacing.sm }]}>
            {group && (
              <View style={[styles.groupPill, { backgroundColor: withAlpha(group.color, 0.12) }]}>
                <Text style={[styles.groupPillText, { color: group.color }]}>{group.name}</Text>
              </View>
            )}
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
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  strip: {
    width: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: CHECKBOX_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 0,
  },
  memo: {
    fontSize: 12,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  groupPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  groupPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  selCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: spacing.xs,
  },
  selCheck: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
