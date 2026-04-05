#!/usr/bin/env python3
"""
TaskBoard v2 スクリーンショット ASCアップロード
iPhone 6.7" + iPad 12.9" の両方をアップロード
"""
import sys
import time
sys.path.insert(0, '/Users/yuotsuka/.claude/lib')
from asc_api import ASCClient
from pathlib import Path

APP_ID     = '6760923848'
VER_LOC_ID = 'e20b9f95-5453-49bf-997b-5f56c36bdec1'  # v1.1.0 ja
V2_DIR     = Path('/Users/yuotsuka/taskboard/screenshots/v2')

TARGETS = [
    ('APP_IPHONE_67',        V2_DIR / 'iphone'),
    ('APP_IPAD_PRO_3GEN_129', V2_DIR / 'ipad'),
]

client = ASCClient()

print("=== TaskBoard v2 ASCアップロード ===")
print(f"  App ID:     {APP_ID}")
print(f"  Ver Loc ID: {VER_LOC_ID}")

total_ok = 0
total_ng = 0

for display_type, dir_path in TARGETS:
    print(f"\n{'='*50}")
    print(f"[{display_type}]")
    files = sorted(dir_path.glob("ss*.png"))
    if not files:
        print(f"  スクリーンショットなし: {dir_path}")
        continue
    print(f"  {len(files)} ファイル: {[f.name for f in files]}")

    # Screenshot Set 取得/作成
    set_id = client.get_or_create_screenshot_set(VER_LOC_ID, display_type)
    if not set_id:
        print(f"  FAILED: Screenshot Setの取得/作成に失敗")
        total_ng += len(files)
        continue
    print(f"  Set ID: {set_id}")

    # 既存を削除
    deleted = client.delete_screenshots(set_id)
    print(f"  既存削除: {deleted}件")

    # アップロード
    for i, png in enumerate(files):
        print(f"  [{i+1}/{len(files)}] {png.name} ...", end=" ", flush=True)
        result = client.upload_screenshot(set_id, str(png))
        if result:
            state = result['data']['attributes'].get('assetDeliveryState', {}).get('state', '?')
            print(f"OK (state={state})")
            total_ok += 1
        else:
            print("FAILED")
            total_ng += 1
        time.sleep(0.5)

# 最終確認
print(f"\n{'='*50}")
print(f"完了: {total_ok}件成功 / {total_ng}件失敗")

if total_ok > 0:
    print("\n[STEP 最終確認] 5秒後に状態確認...")
    time.sleep(5)
    for display_type, dir_path in TARGETS:
        set_id = client.get_or_create_screenshot_set(VER_LOC_ID, display_type)
        if set_id:
            res = client.api('GET', f'/appScreenshotSets/{set_id}/appScreenshots')
            if res:
                shots = res.get('data', [])
                states = [s['attributes'].get('assetDeliveryState', {}).get('state', '?') for s in shots]
                print(f"  {display_type}: {len(shots)}件 - {states}")
