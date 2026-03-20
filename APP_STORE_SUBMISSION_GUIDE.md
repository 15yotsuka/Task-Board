# App Store 申請 完全ガイド

就活ボード（ShukatsuBoard）の申請作業で実際にやったことをベースにした引き継ぎ資料。
次のアプリをリリースするときにそのまま使える。

---

## 目次

1. [全体の流れ](#1-全体の流れ)
2. [事前準備（Appleアカウント・証明書）](#2-事前準備)
3. [必要なメタデータ一覧](#3-必要なメタデータ一覧)
4. [スクリーンショット作成](#4-スクリーンショット作成)
5. [App Store Connect API でスクショを自動アップロード](#5-app-store-connect-api-でスクショを自動アップロード)
6. [Xcodeでのアーカイブ・アップロード](#6-xcodeでのアーカイブアップロード)
7. [App Store Connect での申請操作](#7-app-store-connect-での申請操作)
8. [審査中・審査後](#8-審査中審査後)
9. [ハマりポイント・こだわり・学び](#9-ハマりポイントこだわり学び)

---

## 1. 全体の流れ

```
① Apple Developer Program に加入（年 $99 = 約14,000円）
        ↓
② Bundle ID・App ID を Developer Portal で作成
        ↓
③ App Store Connect でアプリレコードを作成
        ↓
④ メタデータを入力（名前・説明・キーワード等）
        ↓
⑤ スクリーンショットを作成・アップロード
        ↓
⑥ Xcode でアーカイブ → TestFlight にアップロード
        ↓
⑦ App Store Connect でビルドを選択・審査に提出
        ↓
⑧ 審査（通常 24〜48 時間）
        ↓
⑨ 承認 → リリース
```

---

## 2. 事前準備

### Apple Developer Program

- 個人 or 組織で加入：https://developer.apple.com/programs/
- 年間 $99（約 14,000 円）
- 加入後 1〜2 日でアクティベートされる

### Bundle ID の作成

Developer Portal → Identifiers → "+" で追加：

```
App IDs → App を選択
Bundle ID: com.yourname.appname  （逆ドメイン形式）
例: com.yuotsuka.shukatsuboard
```

Bundle ID は後から変えられないので慎重に。

### Xcode プロジェクトの設定

```
TARGETS → General → Bundle Identifier: com.yourname.appname
Signing & Capabilities → Team: 自分のチームを選択
```

Expo の場合は `app.json` に：

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourname.appname"
    }
  }
}
```

### App Store Connect でアプリレコード作成

1. https://appstoreconnect.apple.com にアクセス
2. 「マイ App」→「+」→「新規 App」
3. 入力項目：
   - プラットフォーム: iOS
   - 名前: アプリ名（App Store に表示される）
   - 言語: 日本語
   - Bundle ID: 先ほど作成したもの
   - SKU: 任意の識別子（例: `shukatsu-board-001`、公開されない）

---

## 3. 必要なメタデータ一覧

App Store Connect の「バージョン情報」ページに入力する内容。

### 必須項目

| 項目 | 文字数制限 | 備考 |
|---|---|---|
| **アプリ名** | 30文字 | App Store に表示される名前 |
| **サブタイトル** | 30文字 | 名前の下に表示される短い説明 |
| **説明** | 4,000文字 | アプリページの本文 |
| **キーワード** | 100文字 | カンマ区切り、検索に使われる |
| **プロモーションテキスト** | 170文字 | 説明の上に表示（いつでも変更可能） |
| **サポートURL** | - | 問い合わせページ or GitHub |
| **著作権** | - | 例: `© 2026 Yu Otsuka` |

### 年齢制限

「App Review」→「年齢制限」で設定。就活ボードのような一般ツールは **4+**。

暴力・性的コンテンツ・ギャンブル等がある場合は該当する年齢に上げる必要あり。

### カテゴリ

プライマリカテゴリ（必須）とセカンダリカテゴリ（任意）を選ぶ。

就活ボード: **仕事効率化**（Productivity）

### プライバシーポリシー

**アカウント作成・ユーザーデータを扱う場合は必須**。
ローカル保存のみのシンプルなアプリでも書いておくと安心。

GitHub Pages や Notion ページに書いて URL を貼るのが一番手軽。

---

## 4. スクリーンショット作成

### 必要なサイズ

| デバイス | サイズ | 備考 |
|---|---|---|
| **iPhone 6.9"** | 1320×2868 px | iPhone 16 Pro Max |
| **iPhone 6.7"** | 1290×2796 px | iPhone 15 Pro Max / 14 Pro Max ← 就活ボードはこれ |
| iPhone 6.5" | 1242×2688 px | iPhone 11 Pro Max など |
| iPhone 5.5" | 1242×2208 px | iPhone 8 Plus など |
| **iPad 13"** | 2064×2752 px | iPad Pro 13インチ（最新） |
| iPad 12.9" | 2048×2732 px | iPad Pro 12.9インチ ← 就活ボードはこれ |

**最低限必要なもの**:
- iPhone は 6.7" か 6.9" のどちらか（最大2サイズが必要な場合あり）
- iPad を出す場合は iPad 13" か 12.9"

### 枚数・ルール

- 1セットあたり最大 10 枚
- 最低 1 枚
- PNG または JPEG（PNG 推奨）
- アルファチャンネル（透明）は不可

### 実機スクリーンショット vs プロモ画像

| 方法 | メリット | デメリット |
|---|---|---|
| 実機スクショそのまま | 簡単 | 地味、差別化できない |
| **プロモ画像（背景+キャプション付き）** | 見栄えが良い、ASO効果大 | 作成コストあり |

就活ボードはプロモ画像を採用。Python + Playwright でグラデーション背景にデバイスフレームを合成。

### プロモ画像の作り方（就活ボードの手法）

#### 使ったツール

- **Python (PIL/Pillow)**: 画像合成・グラデーション生成・サイズ変換
- **Playwright (Python)**: HTML→PNG のヘッドレスレンダリング
- **App Store Connect API**: スクショの一括削除・アップロード自動化

#### ワークフロー

```
実機スクリーンショット（実機で撮影）
    ↓
ステータスバーをブランク（時刻・電池残量を消す）
    ↓
HTML テンプレートに埋め込む
（グラデーション背景 + キャプション + フレーム）
    ↓
Playwright で 1290×2796px にレンダリング
    ↓
PIL で iPad サイズ（2048×2732）にリサイズ・合成
    ↓
ASC API でアップロード
```

#### HTML テンプレートのポイント

```html
<!-- スクリーンのフレーム -->
<div class="screenshot-frame" id="ss1">
  <!-- グラデーション背景 -->
  <div style="background: linear-gradient(135deg, #667eea, #764ba2);">

    <!-- キャッチコピー -->
    <div class="caption">
      <h2>就活の予定を<br>一目で管理</h2>
    </div>

    <!-- 実機スクショ -->
    <div class="phone-mockup">
      <img src="home.png" />
    </div>

  </div>
</div>
```

#### ステータスバーを消す方法

```python
from PIL import Image, ImageDraw

DARK_BG = (22, 22, 25)  # ダークモードの背景色

img = Image.open("screenshot.png").convert("RGB")
draw = ImageDraw.Draw(img)
# 上部 160px をアプリ背景色で塗りつぶす
draw.rectangle([(0, 0), (img.width, 160)], fill=DARK_BG)
img.save("screenshot_clean.png")
```

---

## 5. App Store Connect API でスクショを自動アップロード

手動アップロードは毎回手間なので API で自動化した。

### API キーの取得

1. App Store Connect → ユーザーとアクセス → 統合 → App Store Connect API
2. 「キーを生成」→ **「App Manager」** 権限で作成
3. ダウンロード：`AuthKey_XXXXXXXXXX.p8`（一度しかダウンロードできない！）
4. 控えておく情報：
   - Key ID（10文字）
   - Issuer ID（UUID形式）

### JWT トークンの生成

```python
import jwt, time

KEY_ID = "XXXXXXXXXX"
ISSUER_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
PRIVATE_KEY = open("AuthKey_XXXXXXXXXX.p8").read()

payload = {
    "iss": ISSUER_ID,
    "iat": int(time.time()),
    "exp": int(time.time()) + 1200,  # 20分有効
    "aud": "appstoreconnect-v1",
}
token = jwt.encode(payload, PRIVATE_KEY, algorithm="ES256", headers={"kid": KEY_ID})
```

### スクショのアップロードフロー

```
① スクショセット ID の取得
   GET /v1/appStoreVersionLocalizations/{id}/appScreenshotSets

② 既存スクショの削除
   DELETE /v1/appScreenshots/{id}

③ 新スクショの予約
   POST /v1/appScreenshotSets/{setId}/appScreenshots
   → screenshotAsset.uploadOperations が返ってくる

④ 実ファイルのアップロード（S3 等への PUT）
   PUT {url} (Content-Length, Content-Type ヘッダー付き)

⑤ コミット（アップロード完了を通知）
   PATCH /v1/appScreenshots/{id}
   body: { "data": { "attributes": { "uploaded": true } } }
```

### スクショセットの displayType 一覧

| displayType | 意味 |
|---|---|
| `APP_IPHONE_67` | iPhone 6.7" |
| `APP_IPHONE_69` | iPhone 6.9" |
| `APP_IPAD_PRO_3GEN_129` | iPad Pro 12.9" |
| `APP_IPAD_PRO_129` | iPad Pro 13" |

---

## 6. Xcodeでのアーカイブ・アップロード

### Expo の場合（EAS Build 使用）

```bash
# EAS CLI のインストール
npm install -g eas-cli

# EAS にログイン
eas login

# eas.json の設定
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"  // App Store Connect のアプリID
      }
    }
  }
}

# ビルド → アップロード
eas build --platform ios --profile production
eas submit --platform ios --latest
```

### Xcode から直接アーカイブする場合

1. Product → Archive
2. Distribute App → App Store Connect → Upload
3. 証明書・プロビジョニングプロファイルを選択
4. Upload 完了後、App Store Connect の TestFlight に反映（5〜30分）

### よくあるエラー

| エラー | 対処 |
|---|---|
| `No signing certificate found` | Xcode → Preferences → Accounts でチームを再サインイン |
| `Provisioning profile doesn't include` | Developer Portal で App ID と Bundle ID が一致しているか確認 |
| `Invalid Info.plist` | NSCameraUsageDescription など権限の説明文が抜けている |
| `ITMS-90562: Invalid Bundle` | アーカイブ時のスキームが Release ビルドか確認 |

---

## 7. App Store Connect での申請操作

### ビルドの選択

1. App Store Connect → マイ App → バージョン編集
2. 「ビルド」セクション → TestFlight にアップロードされたビルドを選択
3. エクスポートコンプライアンス（暗号化）の質問 → 一般的なアプリは「いいえ」

### 年齢制限の設定

「App Review」→「年齢制限を編集」→ 各項目を選択 → 保存

就活ボード（一般ツール）の回答例：
- カートゥーン/ファンタジーの暴力: なし
- リアルな暴力: なし
- 性的コンテンツ: なし
- アルコール/タバコ/ドラッグ: なし
- ギャンブル: なし
- → **4+** になる

### 審査に提出

「バージョン」ページ右上の「審査に提出」ボタンを押す。

押す前のチェックリスト：
- [ ] スクリーンショット: iPhone 必須、iPad 任意（出す場合は設定）
- [ ] アプリ名・説明・キーワード入力済み
- [ ] サポート URL 入力済み
- [ ] 著作権入力済み
- [ ] 年齢制限設定済み
- [ ] プライバシーポリシー URL 入力済み（データ収集あり or アカウントあり）
- [ ] ビルドが選択済み
- [ ] リリース方法の選択（自動 or 手動）

---

## 8. 審査中・審査後

### 審査にかかる時間

- 通常: 24〜48 時間
- 混雑期（年末・WWDC 前後）: 3〜7 日かかることも
- 再審査: 1〜2 日

### 審査結果

**承認（Approved）**: そのまま自動公開 or 手動公開ボタンを押す

**リジェクト（Rejected）**: App Store Connect の「解決センター」にメッセージが届く

### よくあるリジェクト理由と対処

| リジェクト理由 | 対処 |
|---|---|
| 4.0 Design: クラッシュ・バグ | TestFlight で動作確認を徹底する |
| 2.1 App Completeness: デモデータなし | 審査用アカウントを用意するか、デモデータを仕込む |
| 5.1.1 Privacy: Privacy Policy がない | プライバシーポリシーページを作って URL を設定 |
| 1.2 Guideline: ログイン不要なのにアカウント必須 | ゲスト利用を可能にするか、アカウント必須の理由を説明 |
| メタデータ不備 | 説明文・スクショが実際の機能と乖離していないか確認 |

リジェクトされた場合：
1. 指摘内容を読む（英語だが DeepL で読める）
2. 修正する
3. 「返答する」ボタンで対処内容を伝えて再申請

### アップデート申請

初回と同じ手順。違いは：
- 「バージョン情報」→「新バージョンを追加」でバージョン番号を上げる
- 「このバージョンの新機能」（What's New）を記入する
- ビルドのバージョン番号も上げる（例: 1.0 → 1.1）

---

## 9. ハマりポイント・こだわり・学び

### スクリーンショット

**こだわり**:
- 実機スクショをそのまま使うのではなく、グラデーション背景とキャッチコピーを合成
- 各画面のテーマカラーに合わせてグラデーションを変える
  - ホーム: 青系（`#667eea → #764ba2`）
  - 企業: ティール系（`#0f766e → #5eead4`）
  - カレンダー: 紺系（`#1e3a5f → #2563eb`）
  - 締切: ピンク系（`#be185d → #db2777`）

**ハマり**:
- iPhone 6.7" (1290×2796) と iPad 12.9" (2048×2732) で**縦横比が違う**
  → iPad 用は横幅を元画像から計算してリサイズ後、グラデーション背景に貼る必要あり
- Playwright のレンダリングと実際の画像ではフォントのアンチエイリアスが若干違う
  → 本番実機に近いクオリティを出すには viewport をスクショサイズに合わせる

**学び**:
- `partialize` で永続化するフィールドを明示しないと、アクション関数まで AsyncStorage に保存しようとしてエラーになる
- アップロードスクリプトのパスは定数化しておくこと（バージョンアップのたびにパス変更が発生した）

### ASC API

**ハマり**:
- JWT トークンの有効期限は最大 20 分。長時間の処理では途中で期限切れになる
- スクショのアップロードは「予約 → S3 PUT → コミット」の3ステップ。S3 の URL は一時的なもので期限あり
- `displayType` の名前が直感的でない（`APP_IPAD_PRO_3GEN_129` など）。実際の値は API ドキュメントで確認

**学び**:
- 既存スクショを削除してから新規アップロードする方が、順序管理が楽
- ファイル名のアルファベット順 = 表示順になる → `01_home.png`, `02_companies.png` のように番号プレフィックスをつける

### 審査

**ハマり**:
- 年齢制限の設定が「未設定」のまま提出しようとするとエラーになる（よく忘れる）
- 「審査に提出」ボタンを押した後でもスクショは変更できる（審査中に差し替え可能）

**学び**:
- 初回審査は厳しめに見られることがある → クラッシュゼロ、空の状態・エラー状態の UI を必ず確認しておく
- スクショのキャプション文言は「機能を具体的に伝えるもの」が効果的。抽象的なコピーよりも「締切日を一覧で確認」のような具体的な説明の方がユーザーに刺さる

---

## チェックリスト（申請前コピペ用）

### 開発完了チェック

- [ ] ビルドエラー 0 件
- [ ] クラッシュなし（iOS 実機で動作確認）
- [ ] 空の状態（データ 0 件）のUIが適切に表示される
- [ ] ダークモード・ライトモードの両方で表示崩れなし
- [ ] iPad で表示崩れなし（対象の場合）

### メタデータチェック

- [ ] アプリ名（30 文字以内）
- [ ] サブタイトル（30 文字以内）
- [ ] 説明（4,000 文字以内）
- [ ] キーワード（100 文字以内）
- [ ] サポート URL
- [ ] 著作権
- [ ] 年齢制限
- [ ] プライバシーポリシー URL

### スクリーンショットチェック

- [ ] iPhone 6.7" (1290×2796) 1〜10 枚
- [ ] iPad 12.9" (2048×2732) 1〜10 枚（iPad 対応の場合）
- [ ] アルファチャンネルなし（PNG でも透明部分なし）
- [ ] スクショの内容がアプリの実際の機能を表している

### 申請操作チェック

- [ ] ビルドを選択済み
- [ ] エクスポートコンプライアンス回答済み
- [ ] リリース方法の確認（自動公開 or 手動公開）
- [ ] 「審査に提出」ボタンを押す
