import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { BottomSheet } from './BottomSheet';
import { GroupManageSheet } from '../groups/GroupManageSheet';
import { ThemeMode } from '../../store/types';
import { radius, spacing, shadow } from '../../lib/theme';

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: string }[] = [
  { key: 'light', label: 'ライト', icon: 'sunny-outline' },
  { key: 'dark', label: 'ダーク', icon: 'moon-outline' },
  { key: 'system', label: 'システム', icon: 'phone-portrait-outline' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: Props) {
  const theme = useThemeColors();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const [showGroups, setShowGroups] = useState(false);

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose}>
        <Text style={[styles.title, { color: theme.text }]}>設定</Text>

        {/* Theme */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>テーマ</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = themeMode === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setThemeMode(opt.key)}
                style={({ pressed }) => [
                  styles.themeChip,
                  {
                    backgroundColor: active ? theme.primary : theme.cardBg,
                    borderColor: active ? theme.primary : theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                  !active && shadow.sm,
                ]}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={16}
                  color={active ? '#FFF' : theme.secondaryText}
                />
                <Text style={[styles.themeChipText, { color: active ? '#FFF' : theme.text }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Groups */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>管理</Text>
        <Pressable
          onPress={() => setShowGroups(true)}
          style={({ pressed }) => [styles.menuRow, { backgroundColor: theme.cardBg, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="layers-outline" size={20} color={theme.primary} />
          <Text style={[styles.menuLabel, { color: theme.text }]}>グループ管理</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.secondaryText} />
        </Pressable>

        {/* App info */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>バージョン情報</Text>
        <View style={[styles.infoRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>TaskBoard</Text>
          <Text style={[styles.infoValue, { color: theme.secondaryText }]}>バージョン 1.0.0</Text>
        </View>
        <View style={[styles.infoRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>データ保存</Text>
          <Text style={[styles.infoValue, { color: theme.secondaryText }]}>端末内のみ</Text>
        </View>
      </BottomSheet>

      <GroupManageSheet visible={showGroups} onClose={() => setShowGroups(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  themeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 14,
  },
});
