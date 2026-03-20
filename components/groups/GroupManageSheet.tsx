import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { BottomSheet } from '../common/BottomSheet';
import { Group } from '../../store/types';
import { radius, spacing, withAlpha } from '../../lib/theme';

const PRESET_COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE',
  '#FF2D55', '#5AC8FA', '#FFCC00', '#FF6B35', '#00C7BE',
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function GroupManageSheet({ visible, onClose }: Props) {
  const theme = useThemeColors();
  const groups = useAppStore(useShallow((s) => s.groups));
  const addGroup = useAppStore((s) => s.addGroup);
  const updateGroup = useAppStore((s) => s.updateGroup);
  const deleteGroup = useAppStore((s) => s.deleteGroup);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addGroup({ name: newName.trim(), color: newColor });
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (!editingGroup || !editingGroup.name.trim()) return;
    updateGroup(editingGroup.id, { name: editingGroup.name, color: editingGroup.color });
    setEditingGroup(null);
  };

  const handleDelete = (group: Group) => {
    Alert.alert(
      'グループを削除',
      `「${group.name}」を削除しますか？\n関連タスクのグループ設定が解除されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => deleteGroup(group.id),
        },
      ]
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>グループ管理</Text>
        <Pressable
          onPress={() => { setIsAdding(true); setEditingGroup(null); }}
          style={({ pressed }) => [styles.addBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="add" size={20} color="#FFF" />
        </Pressable>
      </View>

      {/* Add new group */}
      {isAdding && (
        <View style={[styles.editBox, { backgroundColor: theme.pageBg, borderColor: theme.border }]}>
          <TextInput
            style={[styles.nameInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBg }]}
            placeholder="グループ名 (例: 就活、学校、課題)"
            placeholderTextColor={theme.secondaryText}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          <View style={styles.colorRow}>
            {PRESET_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setNewColor(c)}
                style={({ pressed }) => [
                  styles.colorDot,
                  { backgroundColor: c, opacity: pressed ? 0.7 : 1 },
                  newColor === c && styles.colorDotSelected,
                ]}
              />
            ))}
          </View>
          <View style={styles.editActions}>
            <Pressable onPress={() => setIsAdding(false)} style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[styles.cancelText, { color: theme.secondaryText }]}>キャンセル</Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.primary, opacity: !newName.trim() ? 0.5 : pressed ? 0.75 : 1 }]}
              disabled={!newName.trim()}
            >
              <Text style={styles.saveBtnText}>追加</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Group list */}
      {groups.length === 0 && !isAdding ? (
        <Text style={[styles.empty, { color: theme.secondaryText }]}>
          グループがありません。+ ボタンで追加してください。
        </Text>
      ) : (
        <View>
          {groups.map((group) => (
            <View key={group.id}>
              {editingGroup?.id === group.id ? (
                <View style={[styles.editBox, { backgroundColor: theme.pageBg, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.nameInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBg }]}
                    value={editingGroup.name}
                    onChangeText={(t) => setEditingGroup({ ...editingGroup, name: t })}
                    autoFocus
                  />
                  <View style={styles.colorRow}>
                    {PRESET_COLORS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setEditingGroup({ ...editingGroup, color: c })}
                        style={({ pressed }) => [
                          styles.colorDot,
                          { backgroundColor: c, opacity: pressed ? 0.7 : 1 },
                          editingGroup.color === c && styles.colorDotSelected,
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.editActions}>
                    <Pressable onPress={() => setEditingGroup(null)} style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.6 : 1 }]}>
                      <Text style={[styles.cancelText, { color: theme.secondaryText }]}>キャンセル</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSaveEdit}
                      style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 }]}
                    >
                      <Text style={styles.saveBtnText}>保存</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={[styles.groupRow, { borderBottomColor: theme.border }]}>
                  <View style={[styles.groupStrip, { backgroundColor: group.color }]} />
                  <View style={[styles.groupPill, { backgroundColor: withAlpha(group.color, 0.12) }]}>
                    <Text style={[styles.groupName, { color: group.color }]}>{group.name}</Text>
                  </View>
                  <Pressable
                    onPress={() => { setEditingGroup(group); setIsAdding(false); }}
                    hitSlop={spacing.sm}
                    style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Ionicons name="pencil-outline" size={18} color={theme.secondaryText} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(group)}
                    hitSlop={spacing.sm}
                    style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  groupStrip: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  groupPill: {
    flex: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600',
  },
  iconBtn: {
    padding: spacing.xs,
  },
  editBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: spacing.sm + 4,
    fontSize: 16,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.button,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: 14,
    lineHeight: 22,
  },
});
