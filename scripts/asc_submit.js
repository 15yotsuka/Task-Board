#!/usr/bin/env node
/**
 * App Store Connect API — TaskBoard メタデータ入力スクリプト
 * 実行: node scripts/asc_submit.js
 */

const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

// ── 認証情報 ──────────────────────────────────────────────
const ISSUER_ID  = '91a75030-20b6-40af-a732-405c5c4b04ac';
const KEY_ID     = 'C9WM6RT2H7';
const P8_PATH    = '/Users/yuotsuka/Downloads/AuthKey_C9WM6RT2H7.p8';

// ── 入力するメタデータ ────────────────────────────────────
const LOCALE = 'ja';

const PROMO_TEXT = '期限・優先度でタスクを自動整理。今日・今週・今月別にセクション表示。グループ・カテゴリで色分け管理。カレンダーでスケジュール確認。シンプルで使いやすいタスク管理アプリ。';

const DESCRIPTION = `TaskBoardは、期限と優先度でタスクを自動整理するシンプルなタスク管理アプリです。

【自動セクション分け】
タスクを「期限超過」「今日」「今週」「今月」「それ以降」のセクションに自動で振り分けます。やることが一目でわかるので、毎日のタスク管理がスムーズになります。

【グループ・カテゴリで整理】
仕事・プライベート・学業など用途別にグループを作成して色分け管理。カテゴリも設定でき、フィルターで絞り込み表示が可能です。

【カレンダー表示】
月表示・週表示の2つのカレンダービューで、タスクの締切日をビジュアルで確認できます。

【優先度設定】
高・中・低の3段階で優先度を設定。重要なタスクを見逃しません。

【通知リマインダー】
締切の何分前に通知するかを設定できます。大切なタスクを忘れずに済みます。

【一括削除】
タスクを長押しすると複数選択モードに入ります。期限切れ・完了済みのタスクをまとめて削除できます。

【ダークモード対応】
ライト・ダーク・システム連動の3つのテーマを切り替え可能。

【完全ローカル保存】
データはすべて端末内に保存。インターネット接続不要で、プライバシーも安心です。`;

const KEYWORDS     = 'タスク管理,ToDo,スケジュール,カレンダー,リマインダー,優先度,締切,習慣,メモ,仕事効率化';
const SUPPORT_URL  = 'https://github.com/yuotsuka/taskboard';
const COPYRIGHT    = '© 2026 Yu Otsuka';
const APP_NAME     = 'タスクボード';

// ── JWT 生成 ──────────────────────────────────────────────
function makeJWT() {
  const privateKey = fs.readFileSync(P8_PATH, 'utf8');
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: ISSUER_ID,
    iat: now,
    exp: now + 1200,
    aud: 'appstoreconnect-v1',
  })).toString('base64url');
  const sign = crypto.createSign('SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  return `${header}.${payload}.${sig}`;
}

// ── HTTPS ヘルパー ────────────────────────────────────────
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.appstoreconnect.apple.com',
      path,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
        } else {
          resolve(buf ? JSON.parse(buf) : {});
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── メイン ────────────────────────────────────────────────
async function main() {
  const token = makeJWT();
  console.log('✅ JWT生成完了');

  // 1. アプリ一覧取得
  console.log('📋 アプリ一覧を取得中...');
  const apps = await request('GET', '/v1/apps?fields[apps]=bundleId,name&limit=50', null, token);
  const app = apps.data.find(a => a.attributes.bundleId === 'com.yuotsuka.taskboard')
           || apps.data.find(a => a.attributes.name?.includes('タスク') || a.attributes.name?.includes('Task'));

  if (!app) {
    console.log('利用可能なアプリ一覧:');
    apps.data.forEach(a => console.log(`  - ${a.attributes.name} (${a.attributes.bundleId}) id=${a.id}`));
    throw new Error('タスクボードが見つかりません。上のリストからApp IDを確認してください。');
  }

  const appId = app.id;
  console.log(`✅ アプリ発見: ${app.attributes.name} (ID: ${appId})`);

  // 2. App Store バージョン取得（最新の PREPARE_FOR_SUBMISSION）
  console.log('📦 App Store バージョンを取得中...');
  const versions = await request('GET', `/v1/apps/${appId}/appStoreVersions?filter[platform]=IOS&limit=5`, null, token);
  if (!versions.data.length) throw new Error('App Store バージョンが見つかりません');

  const version = versions.data[0];
  const versionId = version.id;
  console.log(`✅ バージョン: ${version.attributes.versionString} (${version.attributes.appStoreState})`);

  // 3. ローカライズ取得（ja）
  console.log('🌐 ローカライズ情報を取得中...');
  const locs = await request('GET', `/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations`, null, token);
  let loc = locs.data.find(l => l.attributes.locale === LOCALE);

  let locId;
  if (loc) {
    locId = loc.id;
    console.log(`✅ ローカライズ(${LOCALE})発見: ${locId}`);
  } else {
    // 新規作成
    console.log(`➕ ローカライズ(${LOCALE})を新規作成...`);
    const created = await request('POST', '/v1/appStoreVersionLocalizations', {
      data: {
        type: 'appStoreVersionLocalizations',
        attributes: { locale: LOCALE },
        relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } } },
      },
    }, token);
    locId = created.data.id;
    console.log(`✅ ローカライズ作成: ${locId}`);
  }

  // 4. メタデータ更新
  console.log('✏️  メタデータを更新中...');
  await request('PATCH', `/v1/appStoreVersionLocalizations/${locId}`, {
    data: {
      type: 'appStoreVersionLocalizations',
      id: locId,
      attributes: {
        description: DESCRIPTION,
        promotionalText: PROMO_TEXT,
        keywords: KEYWORDS,
        supportUrl: SUPPORT_URL,
      },
    },
  }, token);
  console.log('✅ 説明文・キーワード・サポートURL更新完了');

  // 5. App情報（アプリ名・著作権）更新
  console.log('📝 著作権・アプリ名を更新中...');
  // アプリ情報ローカライズ取得
  const appInfos = await request('GET', `/v1/apps/${appId}/appInfos`, null, token);
  if (appInfos.data.length > 0) {
    const appInfoId = appInfos.data[0].id;
    // appInfoローカライズ取得
    const aiLocs = await request('GET', `/v1/appInfos/${appInfoId}/appInfoLocalizations`, null, token);
    const aiLoc = aiLocs.data.find(l => l.attributes.locale === LOCALE);
    if (aiLoc) {
      await request('PATCH', `/v1/appInfoLocalizations/${aiLoc.id}`, {
        data: {
          type: 'appInfoLocalizations',
          id: aiLoc.id,
          attributes: { name: APP_NAME },
        },
      }, token);
      console.log(`✅ アプリ名「${APP_NAME}」更新完了`);
    }
    // 著作権はappInfo本体
    await request('PATCH', `/v1/appInfos/${appInfoId}`, {
      data: {
        type: 'appInfos',
        id: appInfoId,
        attributes: {},
      },
    }, token);
  }

  // 6. バージョン著作権更新
  await request('PATCH', `/v1/appStoreVersions/${versionId}`, {
    data: {
      type: 'appStoreVersions',
      id: versionId,
      attributes: { copyright: COPYRIGHT },
    },
  }, token);
  console.log(`✅ 著作権「${COPYRIGHT}」更新完了`);

  console.log('\n🎉 メタデータ入力完了！');
  console.log('');
  console.log('【残りの手動作業】');
  console.log('1. App Store Connect でスクリーンショットをアップロード');
  console.log('   → シミュレータでキャプチャ後、ドラッグ&ドロップ');
  console.log('2. 「審査へ提出」ボタンをクリック');
  console.log('');
  console.log(`App Store Connect: https://appstoreconnect.apple.com/apps/${appId}/appstore`);
}

main().catch((err) => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
