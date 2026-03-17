import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { BottomSheet } from '../common/BottomSheet';
import { Priority } from '../../store/types';
import { priorityColors, radius, spacing } from '../../lib/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
  { key: 'high', label: '高' },
  { key: 'medium', label: '中' },
  { key: 'low', label: '低' },
];

export function AddTaskForm({ visible, onClose }: Props) {
  const theme = useThemeColors();
  const addTodo = useAppStore((s) => s.addTodo);
  const categories = useAppStore(useShallow((s) => s.categories));

  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const reset = () => {
    setTitle('');
    setMemo('');
    setPriority('medium');
    setCategoryId(null);
    setDueDate(null);
    setShowDatePicker(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    addTodo({
      title: title.trim(),
      memo: memo.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      categoryId,
      isCompleted: false,
      orderIndex: 0,
      notificationMinutesBefore: null,
    });
    reset();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[styles.heading, { color: theme.text }]}>タスク追加</Text>

      {/* Title */}
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.pageBg }]}
        placeholder="タスク名"
        placeholderTextColor={theme.secondaryText}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      {/* Memo */}
      <TextInput
        style={[styles.input, styles.memoInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.pageBg }]}
        placeholder="メモ（任意）"
        placeholderTextColor={theme.secondaryText}
        value={memo}
        onChangeText={setMemo}
        multiline
      />

      {/* Priority */}
      <Text style={[styles.label, { color: theme.secondaryText }]}>優先度</Text>
      <View style={styles.priorityRow}>
        {PRIORITY_OPTIONS.map((opt) => {
          const selected = priority === opt.key;
          const pc = priorityColors[opt.key];
          return (
            <Pressable
              key={opt.key}
              onPress={() => setPriority(opt.key)}
              style={[
                styles.priorityChip,
                {
                  backgroundColor: selected ? pc.bg : 'transparent',
                  borderColor: pc.text,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.priorityText, { color: pc.text }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Category */}
      {categories.length > 0 && (
        <>
          <Text style={[styles.label, { color: theme.secondaryText }]}>カテゴリ</Text>
          <View style={styles.categoryRow}>
            <Pressable
              onPress={() => setCategoryId(null)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: categoryId === null ? theme.primaryBg : 'transparent',
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ color: theme.text, fontSize: 13 }}>なし</Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: categoryId === cat.id ? cat.color + '1A' : 'transparent',
                    borderColor: categoryId === cat.id ? cat.color : theme.border,
                  },
                ]}
              >
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={{ color: theme.text, fontSize: 13 }}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Due Date */}
      <Text style={[styles.label, { color: theme.secondaryText }]}>締切日時</Text>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.pageBg }]}
      >
        <Text style={{ color: dueDate ? theme.text : theme.secondaryText, fontSize: 15 }}>
          {dueDate ? dueDate.toLocaleString('ja-JP') : '日時を選択'}
        </Text>
      </Pressable>
      {dueDate && (
        <Pressable onPress={() => setDueDate(null)}>
          <Text style={{ color: theme.danger, fontSize: 13, marginTop: 4 }}>日時をクリア</Text>
        </Pressable>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={dueDate ?? new Date()}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShowDatePicker(Platform.OS !== 'ios');
            if (selectedDate) setDueDate(selectedDate);
          }}
          locale="ja"
        />
      )}

      {/* Save */}
      <Pressable
        onPress={handleSave}
        style={[styles.saveButton, { backgroundColor: theme.primary, opacity: title.trim() ? 1 : 0.5 }]}
        disabled={!title.trim()}
      >
        <Text style={styles.saveText}>追加</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  memoInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.button,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: 14,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
