// 翻訳の表（locales/*.csv）が網羅されているかの検査（2026-11-08）
// - 各表に空欄・重複が無い（空欄＝訳し忘れ）
// - コードで使っているキー（useTranslation('<名前空間>') の t('<key>'）、i18n.t('<名前空間>:<key>')）がすべて表にある
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseLocaleCsv } from '../i18n';

const LOCALES_DIR = __dirname;
const SRC_DIR = resolve(__dirname, '..');
const csvs = readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.csv'));

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|ts)$/.test(f) && !/\.test\.tsx?$/.test(f)) out.push(p);
  }
  return out;
}

const tables: Record<string, Set<string>> = {};
for (const f of csvs) {
  const { rows } = parseLocaleCsv(readFileSync(join(LOCALES_DIR, f), 'utf8'));
  tables[f.replace(/\.csv$/, '')] = new Set(rows.map((r) => r.key.trim()));
}

describe('翻訳の表（locales/*.csv）', () => {
  it.each(csvs)('%s: 列は key・ja・en・note、空欄と重複が無い', (f) => {
    const { languages, rows } = parseLocaleCsv(readFileSync(join(LOCALES_DIR, f), 'utf8'));
    expect(languages).toEqual(expect.arrayContaining(['ja', 'en']));
    const seen = new Set<string>();
    const problems: string[] = [];
    for (const r of rows) {
      const k = r.key.trim();
      if (seen.has(k)) problems.push(`重複: ${k}`);
      seen.add(k);
      for (const l of languages) if (!(r[l] ?? '').trim()) problems.push(`空欄: ${k} の ${l}`);
    }
    expect(problems).toEqual([]);
  });

  it('コードで使っているキーがすべて表にある', () => {
    const missing: string[] = [];
    for (const file of walk(SRC_DIR)) {
      // コメントは外して調べる（書き方の例を拾わないように）
      const src = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
      // そのファイルの useTranslation の名前空間（無ければ translation）
      const nsMatch = src.match(/useTranslation\(\s*'([^']+)'\s*\)/);
      const defaultNs = nsMatch ? nsMatch[1] : 'translation';
      // t('key') / t("key")。i18n.t('ns:key') と t('ns:key') は名前空間つき
      for (const m of src.matchAll(/(?<![\w.])(?:i18n\.)?t\(\s*'([^'$`]+)'/g)) {
        const raw = m[1];
        const [ns, key] = raw.includes(':') ? raw.split(/:(.+)/) : [defaultNs, raw];
        if (!tables[ns]?.has(key)) missing.push(`${file.replace(SRC_DIR, 'src')}: ${ns}:${key}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
