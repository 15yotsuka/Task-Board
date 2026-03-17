import {
  format,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  endOfWeek,
  endOfMonth,
} from 'date-fns';
import { ja } from 'date-fns/locale';

export type Section =
  | 'overdue'
  | 'today'
  | 'thisWeek'
  | 'thisMonth'
  | 'later'
  | 'unset'
  | 'completed';

export const sectionLabels: Record<Section, string> = {
  overdue: '期限超過',
  today: '今日',
  thisWeek: '今週',
  thisMonth: '今月',
  later: 'それ以降',
  unset: '未設定',
  completed: '完了済み',
};

export function getSection(dueDate: string | null, isCompleted: boolean): Section {
  if (isCompleted) return 'completed';
  if (!dueDate) return 'unset';
  const date = parseISO(dueDate);
  if (!isValid(date)) return 'unset';

  const now = new Date();
  const todayEnd = endOfDay(now);
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(now);

  if (date < startOfDay(now)) return 'overdue';
  if (date <= todayEnd) return 'today';
  if (date <= weekEnd) return 'thisWeek';
  if (date <= monthEnd) return 'thisMonth';
  return 'later';
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  return format(date, 'M/d(E)', { locale: ja });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  return format(date, 'M/d(E) HH:mm', { locale: ja });
}

export function formatFullDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  return format(date, 'yyyy/M/d(E) HH:mm', { locale: ja });
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  if (!isValid(date)) return false;
  return date < new Date();
}
