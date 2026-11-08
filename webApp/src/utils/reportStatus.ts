// ============================================================================
// reportStatus - 論文用レポートの出力前の確認（論文 04_report_format.md 4 節）
// - 項目ごとの入力状況を「済／未／一部（例: Box の説明 10 件中 8 件）」で示す
// - 図にあるメモ・記号・コメントを論文用レポートに載せるかを選ばせる（2026-10-30 ユーザー指示）
// 強制はしない。「記入しない」まま出力することもできる
// ============================================================================

import i18n from '../i18n';
import type { Note, TEMDocument } from '../types';
import { NOTE_SYMBOLS } from './noteStyle';
import { VISUAL_CONVENTION_ITEMS, conventionItemLabel, resolveConventionMeaning } from './visualConventions';

export type ReportItemState = 'done' | 'partial' | 'missing';
/** 「記入を続ける」で開くタブ */
export type ReportTab = 'general' | 'notation' | 'participants' | 'interview' | 'visual' | 'export';

export interface ReportStatusItem {
  key: string;
  label: string;
  state: ReportItemState;
  /** 一部のときの内訳など */
  detail?: string;
  /** 入力する場所（タブ）。要素の説明はプロパティパネルで書くので無し */
  tab?: ReportTab;
}

/** メモを論文用レポートの「注記」にどう載せるか */
export type ReportNotesChoice = 'all' | 'flagged' | 'none';

export interface ReportContentChoices {
  notes?: ReportNotesChoice;
  /** 記号を図に残し、意味を Block 1（記号の宣言）に書く */
  symbols?: boolean;
  /** コメントを「コメント」の節に載せる */
  comments?: boolean;
}

const filled = (s?: string) => !!s && s.trim().length > 0;

const isSymbolNote = (n: Note) => n.style === 'text';

/** 記号メモの「記号」（先頭が記号パレットの文字ならその 1 文字、そうでなければ本文） */
export function symbolKeyOf(n: Note): string {
  const t = (n.text ?? '').trim();
  const head = Array.from(t)[0];
  return head && NOTE_SYMBOLS.includes(head) ? head : t;
}

/** 文書の中で使っている記号（重複なし・出てきた順） */
export function usedSymbols(doc: TEMDocument): string[] {
  const out: string[] = [];
  for (const sh of doc.sheets) {
    for (const n of sh.notes ?? []) {
      if (!isSymbolNote(n)) continue;
      const k = symbolKeyOf(n);
      if (k && !out.includes(k)) out.push(k);
    }
  }
  return out;
}

function countState(label: string, total: number, done: number, key: string): ReportStatusItem | null {
  if (total === 0) return null;
  const state: ReportItemState = done === total ? 'done' : done === 0 ? 'missing' : 'partial';
  return { key, label, state, detail: state === 'partial' ? i18n.t('reportStatus:count.partial', { total, done }) : i18n.t('reportStatus:count.all', { total }) };
}

/** 図にあるメモ・記号・コメントの件数 */
export function reportContentCounts(doc: TEMDocument) {
  let notes = 0;
  let flaggedNotes = 0;
  let symbols = 0;
  let comments = 0;
  for (const sh of doc.sheets) {
    for (const n of sh.notes ?? []) {
      if (isSymbolNote(n)) symbols++;
      else if (filled(n.text)) {
        notes++;
        if (n.includeInReport) flaggedNotes++;
      }
    }
    comments += sh.comments?.length ?? 0;
  }
  return { notes, flaggedNotes, symbols, comments };
}

/** 選ばないと出力できない項目（図にあるものだけ）の表示名（画面の言語） */
export function missingReportChoices(doc: TEMDocument, choices: ReportContentChoices): string[] {
  const c = reportContentCounts(doc);
  const out: string[] = [];
  if (c.notes > 0 && !choices.notes) out.push(i18n.t('reportStatus:choice.notes'));
  if (c.symbols > 0 && choices.symbols === undefined) out.push(i18n.t('reportStatus:choice.symbols'));
  if (c.comments > 0 && choices.comments === undefined) out.push(i18n.t('reportStatus:choice.comments'));
  return out;
}

/** 項目ごとの入力状況（label・detail は画面の言語） */
export function computeReportStatus(doc: TEMDocument, choices: ReportContentChoices = {}): ReportStatusItem[] {
  const m = doc.metadata;
  const items: ReportStatusItem[] = [];

  // Block 1 記号体系
  const ns = m.notationSystem;
  items.push({
    key: 'notation', label: i18n.t('reportStatus:item.notation'), tab: 'notation',
    state: !ns ? 'missing' : ns.base !== 'Arakawa2012' && !filled(ns.customDescription) ? 'partial' : 'done',
    detail: ns && ns.base !== 'Arakawa2012' && !filled(ns.customDescription) ? i18n.t('reportStatus:detail.notation.customEmpty') : undefined,
  });
  // 記号の意味（記号を載せると選んだときだけ）
  if (choices.symbols) {
    const syms = usedSymbols(doc);
    const meant = syms.filter((s) => filled(m.symbolMeanings?.[s])).length;
    const it = countState(i18n.t('reportStatus:item.symbolMeanings'), syms.length, meant, 'symbolMeanings');
    if (it) items.push({ ...it, tab: 'notation' });
  }

  // Block 2 協力者
  const pi = m.participantsInfo;
  const piParts = [!!pi && pi.count > 0, filled(pi?.description)];
  items.push({
    key: 'participants', label: i18n.t('reportStatus:item.participants'), tab: 'participants',
    state: piParts.every(Boolean) ? 'done' : piParts.some(Boolean) ? 'partial' : 'missing',
    detail: piParts.some(Boolean) && !piParts.every(Boolean) ? (piParts[0] ? i18n.t('reportStatus:detail.participants.descriptionEmpty') : i18n.t('reportStatus:detail.participants.countZero')) : undefined,
  });

  // Block 3 インタビュー
  const iv = m.interview;
  const ivAny = filled(iv?.method) || filled(iv?.durationDescription) || (iv?.timesCount ?? 0) > 0;
  items.push({
    key: 'interview', label: i18n.t('reportStatus:item.interview'), tab: 'interview',
    state: filled(iv?.method) ? 'done' : ivAny ? 'partial' : 'missing',
    detail: !filled(iv?.method) && ivAny ? i18n.t('reportStatus:detail.interview.methodEmpty') : undefined,
  });

  // Block 4 表記方針（項目ごと）
  for (const it of VISUAL_CONVENTION_ITEMS) {
    const ent = m.visualConventions?.[it.key];
    const meaning = ent ? resolveConventionMeaning(ent) : undefined;
    const needsDesc = meaning === 'yes' || meaning === 'loose';
    items.push({
      key: `visual.${it.key}`, label: i18n.t('reportStatus:item.visual', { label: conventionItemLabel(it.key) }), tab: 'visual',
      state: !ent ? 'missing' : needsDesc && !filled(ent.description) ? 'partial' : 'done',
      detail: ent && needsDesc && !filled(ent.description) ? i18n.t('reportStatus:detail.visual.descriptionEmpty') : undefined,
    });
  }

  // Block 5 要素の説明（説明か「説明不要」があれば済）
  const described = (x: { description?: string; noDescriptionNeeded?: boolean }) => filled(x.description) || !!x.noDescriptionNeeded;
  const boxes = doc.sheets.flatMap((s) => s.boxes);
  const lines = doc.sheets.flatMap((s) => s.lines);
  const sdsg = doc.sheets.flatMap((s) => s.sdsg);
  for (const it of [
    countState(i18n.t('reportStatus:item.descBox'), boxes.length, boxes.filter(described).length, 'desc.box'),
    countState(i18n.t('reportStatus:item.descLine'), lines.length, lines.filter(described).length, 'desc.line'),
    countState(i18n.t('reportStatus:item.descSdsg'), sdsg.length, sdsg.filter(described).length, 'desc.sdsg'),
  ]) if (it) items.push(it);

  return items;
}

/** 入力状況の表示名（済／一部／未。画面の言語） */
export function reportStateLabel(state: ReportItemState): string {
  return i18n.t(`reportStatus:state.${state}`);
}
