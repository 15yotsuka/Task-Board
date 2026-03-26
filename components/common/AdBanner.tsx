import React from 'react';

// react-native-google-mobile-ads を v1.0.0 から除外。
// ObjCTurboModule::performVoidMethodInvocation でのクラッシュ原因であるため。
// 広告は v1.0.1 以降で再導入予定。
export function AdBanner() {
  return null;
}
