#!/bin/bash
# ship.sh — ビルドからTestFlight配布まで一発で行う
# 使い方: npm run ship
#
# 実行内容:
#   1. prebuild チェック
#   2. expo prebuild (--clean)
#   3. xcodebuild archive
#   4. xcodebuild -exportArchive (ASCへアップロード)
#   5. post_upload.py (暗号化設定 + Internal Testersへ追加)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE="$PROJECT_DIR/ios/TaskBoard.xcworkspace"
ARCHIVE_PATH="$PROJECT_DIR/TaskBoard.xcarchive"
EXPORT_OPTIONS="$PROJECT_DIR/ExportOptions.plist"
EXPORT_PATH="$PROJECT_DIR/dist"
DEVELOPMENT_TEAM="A5D536VS8R"

cd "$PROJECT_DIR"

# ── Step 1: presubmit チェック ──────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1/5: presubmit チェック"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node scripts/presubmit_check.js

# ── Step 2: expo prebuild ────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2/5: expo prebuild"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx expo prebuild --platform ios --clean 2>&1 | tail -5

# ── Step 3: xcodebuild archive ───────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3/5: アーカイブ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme TaskBoard \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  archive \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM" \
  2>&1 | grep -E "ARCHIVE|error:|warning: LD_" | tail -5

echo "✅ アーカイブ完了"

# ── Step 4: export + ASCアップロード ────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4/5: App Store Connectへアップロード"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -exportPath "$EXPORT_PATH" \
  2>&1 | grep -E "Upload|upload|EXPORT|error:" | tail -10

echo "✅ アップロード完了"

# ── Step 5: TestFlight配布 ───────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5/5: TestFlight配布"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# ASCの処理完了を少し待つ
echo "⏳ ASC処理完了を待機中（30秒）..."
sleep 30
python3 scripts/post_upload.py

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 完了！TestFlightアプリをリロードして確認してください。"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
