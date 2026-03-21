import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, useIsDark } from '../../lib/useTheme';
import { useAppStore } from '../../store/useAppStore';
import { spacing, typography } from '../../lib/theme';
import { SettingsSheet } from './SettingsSheet';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: Props) {
  const theme = useThemeColors();
  const isDark = useIsDark();
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const [showSettings, setShowSettings] = useState(false);

  const handleThemeToggle = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{subtitle}</Text>
          )}
        </View>
        <View style={styles.rightRow}>
          {right}
          <Pressable onPress={handleThemeToggle} style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]} hitSlop={spacing.sm}>
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={theme.secondaryText}
            />
          </Pressable>
          <Pressable onPress={() => setShowSettings(true)} style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]} hitSlop={spacing.sm}>
            <Ionicons name="settings-outline" size={22} color={theme.secondaryText} />
          </Pressable>
        </View>
      </View>
      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.xs + 2,
  },
});
