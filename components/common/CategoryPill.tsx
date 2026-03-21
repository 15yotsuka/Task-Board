import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, spacing, withAlpha } from '../../lib/theme';

interface Props {
  name: string;
  color: string;
}

export function CategoryPill({ name, color }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: withAlpha(color, 0.1) }]}>
      <Text style={[styles.text, { color }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
