// ============================================================================
// 論文用レポート出力（.docx）
// - 方法相当: 記号体系 / 協力者情報 / インタビュー / 表記方針
// - TEM 図（キャンバスを PNG 化して埋込）
// - 結果: シートごとに 時期区分 / Box (種別ごと) / 径路 / SD / SG を漏れなくリスト
// - 用語凡例
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
} from '../types';

export interface PaperReportOptions {
  filename?: string;
  diagramElementId?: string;
  includeDiagram: boolean;
  includeSourceRefs?: boolean;     // 原文引用を結果セクションに含める (既定 true)
  /**
   * 引用の表記スタイル:
   *   'bracket' (既定): [原文 T1 §4]「指導教員と...」
   *   'apa':           （A, 第1回, §4）「指導教員と...」
   *                     APA 風の括弧引用。協力者 + 回 + 段落番号
   */
  sourceRefStyle?: 'bracket' | 'apa';
}

// ----------------------------------------------------------------------------
// 小さなヘルパ
// ----------------------------------------------------------------------------

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
function bullet(text: string, indent = 0): Paragraph {
  const prefix = indent > 0 ? '    '.repeat(indent) : '';
  return new Paragraph({
    children: [new TextRun({ text: `${prefix}・${text}` })],
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

const BOX_TYPE_LABEL_JA: Record<BoxType, string> = {
  'normal': '事象・経験（通常 Box）',
  'OPP': '必須通過点 (OPP)',
  'BFP': '分岐点 (BFP)',
  'EFP': '等至点 (EFP)',
  'P-EFP': '両極化した等至点 (P-EFP)',
  '2nd-EFP': '第2等至点 (2nd EFP)',
  'P-2nd-EFP': '両極化した第2等至点 (P-2nd EFP)',
  'annotation': '注釈・潜在経験 (annotation)',
};

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
];

// ----------------------------------------------------------------------------
// 各種フォーマッタ
// ----------------------------------------------------------------------------

function descSuffix(description?: string, noDescriptionNeeded?: boolean): string {
  if (description && description.trim()) return ` — 説明: ${description.trim()}`;
  if (noDescriptionNeeded) return ' — （説明不要）';
  return ' — （説明未記入）';
}

// 原文引用を 1 行で要約。スタイルは bracket / apa を切替可能
function sourceRefSuffix(
  refs: SourceRef[] | undefined,
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  style: 'bracket' | 'apa',
): string {
  if (!refs || refs.length === 0) return '';
  const parts = refs.map((r, i) => {
    const t = transcripts.find((x) => x.id === r.transcriptId);
    const para = t?.paragraphs.find((p) => p.id === r.paragraphId);
    const paraIdx = para ? `§${para.index + 1}` : '';
    const quote = (r.quoteText ?? '').trim();
    const quoteShort = quote.length > 60 ? quote.slice(0, 60) + '...' : quote;
    const unres = r.unresolved ? ' [追従不能]' : '';

    if (style === 'apa') {
      // 協力者 (pseudonym) + 第N回 + §段落
      const pseudo = t?.participantId ? (participantsLookup.get(t.participantId) ?? '不明') : '不明';
      const session = t?.sessionNumber !== undefined ? `第${t.sessionNumber}回` : '';
      const cite = [pseudo, session, paraIdx].filter(Boolean).join(', ');
      return `（${cite}）「${quoteShort}」${unres}`;
    } else {
      const tLabel = t ? (t.title.length > 20 ? `T${i + 1}` : t.title) : `T?`;
      return `[原文 ${tLabel} ${paraIdx}]「${quoteShort}」${unres}`;
    }
  });
  return '  ' + parts.join(' ');
}

function formatPeriodLabels(
  labels: PeriodLabel[],
  layout: LayoutDirection,
): Paragraph[] {
  if (labels.length === 0) return [];
  const out: Paragraph[] = [];
  out.push(heading('時期区分', HeadingLevel.HEADING_3));
  const sorted = [...labels].sort((a, b) => a.position - b.position);
  const axisLabel = layout === 'horizontal' ? 'Time level' : 'Time level';
  sorted.forEach((p, i) => {
    const lab = (p.label && p.label.trim()) ? p.label.trim() : '（ラベル未設定）';
    out.push(bullet(`期${i + 1}: 〈${lab}〉  (${axisLabel} ${p.position})`));
  });
  out.push(para(''));
  return out;
}

function formatBoxesByType(
  boxes: Box[],
  type: BoxType,
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
): Paragraph[] {
  const subset = boxes.filter((b) => b.type === type);
  if (subset.length === 0) return [];
  const out: Paragraph[] = [];
  out.push(heading(BOX_TYPE_LABEL_JA[type], HeadingLevel.HEADING_3));
  subset.forEach((b) => {
    const lab = (b.label && b.label.trim()) ? b.label.trim() : '（ラベル未設定）';
    const sub = b.subLabel && b.subLabel.trim() ? ` [${b.subLabel.trim()}]` : '';
    const refSfx = includeRefs ? sourceRefSuffix(b.sourceRefs, transcripts, participantsLookup, style) : '';
    out.push(bullet(`${b.id}${sub} 〈${lab}〉${descSuffix(b.description, b.noDescriptionNeeded)}${refSfx}`));
  });
  out.push(para(''));
  return out;
}

function lineTypeLabel(t: Line['type']): string {
  if (t === 'RLine') return '実線（実現された径路）';
  if (t === 'XLine') return '点線（未実現／潜在的径路）';
  return String(t);
}

function formatLines(
  lines: Line[],
  boxes: Box[],
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
): Paragraph[] {
  if (lines.length === 0) return [];
  const out: Paragraph[] = [];
  out.push(heading('径路 (Line)', HeadingLevel.HEADING_3));

  const labelOf = (id: string): string => {
    const b = boxes.find((x) => x.id === id);
    if (!b) return id;
    const txt = (b.label && b.label.trim()) ? b.label.trim() : '（ラベル未設定）';
    return `${b.id}〈${txt}〉`;
  };

  const groups: Array<{ type: Line['type']; items: Line[] }> = [
    { type: 'RLine', items: lines.filter((l) => l.type === 'RLine') },
    { type: 'XLine', items: lines.filter((l) => l.type === 'XLine') },
  ];

  for (const g of groups) {
    if (g.items.length === 0) continue;
    out.push(bullet(lineTypeLabel(g.type)));
    g.items.forEach((l) => {
      const labelPart = l.label && l.label.trim() ? ` 〈${l.label.trim()}〉` : '';
      const refSfx = includeRefs ? sourceRefSuffix(l.sourceRefs, transcripts, participantsLookup, style) : '';
      out.push(bullet(`${l.id}${labelPart}: ${labelOf(l.from)} → ${labelOf(l.to)}${descSuffix(l.description, l.noDescriptionNeeded)}${refSfx}`, 1));
    });
  }
  out.push(para(''));
  return out;
}

function sdsgTypeLabel(t: SDSG['type']): string {
  return t === 'SD'
    ? '社会的方向づけ (SD)'
    : '社会的支援 (SG)';
}

function formatSdsg(
  sdsgs: SDSG[],
  boxes: Box[],
  lines: Line[],
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
): Paragraph[] {
  if (sdsgs.length === 0) return [];
  const out: Paragraph[] = [];

  const attachedLabel = (s: SDSG): string => {
    const refOf = (id: string, kind: 'box' | 'line'): string => {
      if (kind === 'box') {
        const b = boxes.find((x) => x.id === id);
        if (!b) return id;
        const t = (b.label && b.label.trim()) ? b.label.trim() : '（ラベル未設定）';
        return `${b.id}〈${t}〉`;
      } else {
        const l = lines.find((x) => x.id === id);
        if (!l) return id;
        return `${l.id}`;
      }
    };
    const a1 = refOf(s.attachedTo, s.attachedType);
    if (s.anchorMode === 'between' && s.attachedTo2 && s.attachedType2) {
      const a2 = refOf(s.attachedTo2, s.attachedType2);
      return `${a1} と ${a2} の間`;
    }
    return a1;
  };

  for (const type of ['SD', 'SG'] as const) {
    const subset = sdsgs.filter((s) => s.type === type);
    if (subset.length === 0) continue;
    out.push(heading(sdsgTypeLabel(type), HeadingLevel.HEADING_3));
    subset.forEach((s) => {
      const lab = (s.label && s.label.trim()) ? s.label.trim() : '（ラベル未設定）';
      const sub = s.subLabel && s.subLabel.trim() ? ` [${s.subLabel.trim()}]` : '';
      const refSfx = includeRefs ? sourceRefSuffix(s.sourceRefs, transcripts, participantsLookup, style) : '';
      out.push(bullet(`${s.id}${sub} 〈${lab}〉  対象: ${attachedLabel(s)}${descSuffix(s.description, s.noDescriptionNeeded)}${refSfx}`));
    });
    out.push(para(''));
  }
  return out;
}

// ----------------------------------------------------------------------------
// シート単位の「結果」セクション
// ----------------------------------------------------------------------------

function buildSheetResults(
  sheet: Sheet,
  layout: LayoutDirection,
  multiSheet: boolean,
  transcripts: Transcript[],
  participantsLookup: Map<string, string>,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
): Paragraph[] {
  const out: Paragraph[] = [];
  if (multiSheet) {
    out.push(heading(`シート: ${sheet.name}`, HeadingLevel.HEADING_2));
  }

  // カウンタ
  const summary: string[] = [];
  summary.push(`Box ${sheet.boxes.length} 件`);
  summary.push(`径路 ${sheet.lines.length} 件`);
  summary.push(`SD/SG ${sheet.sdsg.length} 件`);
  summary.push(`時期区分 ${sheet.periodLabels.length} 件`);
  out.push(para(`本シートの図要素: ${summary.join(' / ')}`));
  out.push(para(''));

  // 時期区分（先頭）
  out.push(...formatPeriodLabels(sheet.periodLabels, layout));

  // Box 種別ごと
  for (const t of BOX_TYPE_ORDER) {
    out.push(...formatBoxesByType(sheet.boxes, t, transcripts, participantsLookup, includeRefs, style));
  }

  // 径路
  out.push(...formatLines(sheet.lines, sheet.boxes, transcripts, participantsLookup, includeRefs, style));

  // SD / SG
  out.push(...formatSdsg(sheet.sdsg, sheet.boxes, sheet.lines, transcripts, participantsLookup, includeRefs, style));

  return out;
}

// ----------------------------------------------------------------------------
// 用語凡例
// ----------------------------------------------------------------------------

function buildGlossary(): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(heading('用語凡例（図中略語の説明）', HeadingLevel.HEADING_1));
  out.push(para('図中で用いた略語は以下のとおりである。'));
  const items: Array<[string, string]> = [
    ['OPP', '必須通過点 (Obligatory Passage Point)'],
    ['BFP', '分岐点 (Bifurcation Point)'],
    ['EFP', '等至点 (Equifinality Point)'],
    ['P-EFP', '両極化した等至点 (Polarized Equifinality Point)'],
    ['2nd EFP', '第2等至点 (Second Equifinality Point)'],
    ['P-2nd EFP', '両極化した第2等至点 (Polarized Second Equifinality Point)'],
    ['SD', '社会的方向づけ (Social Direction)'],
    ['SG', '社会的支援 (Social Guidance)'],
    ['実線矢印', '実現された径路（実際に辿られた経路）'],
    ['点線矢印', '未実現／潜在的径路'],
    ['非可逆的時間', '左から右（または上から下）へ向かう時間軸'],
  ];
  for (const [abbr, full] of items) {
    out.push(bullet(`${abbr}: ${full}`));
  }
  out.push(para(''));
  return out;
}

// ----------------------------------------------------------------------------
// 結果セクション全体（複数シート対応）
// ----------------------------------------------------------------------------

function buildResultsSection(
  doc: TEMDocument,
  includeRefs: boolean,
  style: 'bracket' | 'apa',
): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(heading('6. 結果', HeadingLevel.HEADING_1));

  // 協力者 ID → pseudonym のマップ（APA 引用用）
  const participantsLookup = new Map<string, string>();
  for (const p of doc.participants) {
    participantsLookup.set(p.id, p.pseudonym ?? p.id);
  }

  // テンプレート文（編集前提のドラフト）
  out.push(para('本研究では，TEM（複線径路等至性モデル）を用いて分析を行い，その結果を上記の TEM 図に示した。'));
  out.push(para('以下では，図中に描かれた要素（時期区分・各種事象・径路・社会的影響）を漏れなく列挙する。事象や経験のラベルは慣例に従い〈…〉で括って示す。'));
  if (includeRefs && doc.transcripts.length > 0) {
    if (style === 'apa') {
      out.push(para('各要素の末尾には，紐付くインタビュー原文の引用を APA 風の括弧表記「（協力者, 第N回, §段落）「…」」 で示す。'));
    } else {
      out.push(para('各要素の末尾には，紐付くインタビュー原文の引用を [原文 T<番号> §<段落>]「…」 の形式で示す。'));
    }
  }
  out.push(para(''));

  const multiSheet = doc.sheets.length > 1;
  for (const sheet of doc.sheets) {
    out.push(...buildSheetResults(sheet, doc.settings.layout, multiSheet, doc.transcripts, participantsLookup, includeRefs, style));
  }
  return out;
}

// ----------------------------------------------------------------------------
// メイン
// ----------------------------------------------------------------------------

export async function exportPaperReport(
  doc: TEMDocument,
  opts: PaperReportOptions,
): Promise<void> {
  const filename = opts.filename ?? 'TEMer_report.docx';
  const children: Paragraph[] = [];

  // タイトル
  children.push(new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: doc.metadata.title || 'TEM 図報告', bold: true })],
  }));
  if (doc.metadata.author) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: doc.metadata.author })],
    }));
  }
  children.push(para(''));

  // 1. 記号体系
  const ns = doc.metadata.notationSystem;
  children.push(heading('1. 記号体系の宣言', HeadingLevel.HEADING_1));
  if (ns) {
    children.push(para(
      ns.base === 'Arakawa2012'
        ? '本図は荒川・安田・サトウ（2012）の標準記号に準拠する。'
        : ns.base === 'custom'
          ? '本図は独自の記号体系を用いる（下記参照）。'
          : 'その他の記号体系を用いる（下記参照）。'
    ));
    if (ns.customDescription) children.push(para(ns.customDescription));
  } else {
    children.push(para('（未入力）', { italic: true }));
  }
  children.push(para(''));

  // 2. 協力者情報
  const pi = doc.metadata.participantsInfo;
  children.push(heading('2. 協力者情報', HeadingLevel.HEADING_1));
  if (pi) {
    if (pi.count > 0) children.push(para(`協力者数: ${pi.count} 名`));
    if (pi.description) children.push(para(`記述: ${pi.description}`));
    if (pi.hsiDescription) children.push(para(`HSI 水準: ${pi.hsiDescription}`));
    if (pi.pseudonyms && pi.pseudonyms.length) {
      children.push(para(`仮名: ${pi.pseudonyms.join(', ')}`));
    }
  } else {
    children.push(para('（未入力）', { italic: true }));
  }
  children.push(para(''));

  // 3. インタビュー
  const iv = doc.metadata.interview;
  children.push(heading('3. インタビュー方法', HeadingLevel.HEADING_1));
  if (iv) {
    if (iv.method) children.push(para(`方法: ${iv.method}`));
    if (iv.durationDescription) children.push(para(`所要時間/期間: ${iv.durationDescription}`));
    if (iv.timesCount > 0) children.push(para(`回数: ${iv.timesCount} 回`));
    if (iv.analysisCombination) children.push(para(`分析の組合せ: ${iv.analysisCombination}`));
    if (iv.notes) children.push(para(`備考: ${iv.notes}`));
  } else {
    children.push(para('（未入力）', { italic: true }));
  }
  children.push(para(''));

  // 4. 表記方針
  const vc = doc.metadata.visualConventions;
  children.push(heading('4. 表記方針', HeadingLevel.HEADING_1));
  const addConv = (label: string, ent?: { hasMeaning: boolean; description?: string }) => {
    if (!ent) return;
    const txt = ent.hasMeaning
      ? `${label}: 意味あり。${ent.description ?? ''}`
      : `${label}: 意味なし（見栄えのみ）`;
    children.push(para(txt));
  };
  if (vc) {
    addConv('横軸の長さ',      vc.horizontalLength);
    addConv('矢印の角度',      vc.arrowAngle);
    addConv('縦の位置',        vc.verticalPosition);
    addConv('色',              vc.colors);
    addConv('線の太さ',        vc.lineWeight);
    if (vc.other) {
      vc.other.forEach((o) => children.push(para(`${o.aspect}: ${o.description}`)));
    }
  } else {
    children.push(para('（未入力）', { italic: true }));
  }
  if (doc.metadata.reportNotes) {
    children.push(para(''));
    children.push(heading('補足', HeadingLevel.HEADING_2));
    children.push(para(doc.metadata.reportNotes));
  }
  children.push(para(''));

  // 5. 図（埋込）
  if (opts.includeDiagram && opts.diagramElementId) {
    children.push(heading('5. TEM 図', HeadingLevel.HEADING_1));
    try {
      const el = document.getElementById(opts.diagramElementId);
      if (el) {
        const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 });
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
      console.warn('図の埋め込みに失敗:', e);
      children.push(para('（図の埋め込みに失敗しました）', { italic: true }));
    }
    children.push(para(''));
  }

  // 6. 結果（漏れなく図要素を列挙）
  const includeRefs = opts.includeSourceRefs !== false;   // 既定 true
  const style = opts.sourceRefStyle ?? 'bracket';
  children.push(...buildResultsSection(doc, includeRefs, style));

  // 7. 用語凡例
  children.push(...buildGlossary());

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
