// ============================================================================
// gen-changelog.mjs - 更新情報（src/data/changelog.json）から README と別サイト用の文面を作る
//   cd webApp && npm run changelog
//   - リポジトリ直下の README.md の「最近の更新」（CHANGELOG:START〜END の間）を差し替える
//   - 別サイトに貼る文面を docs/changelog/site.html・site.md に書き出す（docs/ は git 管理外）
//   データに問題があれば何も書かずに終了コード 1 で止まる
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateChangelog, replaceReadmeSection, renderSiteHtml, renderSiteMarkdown } from '../src/utils/changelog.ts';

const here = dirname(fileURLToPath(import.meta.url));
const webApp = resolve(here, '..');
const repo = resolve(webApp, '..');

const entries = JSON.parse(readFileSync(resolve(webApp, 'src/data/changelog.json'), 'utf8'));
const errors = validateChangelog(entries);
if (errors.length) {
  console.error('changelog.json に問題があります:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

const readmePath = resolve(repo, 'README.md');
const before = readFileSync(readmePath, 'utf8');
const after = replaceReadmeSection(before, entries);
if (after !== before) writeFileSync(readmePath, after);
console.log(after !== before ? 'README.md を更新しました' : 'README.md は最新です');

const siteDir = resolve(repo, 'docs/changelog');
mkdirSync(siteDir, { recursive: true });
writeFileSync(resolve(siteDir, 'site.html'), renderSiteHtml(entries) + '\n');
writeFileSync(resolve(siteDir, 'site.md'), renderSiteMarkdown(entries) + '\n');
console.log(`別サイト用の文面: ${siteDir}\\site.html, site.md`);
