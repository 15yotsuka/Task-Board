import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, MobileAds } from 'react-native-google-mobile-ads';
import { useAppStore } from '../../store/useAppStore';

const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-6812432047298674/4393833970';

// Build 13 fix:
// AppDelegate での MobileAds.shared.start() を廃止。
// 起動 ~0.5s 後に completion handler がバックグラウンドスレッドで発火し、
// react-native-google-mobile-ads TurboModule が JS にコールバック
// → ObjCTurboModule::performVoidMethodInvocation で ObjC 例外 → SIGABRT。
// JS 側から 2s 遅延後に MobileAds().initialize() を呼ぶことで、
// TurboModule ブリッジが安定した後に SDK 初期化する。
export function AdBanner() {
  const adsRemoved = useAppStore((s) => s.adsRemoved);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' || adsRemoved) return;
    const timer = setTimeout(async () => {
      try {
        await MobileAds().initialize();
        setReady(true);
      } catch {
        // 初期化失敗時はバナーを非表示のまま
      }
    }, 2000);
    return () => clearTimeout(timer);
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
