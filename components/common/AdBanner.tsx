import React from 'react';

// Build 12: 診断ビルド — react-native-google-mobile-ads を完全にインポートしない。
// 起動クラッシュの原因が AdMob TurboModule にあるかを確認する。
// 起動しなければ別の原因、起動すれば Build 13 で遅延ロードを実装する。
export function AdBanner() {
  return null;
}
