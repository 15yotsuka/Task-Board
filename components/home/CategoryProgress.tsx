import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { radius, spacing } from '../../lib/theme';

export function CategoryProgress() {
  const theme = useThemeColors();
  const categories = useAppStore(useShallow((s) => s.categories));
  const todos = useAppStore(useShallow((s) => s.todos));

  if (categories.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.heading, { color: theme.text }]}>カテゴリ別進捗</Text>
      {categories.map((cat) => {
        const catTodos = todos.filter((t) => t.categoryId === cat.id);
        const completed = catTodos.filter((t) => t.isCompleted).length;
        const total = catTodos.length;
        const progress = total > 0 ? completed / total : 0;

        return (
          <View key={cat.id} style={styles.row}>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={[styles.name, { color: theme.text }]}>{cat.name}</Text>
              <Text style={[styles.fraction, { color: theme.secondaryText }]}>
                {completed}/{total}
              </Text>
            </View>
            <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: cat.color, width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 16,
    marginBottom: spacing.sm,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fraction: {
    fontSize: 12,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
});
