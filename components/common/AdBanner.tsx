import React from 'react';

// Google Mobile Ads SDK はObjCTurboModule::performVoidInvocationでSIGABRTクラッシュが発生。
// react-native-google-mobile-ads (Build 8-14, 18) / expo-ads-admob (Build 18) 両方で確認済み。
// AppLovin MAX など別SDKでの代替を検討予定（審査通過後）。
export function AdBanner() {
  return null;
}
