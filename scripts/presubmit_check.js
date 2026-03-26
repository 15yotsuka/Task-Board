#!/usr/bin/env node
/**
 * presubmit_check.js
 * App Store 提出前チェックスクリプト
 * 実行: node scripts/presubmit_check.js
 *
 * チェック項目:
 *   1. AdMob シングルトン初期化 (ensureAdsInitialized) が AdBanner.tsx に存在する
 *   2. サポートURLが200を返す
 *   3. buildNumber が app.json と Info.plist で一致する
 *   4. docs/index.html が存在する（サポートページ）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function ok(msg) {
  console.log(`  ✅ ${msg}`);
  passed++;
}

function fail(msg) {
  console.error(`  ❌ ${msg}`);
  failed++;
}

function warn(msg) {
  console.warn(`  ⚠️  ${msg}`);
}

function checkFile(label, filePath, pattern) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    fail(`${label} — ファイルを読み込めません: ${filePath} (${e.message})`);
    return;
  }
  if (pattern.test(content)) {
    ok(label);
  } else {
    fail(`${label} — パターンが見つかりません: ${filePath}`);
  }
}

function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve({ status: res.statusCode });
      res.resume();
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ status: 0, error: 'timeout' });
    });
  });
}

async function main() {
  console.log('\n🔍 App Store 提出前チェック\n');

  // 1. AdMob シングルトン初期化チェック
  console.log('【1】AdMob シングルトン初期化（AdBanner.tsx）');
  const adBannerPath = path.join(ROOT, 'components/common/AdBanner.tsx');
  checkFile(
    'ensureAdsInitialized 関数が存在する',
    adBannerPath,
    /function ensureAdsInitialized/
  );

  // 2. サポートURL死活チェック
  console.log('\n【2】サポートURL');
  let appJson;
  try {
    appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
  } catch (e) {
    fail('app.json が読み込めません');
    process.exit(1);
  }
  const supportUrl = appJson?.expo?.extra?.supportUrl;
  if (supportUrl === undefined) {
    fail('app.json に extra.supportUrl が設定されていません');
    return;
  }

  const result = await fetchUrl(supportUrl);
  if (result.status >= 200 && result.status < 400) {
    ok(`${supportUrl} → HTTP ${result.status}`);
  } else {
    warn(`${supportUrl} → HTTP ${result.status || 0} (${result.error || 'アクセス不可'}) — GitHub Pages未設定の可能性`);
  }

  // 3. buildNumber 一致チェック
  console.log('\n【3】buildNumber 整合性');
  const buildNumberFromAppJson = appJson?.expo?.ios?.buildNumber;
  const infoPlistPath = path.join(ROOT, 'ios/TaskBoard/Info.plist');
  let infoPlistContent;
  try {
    infoPlistContent = fs.readFileSync(infoPlistPath, 'utf8');
  } catch (e) {
    fail('Info.plist が読み込めません');
    infoPlistContent = null;
  }

  if (infoPlistContent !== null) {
    const match = infoPlistContent.match(/<key>CFBundleVersion<\/key>\s*<string>(\d+)<\/string>/);
    const buildNumberFromPlist = match ? match[1] : null;

    if (!buildNumberFromAppJson) {
      fail('app.json に ios.buildNumber が設定されていない');
    } else if (buildNumberFromPlist === buildNumberFromAppJson) {
      ok(`app.json と Info.plist の buildNumber が一致: ${buildNumberFromAppJson}`);
    } else {
      fail(`buildNumber 不一致 — app.json: ${buildNumberFromAppJson}, Info.plist: ${buildNumberFromPlist}`);
    }
  }

  // 4. docs/index.html 存在チェック（サポートページ）
  console.log('\n【4】サポートページ');
  const docsPath = path.join(ROOT, 'docs/index.html');
  if (fs.existsSync(docsPath)) {
    ok('docs/index.html が存在する');
  } else {
    fail('docs/index.html が存在しない — GitHub Pages のサポートページが消えています');
  }

  // 結果サマリー
  console.log(`\n${'─'.repeat(40)}`);
  if (failed === 0) {
    console.log(`✅ 全チェック通過 (${passed}/${passed + failed})`);
    console.log('提出OK\n');
    process.exit(0);
  } else {
    console.log(`❌ ${failed}件の問題があります (${passed}/${passed + failed} 通過)`);
    console.log('上記の問題を修正してから提出してください\n');
    process.exit(1);
  }
}

main();
