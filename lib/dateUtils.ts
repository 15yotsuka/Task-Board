import {
  format,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  endOfWeek,
  endOfMonth,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { ja } from 'date-fns/locale';

export type Section =
  | 'overdue'
  | 'today'
  | 'thisWeek'
  | 'thisMonth'
  | 'later'
  | 'unset'
  | 'completed';


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

export function formatDate(dateStr: string | null, locale: Locale = ja): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  const pattern = locale?.code === 'ja' ? 'M/d(E)' : 'MMM d (EEE)';
  return format(date, pattern, { locale });
}

export function formatDateTime(dateStr: string | null, locale: Locale = ja): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  const pattern = locale?.code === 'ja' ? 'M/d(E) HH:mm' : 'MMM d (EEE) HH:mm';
  return format(date, pattern, { locale });
}

export function formatFullDate(dateStr: string | null, locale: Locale = ja): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  const pattern = locale?.code === 'ja' ? 'yyyy/M/d(E) HH:mm' : 'MMM d, yyyy HH:mm';
  return format(date, pattern, { locale });
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  if (!isValid(date)) return false;
  return date < new Date();
}
