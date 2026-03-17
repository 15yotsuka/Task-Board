import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';
import { useThemeColors } from '../../lib/useTheme';
import { radius } from '../../lib/theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const redirectUrl = AuthSession.makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          const params = new URL(result.url);
          const accessToken = params.searchParams.get('access_token')
            ?? params.hash?.match(/access_token=([^&]*)/)?.[1];
          const refreshToken = params.searchParams.get('refresh_token')
            ?? params.hash?.match(/refresh_token=([^&]*)/)?.[1];

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          }
        }
      }
    } catch (e: any) {
      Alert.alert('ログインエラー', e.message ?? 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.pageBg, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.center}>
        <Text style={[styles.appName, { color: theme.text }]}>TaskBoard</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          タスクを一目で管理
        </Text>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={handleGoogleLogin}
          disabled={loading}
          style={[styles.googleButton, { backgroundColor: theme.primary, opacity: loading ? 0.6 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.googleText}>Googleでログイン</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  bottom: {
    paddingBottom: 32,
  },
  googleButton: {
    borderRadius: radius.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  googleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
