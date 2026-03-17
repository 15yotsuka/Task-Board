import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, spacing } from '../../lib/theme';
import { useThemeColors } from '../../lib/useTheme';

interface Props {
  title: string;
  count: number;
  color: string;
  total?: number;
}

export function SummaryCard({ title, count, color, total }: Props) {
  const theme = useThemeColors();
  const showProgress = total !== undefined && total > 0;
  const progress = showProgress ? count / total! : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={[styles.strip, { backgroundColor: color }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.secondaryText }]}>{title}</Text>
        <Text style={[styles.count, { color }]}>
          {count}
          {total !== undefined && (
            <Text style={{ color: theme.secondaryText, fontSize: 16 }}> / {total}</Text>
          )}
        </Text>
        {showProgress && (
          <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { backgroundColor: color, width: `${Math.round(progress * 100)}%` }]} />
          </View>
        )}
      </View>
    </View>
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
    padding: 14,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    fontSize: 28,
    fontWeight: '700',
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
});
