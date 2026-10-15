// ============================================================================
// changelog - 更新情報（正本は src/data/changelog.json）
// - アプリ内の「更新情報」ダイアログ、README の「最近の更新」、別サイトに載せる文面を
//   同じデータから作る。追記は changelog.json だけを直し、`npm run changelog` で README と
//   別サイト用の文面（docs/changelog/・git 管理外）を作り直し、個人サイト
//   （YukiInoueNakata.github.io の _data/temer_changelog.json・日英の詳細ページが読む）へ写す
// - 個人サイトの英語ページのため、各項目に英語（en.title・en.detail）を必ず書く。
//   アプリの画面は日本語だけなので、英文中のボタン名は「"接続点" (connection points)」のように日本語を添える
// - README との食い違いは changelog.test.ts が止める（CI で落ちる）
// - scripts/gen-changelog.mjs からも読むので、型注釈を消すだけで動く書き方に限る（enum 等は使わない）
// ============================================================================

export type ChangeKind = '新機能' | '改善' | '修正';

export interface ChangeItem {
  kind: ChangeKind;
  title: string;
  detail?: string;
  /** 個人サイトの英語ページ用 */
  en: { title: string; detail?: string };
}

export interface ChangelogEntry {
  /** YYYY-MM-DD（公開した日） */
  date: string;
  items: ChangeItem[];
}

export const README_START = '<!-- CHANGELOG:START -->';
export const README_END = '<!-- CHANGELOG:END -->';
/** README に載せる日数（それより前はアプリの「ヘルプ > 更新情報」で見られる） */
export const README_RECENT_DATES = 5;
export const APP_URL = 'https://yukiinouenakata.github.io/temerplus/';

/** 新しい日付が先頭に来るように並べる（JSON の並びに依存しない） */
export function sortEntries(entries: ChangelogEntry[]): ChangelogEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

/** データの形を確かめ、問題の一覧を返す（空なら問題なし） */
export function validateChangelog(entries: ChangelogEntry[]): string[] {
  const errors: string[] = [];
  const kinds = ['新機能', '改善', '修正'];
  const seen = new Set<string>();
  for (const e of entries) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) errors.push(`日付の形が違う: ${e.date}`);
    if (seen.has(e.date)) errors.push(`同じ日付が 2 回ある: ${e.date}`);
    seen.add(e.date);
    if (!e.items?.length) errors.push(`項目が無い: ${e.date}`);
    for (const it of e.items ?? []) {
      if (!kinds.includes(it.kind)) errors.push(`種類が違う（新機能・改善・修正のどれか）: ${e.date} ${it.kind}`);
      if (!it.title?.trim()) errors.push(`見出しが空: ${e.date}`);
      if (!it.en?.title?.trim()) errors.push(`英語の見出し（en.title）が無い: ${e.date} ${it.title}`);
      if (it.detail && !it.en?.detail?.trim()) errors.push(`英語の説明（en.detail）が無い: ${e.date} ${it.title}`);
    }
  }
  return errors;
}

const formatDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return `${y}年${m}月${day}日`;
};

/** README の「最近の更新」の節（マーカーの内側） */
export function renderReadmeSection(entries: ChangelogEntry[]): string {
  const recent = sortEntries(entries).slice(0, README_RECENT_DATES);
  const lines = ['## 最近の更新', ''];
  for (const e of recent) {
    lines.push(`### ${formatDate(e.date)}`, '');
    for (const it of e.items) {
      lines.push(`- **${it.kind}** ${it.title}${it.detail ? `: ${it.detail}` : ''}`);
    }
    lines.push('');
  }
  lines.push(`それより前の更新は、アプリ（${APP_URL}）の「ヘルプ」タブの「更新情報」で見られます。`);
  return lines.join('\n');
}

/** README の本文にある「最近の更新」の節を差し替える（マーカーが無ければ末尾に足す） */
export function replaceReadmeSection(readme: string, entries: ChangelogEntry[]): string {
  const block = `${README_START}\n${renderReadmeSection(entries)}\n${README_END}`;
  const s = readme.indexOf(README_START);
  const e = readme.indexOf(README_END);
  if (s >= 0 && e > s) return readme.slice(0, s) + block + readme.slice(e + README_END.length);
  return `${readme.trimEnd()}\n\n${block}\n`;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 別サイトに貼る HTML の断片（見出しから下だけ。CSS はサイト側に任せる） */
export function renderSiteHtml(entries: ChangelogEntry[], limit?: number): string {
  const list = sortEntries(entries).slice(0, limit ?? entries.length);
  const out = ['<section class="temer-changelog">', '  <h2>TEMer の更新情報</h2>'];
  for (const e of list) {
    out.push(`  <h3>${formatDate(e.date)}</h3>`, '  <ul>');
    for (const it of e.items) {
      const detail = it.detail ? `: ${escapeHtml(it.detail)}` : '';
      out.push(`    <li><strong>${it.kind}</strong> ${escapeHtml(it.title)}${detail}</li>`);
    }
    out.push('  </ul>');
  }
  out.push(`  <p><a href="${APP_URL}">TEMer を開く</a></p>`, '</section>');
  return out.join('\n');
}

/** 別サイトに貼る Markdown（WordPress・note などの Markdown 入力向け） */
export function renderSiteMarkdown(entries: ChangelogEntry[], limit?: number): string {
  const list = sortEntries(entries).slice(0, limit ?? entries.length);
  const lines = ['## TEMer の更新情報', ''];
  for (const e of list) {
    lines.push(`### ${formatDate(e.date)}`, '');
    for (const it of e.items) lines.push(`- **${it.kind}** ${it.title}${it.detail ? `: ${it.detail}` : ''}`);
    lines.push('');
  }
  lines.push(`[TEMer を開く](${APP_URL})`);
  return lines.join('\n');
}

/** アプリで「新しい更新あり」を出すために覚えておく、最後に見た更新の日付 */
export const CHANGELOG_SEEN_KEY = 'temer.changelog.lastSeen';

export function hasUnseen(entries: ChangelogEntry[], lastSeen: string | null): boolean {
  const latest = sortEntries(entries)[0]?.date;
  return !!latest && (!lastSeen || latest > lastSeen);
}
