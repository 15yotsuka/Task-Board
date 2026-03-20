import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsDark } from '../lib/useTheme';

function AppContent() {
  const isDark = useIsDark();
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const prevIsDark = useRef(isDark);

  useEffect(() => {
    if (prevIsDark.current === isDark) return;
    prevIsDark.current = isDark;
    Animated.sequence([
      Animated.timing(overlayOpacity, { toValue: 0.2, duration: 180, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
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
          { backgroundColor: isDark ? '#000' : '#fff', opacity: overlayOpacity },
        ]}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
