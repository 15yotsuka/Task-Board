import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsDark } from '../lib/useTheme';
import { initNotificationHandler } from '../lib/notifications';

function AppContent() {
  const isDark = useIsDark();
  const overlayOpacity = useSharedValue(0);
  const prevIsDark = useRef(isDark);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  useEffect(() => {
    if (prevIsDark.current === isDark) return;
    prevIsDark.current = isDark;
    overlayOpacity.value = withTiming(0.2, { duration: 180 }, () => {
      overlayOpacity.value = withTiming(0, { duration: 400 });
    });
  }, [isDark]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: isDark ? '#000' : '#fff' },
          overlayStyle,
        ]}
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initNotificationHandler();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
