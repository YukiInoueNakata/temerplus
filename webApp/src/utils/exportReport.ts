// ============================================================================
// 論文用レポート出力（.docx）
// - 方法相当: 記号体系 / 協力者情報 / インタビュー / 表記方針
// - TEM 図（キャンバスを PNG 化して埋込）
// - 結果: シートごとに 時期区分 / Box (種別ごと) / 径路 / SD / SG を漏れなくリスト
// - 用語凡例
// - 本文は図の言語（doc.settings.locale。凡例と同じ）で書く。文言は翻訳の表 locales/exportReport.csv
// ============================================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
} from 'docx';
import { toPng } from 'html-to-image';
import i18n from '../i18n';
import { conventionItemLabel, resolveConventionMeaning, VISUAL_CONVENTION_ITEMS } from './visualConventions';
import { boxHasType } from './typeDisplay';
import { buildFilter } from './exportImage';
import { NOTE_MEMO_CLASS, NOTE_SYMBOL_CLASS, NOTE_UNFLAGGED_CLASS } from './noteStyle';
import { usedSymbols, type ReportContentChoices } from './reportStatus';
import { describeNotation } from './notationDescribe';
import type {
  TEMDocument,
  Sheet,
  Box,
  Line,
  SDSG,
  PeriodLabel,
  BoxType,
  LayoutDirection,
  SourceRef,
  Transcript,
  VisualConventionEntry,
} from '../types';
import { DEFAULT_LABEL_STYLE, type LabelStyle } from './labelStyle';

export interface PaperReportOptions {
  filename?: string;
  diagramElementId?: string;
  includeDiagram: boolean;
  includeSourceRefs?: boolean;     // 原文引用を結果セクションに含める (既定 true)
  /**
   * 引用の表記スタイル:
   *   'bracket' (既定): [原文 T1 §4]「指導教員と...」 / 英語 [Source T1 §4] "..."
   *   'apa':           （A, 第1回, §4）「指導教員と...」 / 英語 (A, session 1, §4) "..."
   *                     APA 風の括弧引用。協力者 + 回 + 段落番号
   */
  sourceRefStyle?: 'bracket' | 'apa';
  /**
   * 未入力の項目を出力に含めないか（既定 true＝論文 04_report_format.md 4 節のとおり含めない）。
   * false なら「（未入力）」「（説明未記入）」（英語は (not entered) など）と書いて含める（Word で清書するときに抜けが分かる）
   */
  omitMissing?: boolean;
  /** 図にあるメモ・記号・コメントをどう載せるか（出力前の確認画面で選ぶ）。未指定はメモ＝「載せる」にしたものだけ */
  content?: ReportContentChoices;
  /**
   * 結果の節で、図の要素のラベルを括る括弧と書く順（2026-11-10 ユーザー要望。TEM 論文 68 本の調べ
   * docs/surveys/2026-11-10_box-notation）。未指定は今までどおり（日本語〈…〉・英語⟨…⟩、ID が先）
   */
  labelStyle?: Partial<LabelStyle>;
}

export { LABEL_BRACKETS, DEFAULT_LABEL_STYLE, type LabelBracket, type LabelOrder, type LabelStyle } from './labelStyle';

// ----------------------------------------------------------------------------
// 小さなヘルパ
// ----------------------------------------------------------------------------

/** 図の言語で引く翻訳（buildPaperReportParagraphs で作って各ヘルパに渡す）。キーは 'exportReport:<key>' */
type Tr = ((key: string, opts?: Record<string, unknown>) => string) & { labelStyle?: LabelStyle; lng?: string };

function makeTr(lng: string, labelStyle?: Partial<LabelStyle>): Tr {
  const f = ((key: string, opts?: Record<string, unknown>) => i18n.t(key, { ...opts, lng })) as Tr;
  f.labelStyle = { ...DEFAULT_LABEL_STYLE, ...(labelStyle ?? {}) };
  f.lng = lng;
  return f;
}

/** 事象・経験のラベルを括る（既定は日本語〈…〉・英語⟨…⟩。labelStyle で括弧を選べる） */
function wrapLabel(t: Tr, label: string, kind: 'box' | 'sdsg' = 'box'): string {
  const b = (kind === 'sdsg' ? t.labelStyle?.sdsg : t.labelStyle?.box) ?? 'auto';
  if (b === 'auto') return t('exportReport:label.wrap', { label });
  return `${b[0]}${label}${b[1]}`;
}

/**
 * ID（記号）とラベルを並べる。'id-first' は「BFP1 〈…〉」（spaced）／「BFP1〈…〉」、
 * 'label-first' は「〈…〉（BFP1）」（英語は「⟨…⟩ (BFP1)」）
 */
function idLabel(t: Tr, id: string, label: string, kind: 'box' | 'sdsg', o: { sub?: string; spaced?: boolean } = {}): string {
  const w = wrapLabel(t, label, kind);
  const sub = o.sub ?? '';
  if (t.labelStyle?.order === 'label-first') {
    return (t.lng ?? 'ja').startsWith('ja') ? `${w}（${id}${sub}）` : `${w} (${id}${sub})`;
  }
  return o.spaced ? `${id}${sub} ${w}` : `${id}${w}`;
}

function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]): Paragraph {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true })],
  });
}

function para(text: string, opts?: { bold?: boolean; italic?: boolean }): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold, italics: opts?.italic })],
  });
}

// 中黒つきの bullet 段落（docx 標準の bullet を使わず素朴に "・" でリスト化）
// Word 側で箇条書きスタイルに変換しやすく、表記が確定的になる
function bullet(t: Tr, text: string, indent = 0): Paragraph {
  const prefix = indent > 0 ? '    '.repeat(indent) : '';
  return new Paragraph({
    children: [new TextRun({ text: `${prefix}${t('exportReport:bullet')}${text}` })],
  });
}

async function fetchPngBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

// ----------------------------------------------------------------------------
// 種別ラベル
// ----------------------------------------------------------------------------

/** 結果の節の Box の種別の見出し（図の言語） */
function boxTypeHeading(t: Tr, type: BoxType): string {
  return t(`exportReport:boxType.${type}`);
}

// 列挙順（読み手に望ましい順番: EFP 系を先に、normal/annotation を最後に）
const BOX_TYPE_ORDER: BoxType[] = [
  'OPP',
  'BFP',
  'EFP',
  'P-EFP',
  '2nd-EFP',
  'P-2nd-EFP',
  'normal',
  'annotation',
  'other',
];

// ----------------------------------------------------------------------------
// 各種フォーマッタ
// ----------------------------------------------------------------------------

// omit: 未入力を書かない。以前はモジュール変数で持ち、2 つのレポートを同時に作ると混ざった（レビュー #8）
function descSuffix(t: Tr, omit: boolean, description?: string, noDescriptionNeeded?: boolean): string {
  if (description && description.trim()) return t('exportReport:desc.text', { text: description.trim() });
  if (noDescriptionNeeded) return omit ? '' : t('exportReport:desc.notNeeded');
  return omit ? '' : t('exportReport:desc.missing');
}

/**
 * 論文用レポートに埋め込む図の画像から除くもの（載せないと選んだメモ・記号）。
 * 「載せるにしたものだけ」（flagged）では、載せるの印の無いメモも除く（以前は none のときしか除かず、
 * 載せないメモが図に残った。レビュー #1）
 */
export function reportFigureFilter(
  content: ReportContentChoices,
  base: (node: HTMLElement) => boolean = () => true,
): (node: HTMLElement) => boolean {
  const notes = content.notes ?? 'flagged';
  const hideSymbol = content.symbols === false;
  return (node: HTMLElement) => {
    if (!base(node)) return false;
    const cl = (node as Element).classList;
    if (!cl) return true;
    if (notes === 'none' && cl.contains(NOTE_MEMO_CLASS)) return false;
    if (notes === 'flagged' && cl.contains(NOTE_UNFLAGGED_CLASS)) return false;
    if (hideSymbol && cl.contains(NOTE_SYMBOL_CLASS)) return false;
    return true;
  };
}

// 原文引用を 1 行で要約。スタイルは bracket / apa を切替可能
function sourceRefSuffix(
  t: Tr,
  refs: SourceRef[] | undefined,
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  style: 'bracket' | 'apa',
): string {
  if (!refs || refs.length === 0) return '';
  const parts = refs.map((r, i) => {
    const tr = transcripts.find((x) => x.id === r.transcriptId);
    const para = tr?.paragraphs.find((p) => p.id === r.paragraphId);
    const paraIdx = para ? `§${para.index + 1}` : '';
    const quote = (r.quoteText ?? '').trim();
    const quoteShort = quote.length > 60 ? quote.slice(0, 60) + '...' : quote;
    const unres = r.unresolved ? t('exportReport:ref.unresolved') : '';

    if (style === 'apa') {
      // 協力者 (pseudonym) + 第N回 + §段落
      const unknown = t('exportReport:ref.unknownParticipant');
      const pseudo = tr?.participantId ? (participantsLookup.get(tr.participantId) ?? unknown) : unknown;
      const session = tr?.sessionNumber !== undefined ? t('exportReport:ref.session', { n: tr.sessionNumber }) : '';
      const cite = [pseudo, session, paraIdx].filter(Boolean).join(', ');
      return t('exportReport:ref.apa', { cite, quote: quoteShort, unresolved: unres });
    } else {
      const tLabel = tr ? (tr.title.length > 20 ? `T${i + 1}` : tr.title) : `T?`;
      return t('exportReport:ref.bracket', { transcript: tLabel, paragraph: paraIdx, quote: quoteShort, unresolved: unres });
    }
  });
  return '  ' + parts.join(' ');
}

function formatPeriodLabels(
  t: Tr,
  labels: PeriodLabel[],
  layout: LayoutDirection,
): Paragraph[] {
  if (labels.length === 0) return [];
  const out: Paragraph[] = [];
  out.push(heading(t('exportReport:heading.periods'), HeadingLevel.HEADING_3));
  const sorted = [...labels].sort((a, b) => a.position - b.position);
  const axisLabel = layout === 'horizontal' ? 'Time level' : 'Time level';
  sorted.forEach((p, i) => {
    const lab = (p.label && p.label.trim()) ? p.label.trim() : t('exportReport:noLabel');
    out.push(bullet(t, t('exportReport:period.item', { n: i + 1, label: wrapLabel(t, lab), axis: axisLabel, position: p.position })));
  });
  out.push(para(''));
  return out;
}

function formatBoxesByType(
  t: Tr,
  boxes: Box[],
  type: BoxType,
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
  omit: boolean,
): Paragraph[] {
  // 併記種別を持つ Box は両方の見出しに載せる（主種別でない側には併記であることを添える）
  const subset = boxes.filter((b) => boxHasType(b, type));
  if (subset.length === 0) return [];
  const out: Paragraph[] = [];
  out.push(heading(boxTypeHeading(t, type), HeadingLevel.HEADING_3));
  subset.forEach((b) => {
    const lab = (b.label && b.label.trim()) ? b.label.trim() : t('exportReport:noLabel');
    const sub = b.subLabel && b.subLabel.trim() ? ` [${b.subLabel.trim()}]` : '';
    const refSfx = includeRefs ? sourceRefSuffix(t, b.sourceRefs, transcripts, participantsLookup, style) : '';
    // 種別「その他」は利用者が付けた種別ラベルを添える
    const custom = type === 'other' && (b.customTypeLabel ?? '').trim()
      ? t('exportReport:box.customType', { type: (b.customTypeLabel ?? '').trim() }) : '';
    // この見出しが併記種別側なら、主種別を添える
    const asSecondary = b.type !== type
      ? t('exportReport:box.asSecondary', { type: boxTypeHeading(t, b.type) }) : '';
    out.push(bullet(t, `${idLabel(t, b.id, lab, 'box', { sub, spaced: true })}${custom}${asSecondary}${descSuffix(t, omit, b.description, b.noDescriptionNeeded)}${refSfx}`));
  });
  out.push(para(''));
  return out;
}

function lineTypeLabel(t: Tr, type: Line['type']): string {
  if (type === 'RLine') return t('exportReport:lineType.RLine');
  if (type === 'XLine') return t('exportReport:lineType.XLine');
  return String(type);
}

function formatLines(
  t: Tr,
  lines: Line[],
  boxes: Box[],
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
  omit: boolean,
): Paragraph[] {
  if (lines.length === 0) return [];
  const out: Paragraph[] = [];
  out.push(heading(t('exportReport:heading.lines'), HeadingLevel.HEADING_3));

  const labelOf = (id: string): string => {
    const b = boxes.find((x) => x.id === id);
    if (!b) return id;
    const txt = (b.label && b.label.trim()) ? b.label.trim() : t('exportReport:noLabel');
    return idLabel(t, b.id, txt, 'box');
  };

  const groups: Array<{ type: Line['type']; items: Line[] }> = [
    { type: 'RLine', items: lines.filter((l) => l.type === 'RLine') },
    { type: 'XLine', items: lines.filter((l) => l.type === 'XLine') },
  ];

  for (const g of groups) {
    if (g.items.length === 0) continue;
    out.push(bullet(t, lineTypeLabel(t, g.type)));
    g.items.forEach((l) => {
      const labelPart = l.label && l.label.trim() ? ` ${wrapLabel(t, l.label.trim())}` : '';
      const refSfx = includeRefs ? sourceRefSuffix(t, l.sourceRefs, transcripts, participantsLookup, style) : '';
      out.push(bullet(t, `${l.id}${labelPart}: ${labelOf(l.from)} → ${labelOf(l.to)}${descSuffix(t, omit, l.description, l.noDescriptionNeeded)}${refSfx}`, 1));
    });
  }
  out.push(para(''));
  return out;
}

function sdsgTypeLabel(t: Tr, type: SDSG['type']): string {
  return type === 'SD'
    ? t('exportReport:sdsg.SD')
    : t('exportReport:sdsg.SG');
}

function formatSdsg(
  t: Tr,
  sdsgs: SDSG[],
  boxes: Box[],
  lines: Line[],
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
  omit: boolean,
): Paragraph[] {
  if (sdsgs.length === 0) return [];
  const out: Paragraph[] = [];

  const attachedLabel = (s: SDSG): string => {
    const refOf = (id: string, kind: 'box' | 'line'): string => {
      if (kind === 'box') {
        const b = boxes.find((x) => x.id === id);
        if (!b) return id;
        const txt = (b.label && b.label.trim()) ? b.label.trim() : t('exportReport:noLabel');
        return idLabel(t, b.id, txt, 'box');
      } else {
        const l = lines.find((x) => x.id === id);
        if (!l) return id;
        return `${l.id}`;
      }
    };
    const a1 = refOf(s.attachedTo, s.attachedType);
    if (s.anchorMode === 'between' && s.attachedTo2 && s.attachedType2) {
      const a2 = refOf(s.attachedTo2, s.attachedType2);
      return t('exportReport:sdsg.between', { a: a1, b: a2 });
    }
    return a1;
  };

  for (const type of ['SD', 'SG'] as const) {
    const subset = sdsgs.filter((s) => s.type === type);
    if (subset.length === 0) continue;
    out.push(heading(sdsgTypeLabel(t, type), HeadingLevel.HEADING_3));
    subset.forEach((s) => {
      const lab = (s.label && s.label.trim()) ? s.label.trim() : t('exportReport:noLabel');
      const sub = s.subLabel && s.subLabel.trim() ? ` [${s.subLabel.trim()}]` : '';
      const refSfx = includeRefs ? sourceRefSuffix(t, s.sourceRefs, transcripts, participantsLookup, style) : '';
      out.push(bullet(t, `${idLabel(t, s.id, lab, 'sdsg', { sub, spaced: true })}${t('exportReport:sdsg.target', { target: attachedLabel(s) })}${descSuffix(t, omit, s.description, s.noDescriptionNeeded)}${refSfx}`));
    });
    out.push(para(''));
  }
  return out;
}

// ----------------------------------------------------------------------------
// シート単位の「結果」セクション
// ----------------------------------------------------------------------------

function buildSheetResults(
  t: Tr,
  sheet: Sheet,
  layout: LayoutDirection,
  multiSheet: boolean,
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
  content: ReportContentChoices,
  omit: boolean,
): Paragraph[] {
  const out: Paragraph[] = [];
  if (multiSheet) {
    out.push(heading(t('exportReport:sheet.heading', { name: sheet.name }), HeadingLevel.HEADING_2));
  }

  // カウンタ
  out.push(para(t('exportReport:sheet.summary', {
    boxes: sheet.boxes.length, lines: sheet.lines.length, sdsg: sheet.sdsg.length, periods: sheet.periodLabels.length,
  })));
  out.push(para(''));

  // 時期区分（先頭）
  out.push(...formatPeriodLabels(t, sheet.periodLabels, layout));

  // Box 種別ごと
  for (const type of BOX_TYPE_ORDER) {
    out.push(...formatBoxesByType(t, sheet.boxes, type, transcripts, participantsLookup, includeRefs, style, omit));
  }

  // 径路
  out.push(...formatLines(t, sheet.lines, sheet.boxes, transcripts, participantsLookup, includeRefs, style, omit));

  // SD / SG
  out.push(...formatSdsg(t, sheet.sdsg, sheet.boxes, sheet.lines, transcripts, participantsLookup, includeRefs, style, omit));

  // 図上のメモ（記号＝文字だけのメモは除く）。確認画面の選択: すべて／「載せる」にしたものだけ／載せない
  const notesChoice = content.notes ?? 'flagged';
  const reportNotes = notesChoice === 'none' ? [] : (sheet.notes ?? []).filter((n) =>
    n.style !== 'text' && (n.text ?? '').trim() && (notesChoice === 'all' || n.includeInReport));
  if (reportNotes.length > 0) {
    out.push(heading(t('exportReport:heading.notes'), HeadingLevel.HEADING_3));
    reportNotes.forEach((n) => {
      const target = n.showLeader && n.leaderTo ? t('exportReport:note.target', { target: n.leaderTo }) : '';
      out.push(bullet(t, `${n.id}${target} ${n.text.trim().replace(/\s*\n\s*/g, ' ')}`));
    });
    out.push(para(''));
  }

  // コメント（確認画面で「載せる」を選んだときだけ）
  if (content.comments && (sheet.comments?.length ?? 0) > 0) {
    out.push(heading(t('exportReport:heading.comments'), HeadingLevel.HEADING_3));
    const nameOf = (id: string) => {
      const b = sheet.boxes.find((x) => x.id === id);
      if (b) return idLabel(t, b.id, (b.label ?? '').trim() || t('exportReport:noLabel'), 'box');
      return id;
    };
    const oneLine = (s: string) => s.trim().replace(/\s*\n\s*/g, ' ');
    sheet.comments.forEach((c) => {
      const st = c.resolved ? t('exportReport:comment.resolved') : '';
      out.push(bullet(t, `${nameOf(c.targetId)}: ${oneLine(c.text)}${st}`));
      (c.replies ?? []).forEach((r) => out.push(bullet(t, t('exportReport:comment.reply', { text: oneLine(r.text) }), 1)));
    });
    out.push(para(''));
  }

  return out;
}

// ----------------------------------------------------------------------------
// 用語凡例
// ----------------------------------------------------------------------------

/** 用語凡例の行（並び順） */
const GLOSSARY_KEYS = ['OPP', 'BFP', 'EFP', 'P-EFP', '2nd-EFP', 'P-2nd-EFP', 'SD', 'SG', 'RLine', 'XLine', 'timeArrow'] as const;

function buildGlossary(t: Tr, sectionTitle: string): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(heading(sectionTitle, HeadingLevel.HEADING_1));
  out.push(para(t('exportReport:glossary.intro')));
  for (const k of GLOSSARY_KEYS) {
    out.push(bullet(t, t(`exportReport:glossary.${k}`)));
  }
  out.push(para(''));
  return out;
}

// ----------------------------------------------------------------------------
// 結果セクション全体（複数シート対応）
// ----------------------------------------------------------------------------

function buildResultsSection(
  t: Tr,
  doc: TEMDocument,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
  content: ReportContentChoices,
  sectionTitle: string,
  omit: boolean,
): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(heading(sectionTitle, HeadingLevel.HEADING_1));

  // 協力者 ID → pseudonym のマップ（APA 引用用）
  const participantsLookup = new Map<string, string>();
  for (const p of doc.participants) {
    participantsLookup.set(p.id, p.pseudonym ?? p.id);
  }

  // テンプレート文（編集前提のドラフト）
  out.push(para(t('exportReport:results.intro')));
  out.push(para(t('exportReport:results.listing', { bracket: wrapLabel(t, '…', 'box') })));
  // SD・SG を Box と別の括弧で括るときは、そのことも書く
  if (wrapLabel(t, '…', 'sdsg') !== wrapLabel(t, '…', 'box')) {   // 選択肢の名前でなく、実際の括弧で比べる
    out.push(para(t('exportReport:results.listing.sdsg', { bracket: wrapLabel(t, '…', 'sdsg') })));
  }
  if (includeRefs && doc.transcripts.length > 0) {
    if (style === 'apa') {
      out.push(para(t('exportReport:results.refs.apa')));
    } else {
      out.push(para(t('exportReport:results.refs.bracket')));
    }
  }
  out.push(para(''));

  const multiSheet = doc.sheets.length > 1;
  for (const sheet of doc.sheets) {
    out.push(...buildSheetResults(t, sheet, doc.settings.layout, multiSheet, doc.transcripts, participantsLookup, includeRefs, style, content, omit));
  }
  return out;
}

// ----------------------------------------------------------------------------
// メイン
// ----------------------------------------------------------------------------

/** レポートの段落を組み立てる（ダウンロードはしない。テストからも呼ぶ） */
export async function buildPaperReportParagraphs(
  doc: TEMDocument,
  opts: PaperReportOptions,
): Promise<Paragraph[]> {
  const children: Paragraph[] = [];
  // 本文は図の言語（凡例と同じ doc.settings.locale）。画面の言語ではない
  const lng = doc.settings.locale ?? 'ja';
  const t = makeTr(lng, opts.labelStyle);

  // タイトル
  children.push(new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: doc.metadata.title || t('exportReport:title.default'), bold: true })],
  }));
  if (doc.metadata.author) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: doc.metadata.author })],
    }));
  }
  children.push(para(''));

  const omit = opts.omitMissing !== false;
  const content = opts.content ?? {};
  // 節の番号は出力する節だけで振る（未入力の節を省いても番号が飛ばないように）
  let secNo = 0;
  const section = (title: string) => children.push(heading(`${++secNo}. ${title}`, HeadingLevel.HEADING_1));
  const missingPara = () => children.push(para(t('exportReport:notEntered'), { italic: true }));

  // 1. 記号体系（Block 1）
  const ns = doc.metadata.notationSystem;
  const symbols = content.symbols ? usedSymbols(doc) : [];
  const symbolMeanings = doc.metadata.symbolMeanings ?? {};
  const symbolLines = symbols
    .map((sym) => ({ sym, meaning: (symbolMeanings[sym] ?? '').trim() }))
    .filter((x) => x.meaning || !omit);
  // 各要素の線種と線種が表す意味は、今の図の実際の線種から書く（設定画面のテーマで選んだ表記がそのまま出る）
  const notation = describeNotation(doc);
  if (ns || notation || symbolLines.length > 0 || !omit) {
    section(t('exportReport:section.notation'));
    if (ns) {
      // 「準拠」ではなく「参照」と書く（荒川ら 2012 は自らの手順を標準ではないとしている。論文 Block 1）
      children.push(para(
        ns.base === 'Arakawa2012'
          ? t('exportReport:notation.arakawa')
          : ns.base === 'custom'
            ? t('exportReport:notation.custom')
            : t('exportReport:notation.other')
      ));
      if (ns.customDescription) children.push(para(ns.customDescription));
    } else if (!omit) {
      missingPara();
    }
    if (notation) {
      children.push(para(notation.meaning));
      children.push(para(t('exportReport:notation.lines')));
      notation.lines.forEach((l) => children.push(bullet(t, l)));
    }
    if (symbolLines.length > 0) {
      children.push(para(t('exportReport:notation.symbols')));
      symbolLines.forEach((x) => children.push(bullet(t, `${x.sym}: ${x.meaning || t('exportReport:notation.symbolNoMeaning')}`)));
    }
    children.push(para(''));
  }

  // 2. 協力者情報（Block 2）
  const pi = doc.metadata.participantsInfo;
  const piLines: string[] = [];
  if (pi) {
    if (pi.count > 0) piLines.push(t('exportReport:participants.count', { count: pi.count }));
    if (pi.description) piLines.push(t('exportReport:participants.description', { text: pi.description }));
    if (pi.hsiDescription) piLines.push(t('exportReport:participants.hsi', { text: pi.hsiDescription }));
    if (pi.pseudonyms && pi.pseudonyms.length) piLines.push(t('exportReport:participants.pseudonyms', { names: pi.pseudonyms.join(', ') }));
  }
  if (piLines.length > 0 || !omit) {
    section(t('exportReport:section.participants'));
    if (piLines.length > 0) piLines.forEach((line) => children.push(para(line)));
    else missingPara();
    children.push(para(''));
  }

  // 3. インタビュー（Block 3）
  const iv = doc.metadata.interview;
  const ivLines: string[] = [];
  if (iv) {
    if (iv.method) ivLines.push(t('exportReport:interview.method', { text: iv.method }));
    if (iv.durationDescription) ivLines.push(t('exportReport:interview.duration', { text: iv.durationDescription }));
    if (iv.timesCount > 0) ivLines.push(t('exportReport:interview.times', { count: iv.timesCount }));
    if (iv.analysisCombination) ivLines.push(t('exportReport:interview.analysis', { text: iv.analysisCombination }));
    if (iv.notes) ivLines.push(t('exportReport:interview.notes', { text: iv.notes }));
  }
  if (ivLines.length > 0 || !omit) {
    section(t('exportReport:section.interview'));
    if (ivLines.length > 0) ivLines.forEach((line) => children.push(para(line)));
    else missingPara();
    children.push(para(''));
  }

  // 4. 表記方針（Block 4・論文の表の順・11 項目）
  const vc = doc.metadata.visualConventions;
  const convLines: string[] = [];
  for (const it of VISUAL_CONVENTION_ITEMS) {
    const ent: VisualConventionEntry | undefined = vc?.[it.key];
    const label = conventionItemLabel(it.key, lng);
    if (!ent) {
      if (!omit) convLines.push(t('exportReport:convention.notEntered', { label }));
      continue;
    }
    const meaning = resolveConventionMeaning(ent);
    const desc = (ent.description ?? '').trim();
    const descOrMissing = desc || (omit ? '' : t('exportReport:convention.noDescription'));
    // 説明が無いとき英語の文末に空白が残るので落とす（日本語は元から空白で終わらない）
    convLines.push((
      meaning === 'yes'   ? t('exportReport:convention.yes', { label, description: descOrMissing }) :
      meaning === 'loose' ? t('exportReport:convention.loose', { label, description: descOrMissing }) :
                            t('exportReport:convention.no', { label })
    ).trimEnd());
  }
  vc?.other?.forEach((o) => convLines.push(`${o.aspect}: ${o.description}`));
  if (convLines.length > 0 || doc.metadata.reportNotes || !omit) {
    section(t('exportReport:section.visual'));
    convLines.forEach((line) => children.push(para(line)));
    if (doc.metadata.reportNotes) {
      children.push(para(''));
      children.push(heading(t('exportReport:heading.reportNotes'), HeadingLevel.HEADING_2));
      children.push(para(doc.metadata.reportNotes));
    }
    children.push(para(''));
  }

  // 5. 図（埋込）
  if (opts.includeDiagram && opts.diagramElementId) {
    section(t('exportReport:section.diagram'));
    try {
      const el = document.getElementById(opts.diagramElementId);
      if (el) {
        // 接続点・リサイズ枠などの編集用の部品は除き、載せないと選んだメモ・記号も除く
        const base = buildFilter({ includeGrid: false, includePaperGuides: false, includeRulers: false, background: 'white' });
        const filter = reportFigureFilter(content, base);
        const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2, filter });
        const bytes = await fetchPngBytes(dataUrl);
        const rect = el.getBoundingClientRect();
        const maxW = 600;
        const scale = Math.min(1, maxW / Math.max(1, rect.width));
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: bytes,
              transformation: {
                width: rect.width * scale,
                height: rect.height * scale,
              },
              // PNG 以外は docx 側で rejected されるので固定
              type: 'png',
            } as ConstructorParameters<typeof ImageRun>[0]),
          ],
        }));
      }
    } catch (e) {
      console.warn('図の埋め込みに失敗:', e); // i18n-ok（開発者向けのログ）
      children.push(para(t('exportReport:diagram.failed'), { italic: true }));
    }
    children.push(para(''));
  }

  // 6. 結果（漏れなく図要素を列挙）
  const includeRefs = opts.includeSourceRefs !== false;   // 既定 true
  const style = opts.sourceRefStyle ?? 'bracket';
  children.push(...buildResultsSection(t, doc, includeRefs, style, content, `${++secNo}. ${t('exportReport:section.results')}`, omit));

  // 7. 用語凡例
  children.push(...buildGlossary(t, `${++secNo}. ${t('exportReport:section.glossary')}`));

  return children;
}

export async function exportPaperReport(
  doc: TEMDocument,
  opts: PaperReportOptions,
): Promise<void> {
  const filename = opts.filename ?? 'TEMer_report.docx';
  const children = await buildPaperReportParagraphs(doc, opts);
  const docx = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(docx);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
