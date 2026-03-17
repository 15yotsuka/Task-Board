import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius } from '../../lib/theme';

interface Props {
  name: string;
  color: string;
}

export function CategoryPill({ name, color }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '1A' }]}>
      <Text style={[styles.text, { color }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
