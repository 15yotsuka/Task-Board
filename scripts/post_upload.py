#!/usr/bin/env python3
"""
post_upload.py — TestFlight後処理スクリプト
xcodebuildアップロード直後に実行する。
- usesNonExemptEncryption を false に設定
- Internal Testers グループにビルドを追加
"""

import jwt
import time
import json
import sys
import requests
from pathlib import Path

# ASC認証情報
KEY_ID = "C9WM6RT2H7"
ISSUER_ID = "91a75030-20b6-40af-a732-405c5c4b04ac"
KEY_FILE = Path.home() / ".appstoreconnect/private_keys/AuthKey_C9WM6RT2H7.p8"
APP_ID = "6760923848"
INTERNAL_GROUP_ID = "f8d8bc94-3a89-435e-9b63-060500e18cce"

APP_JSON = Path(__file__).parent.parent / "app.json"


def make_token():
    with open(KEY_FILE) as f:
        private_key = f.read()
    payload = {
        "iss": ISSUER_ID,
        "iat": int(time.time()),
        "exp": int(time.time()) + 1200,
        "aud": "appstoreconnect-v1",
    }
    return jwt.encode(payload, private_key, algorithm="ES256", headers={"kid": KEY_ID})


def get_build_number():
    with open(APP_JSON) as f:
        data = json.load(f)
    return data["expo"]["ios"]["buildNumber"]


def find_build_id(headers, build_number):
    """buildNumberからビルドIDを取得（最大200件から検索）"""
    r = requests.get(
        f"https://api.appstoreconnect.apple.com/v1/apps/{APP_ID}/builds",
        headers=headers,
        params={"limit": 200, "fields[builds]": "version,processingState"},
    )
    r.raise_for_status()
    for b in r.json().get("data", []):
        if b["attributes"]["version"] == build_number:
            return b["id"]
    return None


def main():
    print("🔍 app.json からビルド番号を取得中...")
    build_number = get_build_number()
    print(f"   Build {build_number}")

    token = make_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    print(f"🔍 ASC で Build {build_number} を検索中...")
    build_id = find_build_id(headers, build_number)
    if not build_id:
        print(f"❌ Build {build_number} が見つかりません。まだ処理中の可能性があります。数分後に再実行してください。")
        sys.exit(1)
    print(f"   ID: {build_id}")

    print("🔧 usesNonExemptEncryption を false に設定中...")
    r = requests.patch(
        f"https://api.appstoreconnect.apple.com/v1/builds/{build_id}",
        headers=headers,
        json={"data": {"type": "builds", "id": build_id, "attributes": {"usesNonExemptEncryption": False}}},
    )
    if r.status_code == 200:
        print("   ✅ 設定完了")
    else:
        print(f"   ⚠️  {r.status_code}: {r.text[:200]}")

    print("📲 Internal Testers グループに追加中...")
    r = requests.post(
        f"https://api.appstoreconnect.apple.com/v1/betaGroups/{INTERNAL_GROUP_ID}/relationships/builds",
        headers=headers,
        json={"data": [{"type": "builds", "id": build_id}]},
    )
    if r.status_code in (200, 204):
        print(f"   ✅ Build {build_number} を TestFlight に配布しました")
    else:
        err = r.json().get("errors", [{}])[0].get("detail", r.text)
        print(f"   ⚠️  {r.status_code}: {err}")

    print("\n✅ 完了。TestFlightアプリをリロードして確認してください。")


if __name__ == "__main__":
    main()
