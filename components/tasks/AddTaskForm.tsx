import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '../../lib/useTranslation';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../lib/useTheme';
import { BottomSheet } from '../common/BottomSheet';
import { GroupManageSheet } from '../groups/GroupManageSheet';
import { Priority } from '../../store/types';
import { priorityColors, radius, spacing, withAlpha } from '../../lib/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}


export function AddTaskForm({ visible, onClose }: Props) {
  const theme = useThemeColors();
  const { t, locale, language } = useTranslation();
  const addTodo = useAppStore((s) => s.addTodo);

  const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
    { key: 'high', label: t('priority.high') },
    { key: 'medium', label: t('priority.medium') },
    { key: 'low', label: t('priority.low') },
  ];
  const categories = useAppStore(useShallow((s) => s.categories));
  const groups = useAppStore(useShallow((s) => s.groups));

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
  const [showGroupCreate, setShowGroupCreate] = useState(false);

  const reset = () => {
    setTitle('');
    setMemo('');
    setPriority('medium');
    setCategoryId(null);
    setGroupId(null);
    setDueDate(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setPendingDate(new Date());
    setPendingTime(new Date());
  };

  // オープン時に前回の入力をリセット（クローズアニメーション中のブランクフラッシュを防ぐ）
  useEffect(() => {
    if (visible) reset();
  }, [visible]);

  const handleSave = () => {
    if (!title.trim()) return;
    addTodo({
      title: title.trim(),
      memo: memo.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      categoryId,
      groupId,
      isCompleted: false,
      orderIndex: 0,
      notificationMinutesBefore: null,
    });
    reset();
    onClose();
  };

  return (
    <>
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[styles.heading, { color: theme.text }]}>{t('addTask.heading')}</Text>

      {/* Title */}
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.pageBg }]}
        placeholder={t('addTask.titlePlaceholder')}
        placeholderTextColor={theme.secondaryText}
        value={title}
        onChangeText={setTitle}
      />

      {/* Memo */}
      <TextInput
        style={[styles.input, styles.memoInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.pageBg }]}
        placeholder={t('addTask.memoPlaceholder')}
        placeholderTextColor={theme.secondaryText}
        value={memo}
        onChangeText={setMemo}
        multiline
      />

      {/* Priority */}
      <Text style={[styles.label, { color: theme.secondaryText }]}>{t('common.priority')}</Text>
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
              <Text style={[styles.priorityText, { color: pc.text }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Group */}
      <>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>{t('common.group')}</Text>
          <Pressable onPress={() => setShowGroupCreate(true)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Text style={[styles.labelAction, { color: theme.primary }]}>{t('addTask.newGroup')}</Text>
          </Pressable>
        </View>
        {groups.length > 0 && (
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
              <Text style={{ color: theme.text, fontSize: 13 }}>{t('common.none')}</Text>
            </Pressable>
            {groups.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => setGroupId(g.id)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  {
                    backgroundColor: groupId === g.id ? withAlpha(g.color, 0.15) : 'transparent',
                    borderColor: groupId === g.id ? g.color : theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={[styles.catDot, { backgroundColor: g.color }]} />
                <Text style={{ color: theme.text, fontSize: 13 }}>{g.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </>

      {/* Category */}
      {categories.length > 0 && (
        <>
          <Text style={[styles.label, { color: theme.secondaryText }]}>{t('common.category')}</Text>
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
              <Text style={{ color: theme.text, fontSize: 13 }}>{t('common.none')}</Text>
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
                <Text style={{ color: theme.text, fontSize: 13 }}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Due Date */}
      <Text style={[styles.label, { color: theme.secondaryText }]}>{t('common.dueDate')}</Text>
      <Pressable
        onPress={() => {
          const base = dueDate ?? new Date();
          setPendingDate(base);
          setPendingTime(base);
          setShowDatePicker(true);
        }}
        style={({ pressed }) => [styles.dateButton, { borderColor: theme.border, backgroundColor: theme.pageBg, opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={{ color: dueDate ? theme.text : theme.secondaryText, fontSize: 15 }}>
          {dueDate ? format(dueDate, language === 'en' ? 'MMM d (EEE) HH:mm' : 'M月d日(E) HH:mm', { locale }) : t('common.selectDateTime')}
        </Text>
      </Pressable>
      {dueDate && !showDatePicker && (
        <Pressable onPress={() => setDueDate(null)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ color: theme.danger, fontSize: 13, marginTop: spacing.xs }}>{t('common.clearDateTime')}</Text>
        </Pressable>
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <View style={[styles.pickerContainer, { backgroundColor: theme.pageBg, borderColor: theme.border }]}>
          <View style={[styles.pickerToolbar, { borderBottomColor: theme.border }]}>
            <Pressable
              onPress={() => setShowDatePicker(false)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[styles.pickerToolbarBtn, { color: theme.secondaryText }]}>{t('common.cancel')}</Text>
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
              <Text style={[styles.pickerToolbarBtn, { color: theme.primary, fontWeight: '600' }]}>{t('common.confirm')}</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={pendingDate}
            mode="date"
            display="inline"
            onChange={(_, date) => { if (date) setPendingDate(date); }}
            locale={language === 'en' ? 'en' : 'ja'}
          />
          <View style={[styles.timeSeparator, { borderTopColor: theme.border }]} />
          <DateTimePicker
            value={pendingTime}
            mode="time"
            display="spinner"
            onChange={(_, time) => { if (time) setPendingTime(time); }}
            locale={language === 'en' ? 'en' : 'ja'}
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
            if (date) {
              setPendingDate(date);
              setShowTimePicker(true);
            }
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

      {/* Save */}
      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [styles.saveButton, { backgroundColor: theme.primary, opacity: !title.trim() ? 0.5 : pressed ? 0.75 : 1 }]}
        disabled={!title.trim()}
      >
        <Text style={styles.saveText}>{t('common.add')}</Text>
      </Pressable>
    </BottomSheet>
    <GroupManageSheet visible={showGroupCreate} onClose={() => setShowGroupCreate(false)} />
  </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: spacing.md - 2,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  memoInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  catDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  labelAction: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: spacing.md - 2,
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
  pickerToolbarBtn: {
    fontSize: 15,
  },
  timeSeparator: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {
    marginTop: spacing.lg,
    borderRadius: radius.button,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
