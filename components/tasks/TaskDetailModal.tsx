import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { parseISO, isValid, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useShallow } from 'zustand/react/shallow';
import { Todo, Priority } from '../../store/types';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { BottomSheet } from '../common/BottomSheet';
import { formatFullDate } from '../../lib/dateUtils';
import { priorityColors, radius, spacing, typography, withAlpha } from '../../lib/theme';

interface Props {
  todo: Todo | null;
  visible: boolean;
  onClose: () => void;
}

const TABS = ['基本情報', '通知', '詳細'] as const;
const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
  { key: 'high', label: '高' },
  { key: 'medium', label: '中' },
  { key: 'low', label: '低' },
];

export function TaskDetailModal({ todo, visible, onClose }: Props) {
  const theme = useThemeColors();
  const updateTodo = useAppStore((s) => s.updateTodo);
  const deleteTodo = useAppStore((s) => s.deleteTodo);
  const categories = useAppStore(useShallow((s) => s.categories));
  const groups = useAppStore(useShallow((s) => s.groups));

  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date>(new Date());
  const [pendingTime, setPendingTime] = useState<Date>(new Date());
  const [notifMinutes, setNotifMinutes] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setMemo(todo.memo);
      setPriority(todo.priority);
      setCategoryId(todo.categoryId);
      setGroupId(todo.groupId);
      setNotifMinutes(todo.notificationMinutesBefore?.toString() ?? '');
      if (todo.dueDate) {
        const d = parseISO(todo.dueDate);
        setDueDate(isValid(d) ? d : null);
      } else {
        setDueDate(null);
      }
      setActiveTab(0);
    }
  }, [todo]);

  if (!todo) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    const parsed = notifMinutes ? parseInt(notifMinutes, 10) : null;
    updateTodo(todo.id, {
      title: title.trim(),
      memo: memo.trim(),
      priority,
      categoryId,
      groupId,
      dueDate: dueDate ? dueDate.toISOString() : null,
      notificationMinutesBefore: parsed && !isNaN(parsed) ? parsed : null,
    });
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('タスクを削除', `「${todo.title}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          deleteTodo(todo.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <TextInput
        style={[styles.titleInput, { color: theme.text, borderColor: theme.border }]}
        value={title}
        onChangeText={setTitle}
        placeholder="タスク名"
        placeholderTextColor={theme.secondaryText}
      />

      {/* Priority selector */}
      <View style={styles.priorityRow}>
        {PRIORITY_OPTIONS.map((opt) => {
          const selected = priority === opt.key;
          const pc = priorityColors[opt.key];
          return (
            <Pressable
              key={opt.key}
              onPress={() => setPriority(opt.key)}
              style={({ pressed }) => [
                styles.priorityChip,
                {
                  backgroundColor: selected ? pc.bg : 'transparent',
                  borderColor: pc.text,
                  borderWidth: selected ? 2 : 1,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.priorityChipText, { color: pc.text }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        {TABS.map((tab, i) => (
          <Pressable key={tab} onPress={() => setActiveTab(i)} style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.7 : 1 }]}>
            <Text
              style={[
                styles.tabText,
                { color: activeTab === i ? theme.primary : theme.secondaryText },
              ]}
            >
              {tab}
            </Text>
            {activeTab === i && (
              <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === 0 && (
          <>
            {/* Due date */}
            <Text style={[styles.fieldLabel, { color: theme.secondaryText }]}>締切日時</Text>
            <Pressable
              onPress={() => {
                const base = dueDate ?? new Date();
                setPendingDate(base);
                setPendingTime(base);
                setShowDatePicker(true);
              }}
              style={({ pressed }) => [styles.dateButton, { borderColor: theme.border, backgroundColor: theme.pageBg, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.dateText, { color: dueDate ? theme.text : theme.secondaryText }]}>
                {dueDate ? format(dueDate, 'M月d日(E) HH:mm', { locale: ja }) : '日時を選択'}
              </Text>
            </Pressable>
            {dueDate && !showDatePicker && (
              <Pressable onPress={() => setDueDate(null)} hitSlop={spacing.sm} style={({ pressed }) => [styles.clearButton, { opacity: pressed ? 0.6 : 1 }]}>
                <Text style={[styles.clearText, { color: theme.danger }]}>日時をクリア</Text>
              </Pressable>
            )}
            {showDatePicker && Platform.OS === 'ios' && (
              <View style={[styles.pickerContainer, { backgroundColor: theme.pageBg, borderColor: theme.border }]}>
                <View style={[styles.pickerToolbar, { borderBottomColor: theme.border }]}>
                  <Pressable
                    onPress={() => setShowDatePicker(false)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text style={[styles.pickerBtn, { color: theme.secondaryText }]}>キャンセル</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const combined = new Date(pendingDate);
                      combined.setHours(pendingTime.getHours(), pendingTime.getMinutes(), 0, 0);
                      setDueDate(combined);
                      setShowDatePicker(false);
                    }}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text style={[styles.pickerBtn, { color: theme.primary, fontWeight: '600' }]}>確認</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={pendingDate}
                  mode="date"
                  display="inline"
                  onChange={(_, date) => { if (date) setPendingDate(date); }}
                  locale="ja"
                />
                <View style={[styles.timeSeparator, { borderTopColor: theme.border }]} />
                <DateTimePicker
                  value={pendingTime}
                  mode="time"
                  display="spinner"
                  onChange={(_, time) => { if (time) setPendingTime(time); }}
                  locale="ja"
                />
              </View>
            )}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={pendingDate}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) { setPendingDate(date); setShowTimePicker(true); }
                }}
              />
            )}
            {showTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={pendingTime}
                mode="time"
                display="default"
                onChange={(_, time) => {
                  setShowTimePicker(false);
                  if (time) {
                    const combined = new Date(pendingDate);
                    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
                    setDueDate(combined);
                  }
                }}
              />
            )}

            {/* Group */}
            {groups.length > 0 && (
              <>
                <Text style={[styles.fieldLabel, { color: theme.secondaryText }]}>グループ</Text>
                <View style={styles.categoryRow}>
                  <Pressable
                    onPress={() => setGroupId(null)}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      {
                        backgroundColor: groupId === null ? theme.primaryBg : 'transparent',
                        borderColor: theme.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.categoryChipText, { color: theme.text }]}>なし</Text>
                  </Pressable>
                  {groups.map((g) => (
                    <Pressable
                      key={g.id}
                      onPress={() => setGroupId(g.id)}
                      style={({ pressed }) => [
                        styles.categoryChip,
                        {
                          backgroundColor: groupId === g.id ? withAlpha(g.color, 0.12) : 'transparent',
                          borderColor: groupId === g.id ? g.color : theme.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.catDot, { backgroundColor: g.color }]} />
                      <Text style={[styles.categoryChipText, { color: theme.text }]}>{g.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Category */}
            <Text style={[styles.fieldLabel, { color: theme.secondaryText }]}>カテゴリ</Text>
            <View style={styles.categoryRow}>
              <Pressable
                onPress={() => setCategoryId(null)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  {
                    backgroundColor: categoryId === null ? theme.primaryBg : 'transparent',
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.categoryChipText, { color: theme.text }]}>なし</Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    {
                      backgroundColor: categoryId === cat.id ? withAlpha(cat.color, 0.1) : 'transparent',
                      borderColor: categoryId === cat.id ? cat.color : theme.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.categoryChipText, { color: theme.text }]}>{cat.name}</Text>
                </Pressable>
              ))}
            </View>

            {/* Memo */}
            <Text style={[styles.fieldLabel, { color: theme.secondaryText }]}>メモ</Text>
            <TextInput
              style={[styles.memoInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.pageBg }]}
              value={memo}
              onChangeText={setMemo}
              placeholder="メモ"
              placeholderTextColor={theme.secondaryText}
              multiline
            />
          </>
        )}

        {activeTab === 1 && (
          <>
            <Text style={[styles.fieldLabel, { color: theme.secondaryText }]}>通知タイミング</Text>
            <View style={styles.notifRow}>
              <TextInput
                style={[styles.notifInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.pageBg }]}
                value={notifMinutes}
                onChangeText={setNotifMinutes}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={theme.secondaryText}
              />
              <Text style={[styles.notifUnit, { color: theme.text }]}>分前に通知</Text>
            </View>
            <Text style={[styles.notifHint, { color: theme.secondaryText }]}>
              締切日時が設定されている場合のみ有効です。{'\n'}
              例: 30 = 30分前、60 = 1時間前、1440 = 1日前
            </Text>
          </>
        )}

        {activeTab === 2 && (
          <>
            <Text style={[styles.fieldLabel, { color: theme.secondaryText }]}>作成日時</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{formatFullDate(todo.createdAt)}</Text>

            <Text style={[styles.fieldLabel, { color: theme.secondaryText }]}>更新日時</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{formatFullDate(todo.updatedAt)}</Text>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveButton, { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 }]}
        >
          <Text style={styles.saveText}>保存</Text>
        </Pressable>
        <Pressable onPress={handleDelete} hitSlop={spacing.md} style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={[styles.deleteText, { color: theme.danger }]}>削除</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  titleInput: {
    ...typography.heading,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md - 4,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  priorityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.button,
  },
  priorityChipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  tabText: {
    ...typography.bodyMedium,
    fontSize: 14,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '80%',
    borderRadius: 1,
  },
  tabContent: {
    minHeight: 200,
  },
  fieldLabel: {
    ...typography.label,
    fontSize: 12,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: spacing.md - 2,
  },
  dateText: {
    ...typography.body,
  },
  clearButton: {
    marginTop: spacing.xs,
  },
  clearText: {
    ...typography.caption,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: radius.card,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  pickerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerBtn: {
    fontSize: 15,
  },
  timeSeparator: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  categoryChipText: {
    ...typography.caption,
  },
  catDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
  },
  memoInput: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: spacing.md - 2,
    ...typography.body,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notifInput: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: spacing.md - 2,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  notifUnit: {
    ...typography.body,
  },
  notifHint: {
    ...typography.caption,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  detailText: {
    ...typography.body,
  },
  footer: {
    marginTop: spacing.lg,
    gap: spacing.md - 4,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButton: {
    width: '100%',
    borderRadius: radius.button,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  deleteText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
});
