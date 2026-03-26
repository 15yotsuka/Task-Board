import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAppStore } from '../../store/useAppStore';

const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-6812432047298674/4393833970';

// 設計意図:
// - ready は一度 true になった後、adsRemoved が変化してもリセットしない。
//   adsRemoved=true の場合は useEffect の早期 return とレンダリング側の if で広告を隠す。
// - 初期化失敗時は ready = false のまま BannerAd をレンダリングしない（SIGABRT 防止）。
// Singleton: initialize() is called only once across all AdBanner instances
// AdMob はネイティブ（AppDelegate.swift）で初期化済み。JS 側からの initialize() 呼び出し不要。
export function AdBanner() {
  const adsRemoved = useAppStore((s) => s.adsRemoved);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' || adsRemoved) return;
    setReady(true);
  }, [adsRemoved]);

  if (Platform.OS === 'web' || adsRemoved || !ready) return null;

  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
