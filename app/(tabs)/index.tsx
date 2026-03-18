import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { getSection } from '../../lib/dateUtils';
import { SummaryCard } from '../../components/home/SummaryCard';
import { CategoryProgress } from '../../components/home/CategoryProgress';
import { spacing, typography } from '../../lib/theme';

export default function HomeScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const todos = useAppStore(useShallow((s) => s.todos));

  const stats = useMemo(() => {
    const incomplete = todos.filter((t) => !t.isCompleted);
    const todayCount = incomplete.filter((t) => getSection(t.dueDate, false) === 'today').length;
    const weekCount = incomplete.filter((t) => getSection(t.dueDate, false) === 'thisWeek').length;
    const overdueCount = incomplete.filter((t) => getSection(t.dueDate, false) === 'overdue').length;
    const completedCount = todos.filter((t) => t.isCompleted).length;

    return { todayCount, weekCount, overdueCount, completedCount, total: todos.length };
  }, [todos]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.pageBg }]}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.tabBarOffset,
      }}
    >
      <Text style={[styles.pageTitle, { color: theme.text }]}>ホーム</Text>

      <View style={styles.cards}>
        <SummaryCard title="今日締切" count={stats.todayCount} color={theme.danger} />
        <SummaryCard title="今週締切" count={stats.weekCount} color={theme.warning} />
        <SummaryCard title="期限超過" count={stats.overdueCount} color={theme.danger} />
        <SummaryCard
          title="完了進捗"
          count={stats.completedCount}
          color={theme.success}
          total={stats.total}
        />
      </View>

      <CategoryProgress />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  pageTitle: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  cards: {
    marginBottom: spacing.md,
  },
});
