// ============================================================================
// find-ja-literals.mjs - 画面の部品に、翻訳の表を通さずに直接書かれた日本語が残っていないかを数える
//   cd webApp && node scripts/find-ja-literals.mjs [ファイルやフォルダ ...]
//   - 既定は src/components と src/App.tsx
//   - コメント（// … と /* … */・{/* … */}）の中の日本語は数えない
//   - 行の末尾に `// i18n-ok` と書いた行は数えない（図のデータの既定値など、訳さないと決めたもの）
//   - 終了コード: 残りがあれば 1（一覧を出す）、無ければ 0
// 2026-11-08: 画面の英語化（翻訳の表 locales/*.csv）のために作った
// ============================================================================
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['src/components', 'src/App.tsx'];
const JA = /[぀-ヿ㐀-鿿！-｠]/;

function files(p) {
  const abs = resolve(root, p);
  if (statSync(abs).isDirectory()) return readdirSync(abs).flatMap((f) => files(join(p, f)));
  return /\.(tsx?|ts)$/.test(p) && !/\.test\.tsx?$/.test(p) ? [abs] : [];
}

let total = 0;
for (const f of targets.flatMap(files)) {
  const src = readFileSync(f, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); // ブロックコメントを空白に（行番号は保つ）
  const hits = [];
  src.split('\n').forEach((line, i) => {
    if (/\/\/\s*i18n-ok\b/.test(line)) return;
    const code = line.replace(/(^|[^:'"`])\/\/.*$/, '$1'); // 行コメントを外す（URL の // は残す）
    if (JA.test(code)) hits.push(`${i + 1}: ${code.trim().slice(0, 100)}`);
  });
  if (hits.length) {
    total += hits.length;
    console.log(`\n${relative(root, f)} (${hits.length})`);
    hits.slice(0, 200).forEach((h) => console.log('  ' + h));
  }
}
console.log(`\n残り: ${total} 行`);
process.exit(total > 0 ? 1 : 0);
