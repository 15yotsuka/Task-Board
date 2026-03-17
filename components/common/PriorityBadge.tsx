import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../../store/types';
import { priorityColors, radius } from '../../lib/theme';

const labels: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

interface Props {
  priority: Priority;
}

export function PriorityBadge({ priority }: Props) {
  const color = priorityColors[priority];
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{labels[priority]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
