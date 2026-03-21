import { ja as jaLocale, enUS } from 'date-fns/locale';
import { useAppStore } from '../store/useAppStore';
import { ja } from './i18n/ja';
import { en } from './i18n/en';
import type { TranslationKey } from './i18n/index';

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replace(`{{${k}}}`, String(v)),
    str
  );
}

export function useTranslation() {
  const language = useAppStore((s) => s.language);
  const translations = language === 'en' ? en : ja;

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return interpolate(translations[key] ?? key, params);
  };

  return {
    t,
    locale: language === 'en' ? enUS : jaLocale,
    language,
  };
}
