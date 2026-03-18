import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../lib/useTheme';
import { spacing, typography } from '../../lib/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  index: { active: 'home', inactive: 'home-outline' },
  tasks: { active: 'checkmark-circle', inactive: 'checkmark-circle-outline' },
  calendar: { active: 'calendar', inactive: 'calendar-outline' },
};

export default function TabLayout() {
  const theme = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.cardBg,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: spacing.sm,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarLabelStyle: typography.tab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.index.active : TAB_ICONS.index.inactive}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'タスク',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.tasks.active : TAB_ICONS.tasks.inactive}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'カレンダー',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.calendar.active : TAB_ICONS.calendar.inactive}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
