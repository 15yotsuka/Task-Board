#!/bin/bash
# release_smoke_test.sh
# シミュレータで Release ビルドを起動し、クラッシュしないことを確認する。
# 本番のみ発生するクラッシュ（scheme 未定義、TurboModule 初期化順序等）を事前に検出。
#
# 使い方: npm run smoke-test

set -euo pipefail

WORKSPACE="ios/TaskBoard.xcworkspace"
SCHEME="TaskBoard"
APP_ID="com.yuotsuka.taskboard"

# 利用可能なシミュレータを自動検出（Booted 優先、なければ最初の iPhone）
SIM_ID=$(xcrun simctl list devices available | grep "(Booted)" | head -1 | grep -oE '[0-9A-F-]{36}')
if [ -z "$SIM_ID" ]; then
  SIM_ID=$(xcrun simctl list devices available | grep "iPhone" | head -1 | grep -oE '[0-9A-F-]{36}')
  echo "🔄 シミュレータを起動中..."
  xcrun simctl boot "$SIM_ID" 2>/dev/null || true
fi
SIM_NAME=$(xcrun simctl list devices | grep "$SIM_ID" | head -1 | sed 's/ (.*//' | xargs)
echo "📱 シミュレータ: $SIM_NAME ($SIM_ID)"

# Release ビルド
echo "🔨 Release ビルド中..."
BUILD_DIR="/tmp/TaskBoard-smoke-test"
rm -rf "$BUILD_DIR"
xcodebuild -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath "$BUILD_DIR" \
  -destination "id=$SIM_ID" \
  build 2>&1 | tail -1

APP_PATH=$(find "$BUILD_DIR" -name "TaskBoard.app" -path "*/Release-iphonesimulator/*" | head -1)
if [ -z "$APP_PATH" ]; then
  echo "❌ ビルド失敗: TaskBoard.app が見つかりません"
  exit 1
fi
echo "✅ ビルド成功"

# インストール
echo "📲 インストール中..."
xcrun simctl terminate "$SIM_ID" "$APP_ID" 2>/dev/null || true
xcrun simctl install "$SIM_ID" "$APP_PATH"

# 起動して 5 秒待つ
echo "🚀 起動テスト（5秒）..."
xcrun simctl launch "$SIM_ID" "$APP_ID"
sleep 5

# プロセスが生存しているか確認
if xcrun simctl spawn "$SIM_ID" launchctl list | grep -q "$APP_ID"; then
  echo "✅ スモークテスト PASS — 5秒間クラッシュなし"
  xcrun simctl terminate "$SIM_ID" "$APP_ID" 2>/dev/null || true
  exit 0
else
  echo "❌ スモークテスト FAIL — アプリがクラッシュしました"
  echo "   コンソールログを確認: xcrun simctl launch --console-pty $SIM_ID $APP_ID"
  exit 1
fi
