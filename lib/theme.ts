export const colors = {
  light: {
    primary: '#007AFF',
    primaryBg: '#E8F0FE',
    pageBg: '#F2F2F7',
    cardBg: '#FFFFFF',
    text: '#1C1C1E',
    secondaryText: '#8E8E93',
    border: '#E5E5EA',
    danger: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
  dark: {
    primary: '#0A84FF',
    primaryBg: '#1a2744',
    pageBg: '#09090b',
    cardBg: '#18181b',
    text: '#f4f4f5',
    secondaryText: '#71717a',
    border: '#27272a',
    danger: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
  },
};

export const priorityColors = {
  high: { bg: 'rgba(255,59,48,0.1)', text: '#FF3B30' },
  medium: { bg: 'rgba(255,149,0,0.1)', text: '#FF9500' },
  low: { bg: 'rgba(52,199,89,0.1)', text: '#34C759' },
};

export const radius = { card: 16, button: 12, input: 14, pill: 999 };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  /** タブバー分の下部オフセット（FABやリストのpaddingBottomに使う） */
  tabBarOffset: 80,
};

/** タイポグラフィスケール */
export const typography = {
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  heading: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '600' as const },
  label: { fontSize: 13, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 1 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  tab: { fontSize: 10, fontWeight: '600' as const },
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
};

/**
 * 16進数カラーに透明度を付与する
 * @param hex '#RRGGBB' 形式
 * @param opacity 0.0 〜 1.0
 */
export function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `${hex}${alpha}`;
}
