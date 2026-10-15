// 更新情報（src/data/changelog.json）の形と、README の「最近の更新」が JSON と食い違っていないこと
// README を作り直し忘れたら `cd webApp && npm run changelog` で直す
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import data from '../data/changelog.json';
import {
  validateChangelog, replaceReadmeSection, renderSiteHtml, hasUnseen, sortEntries,
  README_START, README_END, type ChangelogEntry,
} from './changelog';

const entries = data as ChangelogEntry[];

describe('更新情報', () => {
  it('changelog.json の形が正しい', () => {
    expect(validateChangelog(entries)).toEqual([]);
  });

  it('README の「最近の更新」が changelog.json と一致する（npm run changelog で作り直す）', () => {
    const readme = readFileSync(resolve(__dirname, '../../../README.md'), 'utf8');
    expect(readme).toContain(README_START);
    expect(replaceReadmeSection(readme, entries)).toBe(readme);
  });

  it('README の節を差し替えても前後の文章は残る', () => {
    const before = `前文\n\n${README_START}\n古い内容\n${README_END}\n\n後文\n`;
    const after = replaceReadmeSection(before, entries);
    expect(after.startsWith('前文\n\n')).toBe(true);
    expect(after.endsWith('\n\n後文\n')).toBe(true);
    expect(after).not.toContain('古い内容');
  });

  it('別サイト用の HTML は文字をエスケープする', () => {
    const html = renderSiteHtml([{ date: '2026-01-01', items: [{ kind: '修正', title: '<b>&', detail: '"x"' }] }]);
    expect(html).toContain('&lt;b&gt;&amp;');
    expect(html).toContain('&quot;x&quot;');
  });

  it('前回見た日付より新しい更新があれば「新」', () => {
    const latest = sortEntries(entries)[0].date;
    expect(hasUnseen(entries, null)).toBe(true);
    expect(hasUnseen(entries, latest)).toBe(false);
    expect(hasUnseen(entries, '2000-01-01')).toBe(true);
  });
});
