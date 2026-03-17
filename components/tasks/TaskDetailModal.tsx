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
import { parseISO, isValid } from 'date-fns';
import { useShallow } from 'zustand/react/shallow';
import { Todo, Priority } from '../../store/types';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { BottomSheet } from '../common/BottomSheet';
import { formatFullDate } from '../../lib/dateUtils';
import { priorityColors, radius, spacing } from '../../lib/theme';

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

  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notifMinutes, setNotifMinutes] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setMemo(todo.memo);
      setPriority(todo.priority);
      setCategoryId(todo.categoryId);
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
              style={[
                styles.priorityChip,
                {
                  backgroundColor: selected ? pc.bg : 'transparent',
                  borderColor: pc.text,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <Text style={{ color: pc.text, fontWeight: '600', fontSize: 13 }}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        {TABS.map((tab, i) => (
          <Pressable key={tab} onPress={() => setActiveTab(i)} style={styles.tab}>
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

            {/* Category */}
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

            {/* Memo */}
            <Text style={[styles.label, { color: theme.secondaryText }]}>メモ</Text>
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
            <Text style={[styles.label, { color: theme.secondaryText }]}>通知タイミング</Text>
            <View style={styles.notifRow}>
              <TextInput
                style={[styles.notifInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.pageBg }]}
                value={notifMinutes}
                onChangeText={setNotifMinutes}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={theme.secondaryText}
              />
              <Text style={{ color: theme.text, fontSize: 15 }}>分前に通知</Text>
            </View>
            <Text style={{ color: theme.secondaryText, fontSize: 12, marginTop: 8 }}>
              締切日時が設定されている場合のみ有効です。{'\n'}
              例: 30 = 30分前、60 = 1時間前、1440 = 1日前
            </Text>
          </>
        )}

        {activeTab === 2 && (
          <>
            <Text style={[styles.label, { color: theme.secondaryText }]}>作成日時</Text>
            <Text style={{ color: theme.text, fontSize: 15 }}>{formatFullDate(todo.createdAt)}</Text>

            <Text style={[styles.label, { color: theme.secondaryText }]}>更新日時</Text>
            <Text style={{ color: theme.text, fontSize: 15 }}>{formatFullDate(todo.updatedAt)}</Text>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.saveText}>保存</Text>
        </Pressable>
        <Pressable onPress={handleDelete}>
          <Text style={[styles.deleteText, { color: theme.danger }]}>削除</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.button,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: 14,
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
  memoInput: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifInput: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: 14,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
    gap: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButton: {
    width: '100%',
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
