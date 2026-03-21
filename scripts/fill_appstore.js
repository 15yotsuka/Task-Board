const { chromium } = require('playwright');

const PROMO_TEXT = `期限・優先度でタスクを自動整理。今日・今週・今月別にセクション表示。グループ・カテゴリで色分け管理。カレンダーでスケジュール確認。シンプルで使いやすいタスク管理アプリ。`;

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

const KEYWORDS = `タスク管理,ToDo,スケジュール,カレンダー,リマインダー,優先度,締切,習慣,メモ,仕事効率化`;

const SUPPORT_URL = `https://github.com/yuotsuka/taskboard`;

const COPYRIGHT = `© 2026 Yu Otsuka`;

async function main() {
  console.log('Chrome プロファイルを使用してブラウザを起動します...');

  const browser = await chromium.launchPersistentContext(
    '/Users/yuotsuka/Library/Application Support/Google/Chrome',
    {
      headless: false,
      channel: 'chrome',
      slowMo: 300,
      args: ['--no-first-run', '--no-default-browser-check'],
    }
  );

  const page = await browser.newPage();

  console.log('App Store Connect を開きます...');
  await page.goto('https://appstoreconnect.apple.com/apps', { waitUntil: 'networkidle' });

  console.log('現在のURL:', page.url());

  // ログインが必要な場合は待機
  if (page.url().includes('appleid.apple.com') || page.url().includes('idmsa.apple.com')) {
    console.log('⚠️  ログインが必要です。ブラウザでログインしてください。Enterを押すと続行します...');
    await new Promise(resolve => process.stdin.once('data', resolve));
  }

  // アプリ一覧からタスクボードを探す
  console.log('タスクボードを探します...');
  try {
    await page.waitForSelector('text=タスクボード', { timeout: 10000 });
    await page.click('text=タスクボード');
    await page.waitForLoadState('networkidle');
  } catch (e) {
    console.log('アプリが見つかりません。URL を確認してください:', page.url());
    console.log('手動でタスクボードのページに移動して、Enterを押してください...');
    await new Promise(resolve => process.stdin.once('data', resolve));
  }

  // バージョン 1.0 をクリック
  try {
    await page.click('text=1.0', { timeout: 5000 });
    await page.waitForLoadState('networkidle');
  } catch (e) {
    console.log('バージョン選択をスキップ');
  }

  console.log('フォームを入力します...');

  // プロモーション用テキスト
  try {
    const promoField = page.locator('textarea').filter({ hasText: '' }).nth(0);
    // ラベルで探す
    const promoLabel = page.locator('label', { hasText: 'プロモーション' });
    if (await promoLabel.count() > 0) {
      const promoTextarea = promoLabel.locator('xpath=following::textarea[1]');
      await promoTextarea.fill(PROMO_TEXT);
      console.log('✅ プロモーション用テキスト入力完了');
    }
  } catch (e) {
    console.log('⚠️ プロモーション用テキスト入力失敗:', e.message);
  }

  // 概要
  try {
    const descLabel = page.locator('label', { hasText: '概要' });
    if (await descLabel.count() > 0) {
      const descTextarea = descLabel.locator('xpath=following::textarea[1]');
      await descTextarea.fill(DESCRIPTION);
      console.log('✅ 概要入力完了');
    }
  } catch (e) {
    console.log('⚠️ 概要入力失敗:', e.message);
  }

  // キーワード
  try {
    const kwLabel = page.locator('label', { hasText: 'キーワード' });
    if (await kwLabel.count() > 0) {
      const kwInput = kwLabel.locator('xpath=following::input[1]');
      await kwInput.fill(KEYWORDS);
      console.log('✅ キーワード入力完了');
    }
  } catch (e) {
    console.log('⚠️ キーワード入力失敗:', e.message);
  }

  // サポートURL
  try {
    const supportLabel = page.locator('label', { hasText: 'サポートURL' });
    if (await supportLabel.count() > 0) {
      const supportInput = supportLabel.locator('xpath=following::input[1]');
      await supportInput.fill(SUPPORT_URL);
      console.log('✅ サポートURL入力完了');
    }
  } catch (e) {
    console.log('⚠️ サポートURL入力失敗:', e.message);
  }

  // 著作権
  try {
    const copyrightLabel = page.locator('label', { hasText: '著作権' });
    if (await copyrightLabel.count() > 0) {
      const copyrightInput = copyrightLabel.locator('xpath=following::input[1]');
      await copyrightInput.fill(COPYRIGHT);
      console.log('✅ 著作権入力完了');
    }
  } catch (e) {
    console.log('⚠️ 著作権入力失敗:', e.message);
  }

  // 保存ボタンをクリック
  try {
    await page.click('button:has-text("保存")', { timeout: 5000 });
    console.log('✅ 保存完了');
  } catch (e) {
    console.log('⚠️ 保存ボタンが見つかりません。手動で保存してください。');
  }

  console.log('\n完了しました。ブラウザを確認してください。');
  console.log('スクリーンショットのアップロードと審査提出は手動で行ってください。');

  // ブラウザを開いたままにする
  await new Promise(resolve => setTimeout(resolve, 60000));
  await browser.close();
}

main().catch(console.error);
