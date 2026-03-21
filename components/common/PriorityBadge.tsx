import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../../store/types';
import { priorityColors, radius, spacing } from '../../lib/theme';
import { useTranslation } from '../../lib/useTranslation';

interface Props {
  priority: Priority;
}

export function PriorityBadge({ priority }: Props) {
  const { t } = useTranslation();
  const color = priorityColors[priority];
  const label = t(`priority.${priority}` as 'priority.high' | 'priority.medium' | 'priority.low');
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
