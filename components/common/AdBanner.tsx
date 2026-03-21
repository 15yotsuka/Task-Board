import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAppStore } from '../../store/useAppStore';

const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-6812432047298674/4393833970';

export function AdBanner() {
  const adsRemoved = useAppStore((s) => s.adsRemoved);

  if (Platform.OS === 'web' || adsRemoved) return null;

  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
