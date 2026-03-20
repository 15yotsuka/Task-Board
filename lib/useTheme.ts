import { useColorScheme } from 'react-native';
import { colors } from './theme';
import { useAppStore } from '../store/useAppStore';

export function useIsDark(): boolean {
  const scheme = useColorScheme();
  const themeMode = useAppStore((s) => s.themeMode);
  return themeMode === 'dark' || (themeMode === 'system' && scheme === 'dark');
}

export function useThemeColors() {
  const isDark = useIsDark();
  return isDark ? colors.dark : colors.light;
}
