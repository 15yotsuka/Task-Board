#!/usr/bin/env python3
"""
TaskBoard プロモスクリーンショット ASCアップロードスクリプト
"""
import sys
import time
sys.path.insert(0, '/Users/yuotsuka/.claude/lib')
from asc_api import ASCClient
from pathlib import Path

APP_ID     = '6760923848'
VER_LOC_ID = 'f988b86a-954f-4f4e-847a-e87f36d32d47'
FINAL_DIR  = Path('/Users/yuotsuka/taskboard/screenshots/final')

# iPhone 6.7インチ (1290x2796)
DISPLAY_TYPE = 'APP_IPHONE_67'

client = ASCClient()

print("=== ASC スクリーンショット アップロード ===")
print(f"  App ID:      {APP_ID}")
print(f"  Ver Loc ID:  {VER_LOC_ID}")
print(f"  DisplayType: {DISPLAY_TYPE}")

# ---- Screenshot Set の取得/作成 ----
print("\n[STEP 1] スクリーンショットセットを取得/作成...")
set_id = client.get_or_create_screenshot_set(VER_LOC_ID, DISPLAY_TYPE)
if not set_id:
    print("  FAILED: スクリーンショットセットの取得/作成に失敗")
    sys.exit(1)
print(f"  Set ID: {set_id}")

# ---- 既存スクリーンショットを削除 ----
print("\n[STEP 2] 既存スクリーンショットを削除...")
deleted = client.delete_screenshots(set_id)
print(f"  Deleted {deleted} existing screenshot(s)")

# ---- 新規アップロード ----
print("\n[STEP 3] 新規スクリーンショットをアップロード...")
files = sorted(FINAL_DIR.glob("ss*.png"))
print(f"  {len(files)} file(s) to upload:")
for f in files:
    print(f"    {f.name}")

results = []
for i, png in enumerate(files):
    print(f"\n  [{i+1}/{len(files)}] {png.name}...")
    result = client.upload_screenshot(set_id, str(png))
    if result:
        ss_id = result['data']['id']
        state = result['data']['attributes'].get('assetDeliveryState', {}).get('state', '?')
        print(f"    OK → id={ss_id}, state={state}")
        results.append((png.name, ss_id, state, True))
    else:
        print(f"    FAILED")
        results.append((png.name, None, 'FAILED', False))

# ---- 結果サマリー ----
print("\n=== アップロード結果 ===")
ok_count = sum(1 for _, _, _, ok in results if ok)
for fname, ss_id, state, ok in results:
    mark = "OK" if ok else "NG"
    print(f"  [{mark}] {fname} → {state}")

print(f"\n完了: {ok_count}/{len(files)} 件アップロード成功")

# ---- AWAITING_UPLOAD のものがあればリトライ ----
awaiting = [ss_id for _, ss_id, state, _ in results if state == 'AWAITING_UPLOAD' and ss_id]
if awaiting:
    print(f"\n警告: {len(awaiting)} 件が AWAITING_UPLOAD のまま")
    print("  数秒後に状態を再確認してください")

# ---- 最終確認 ----
print("\n[STEP 4] アップロード後の状態確認...")
time.sleep(5)
check_result = client.api('GET', f'/appScreenshotSets/{set_id}/appScreenshots')
if check_result:
    screenshots = check_result.get('data', [])
    print(f"  セット内のスクリーンショット: {len(screenshots)} 件")
    all_complete = True
    for ss in screenshots:
        state = ss['attributes'].get('assetDeliveryState', {}).get('state', '?')
        fname = ss['attributes'].get('fileName', '?')
        print(f"    {fname}: {state}")
        if state != 'UPLOAD_COMPLETE':
            all_complete = False

    if all_complete:
        print("\n全スクリーンショットが UPLOAD_COMPLETE です")
    else:
        print("\n一部スクリーンショットが未完了です。ASC Webで確認してください")
else:
    print("  状態確認に失敗しました")

print(f"\nSet ID: {set_id}")
print("完了")
