// ============================================================================
// 匿名化ユーティリティ
//
// インタビュー原文に含まれる人名・組織名等を「[協力者A]」「[組織α]」のような
// 仮名に置換する処理。取り込み時の前置き処理と、保存済 .tem の再エクスポート
// の両方で使う。
// ============================================================================

import type { TEMDocument, Transcript, SourceRef } from '../types';

/**
 * 「協力者A, 山田太郎, X 大学」のようなコンマ区切り入力を
 * { 原文: 仮名 } のマップに展開する。
 * デフォルトの仮名規則: [協力者A], [協力者B], ... (組織は organizationLabels で別管理可)
 *
 * @param namesCsv コンマ区切りの名称一覧
 * @param prefix 仮名の prefix（既定 "協力者"）
 */
export function buildAnonymizationMap(
  namesCsv: string,
  prefix = '協力者', // i18n-ok 仮名の頭の既定（逐語録・図のデータに入る値）
): Record<string, string> {
  const names = namesCsv
    .split(/[,、，]/) // i18n-ok 利用者の入力の区切り（全角の読点）
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const map: Record<string, string> = {};
  // 重複除去 + 既出順序維持
  const uniq = Array.from(new Set(names));
  uniq.forEach((name, i) => {
    // A, B, C... Z, AA, AB...
    const letter = indexToLetter(i);
    map[name] = `[${prefix}${letter}]`;
  });
  return map;
}

function indexToLetter(i: number): string {
  // 0 -> A, 25 -> Z, 26 -> AA
  let n = i;
  let out = '';
  do {
    out = String.fromCharCode('A'.charCodeAt(0) + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

/**
 * テキスト中の各キーを対応する値に一括置換する。
 * 長いキー優先で置換することで「山田太郎」が「山田」より先に処理される。
 */
export function applyReplacements(text: string, replacements: Record<string, string>): string {
  const keys = Object.keys(replacements);
  if (keys.length === 0) return text;
  // 長いキーから順
  keys.sort((a, b) => b.length - a.length);
  // すべてのキーをエスケープして | で OR
  const escaped = keys.map(escapeRegex).join('|');
  const re = new RegExp(escaped, 'g');
  return text.replace(re, (m) => replacements[m] ?? m);
}

/**
 * 置き換えと一緒に、置き換える前の文字の位置を置き換えた後の位置に直す関数を返す（2026-11-08 再レビュー）。
 * 範囲の始まりは置き換えた語の頭へ、終わりは語の後ろへ寄せる
 */
export function applyReplacementsWithMap(
  text: string,
  replacements: Record<string, string>,
): { text: string; mapStart: (i: number) => number; mapEnd: (i: number) => number } {
  const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
  if (keys.length === 0) return { text, mapStart: (i) => i, mapEnd: (i) => i };
  const re = new RegExp(keys.map(escapeRegex).join('|'), 'g');
  const spans: Array<{ o0: number; o1: number; n0: number; n1: number }> = [];
  let out = '';
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    out += text.slice(last, m.index);
    const rep = replacements[m[0]] ?? m[0];
    spans.push({ o0: m.index, o1: m.index + m[0].length, n0: out.length, n1: out.length + rep.length });
    out += rep;
    last = m.index + m[0].length;
  }
  out += text.slice(last);
  const map = (i: number, end: boolean) => {
    let shift = 0;
    for (const sp of spans) {
      if (i >= sp.o1) { shift = sp.n1 - sp.o1; continue; }
      if (i > sp.o0) return end ? sp.n1 : sp.n0;   // 語の途中
      break;
    }
    return i + shift;
  };
  return { text: out, mapStart: (i) => map(i, false), mapEnd: (i) => map(i, true) };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Transcript 全段落のテキスト + speaker + SourceRef.quoteText に置換を適用した
 * 新しい Transcript を返す。anonymizationMap には適用辞書を記録。
 */
/** 範囲（charStart・charEnd）を置き換えた後の位置に直す。範囲が無ければそのまま */
function remapRange(
  r: { charStart?: number; charEnd?: number },
  m: { mapStart: (i: number) => number; mapEnd: (i: number) => number } | undefined,
): { charStart?: number; charEnd?: number } {
  if (!m || r.charStart === undefined || r.charEnd === undefined) return {};
  return { charStart: m.mapStart(r.charStart), charEnd: m.mapEnd(r.charEnd) };
}

export function anonymizeTranscript(
  tr: Transcript,
  replacements: Record<string, string>,
): Transcript {
  const mappers = new Map(tr.paragraphs.map((p) => [p.id, applyReplacementsWithMap(p.text, replacements)]));
  const paragraphs = tr.paragraphs.map((p) => ({
    ...p,
    speaker: p.speaker ? applyReplacements(p.speaker, replacements) : p.speaker,
    text: mappers.get(p.id)!.text,
  }));
  const prevMap = tr.metadata?.anonymizationMap ?? {};
  // 切片の引用・見出し・メモも置き換える（見出しの既定は引用の初めなので名前が入りうる。2026-11-08 レビュー）
  const segments = tr.segments?.map((sg) => ({
    ...sg,
    ...remapRange(sg, mappers.get(sg.paragraphId)),
    quoteText: applyReplacements(sg.quoteText, replacements),
    label: applyReplacements(sg.label, replacements),
    note: sg.note ? applyReplacements(sg.note, replacements) : sg.note,
  }));
  return {
    ...tr,
    paragraphs,
    ...(segments ? { segments } : {}),
    metadata: {
      ...tr.metadata,
      anonymizationMap: { ...prevMap, ...replacements },
    },
  };
}

/**
 * ドキュメント全体の transcripts と、各 Box/Line/SDSG の SourceRef.quoteText、
 * および Box.description の中に出現する原文相当のテキストも一括置換した
 * 新しい TEMDocument を返す（イミュータブル）。
 *
 * 注意: Box.label / Line.label / SDSG.label は置換しない（解析者の概念名なので、
 * 個人名が含まれる場合はユーザが直接 PropertyPanel で編集することを想定）。
 */
export function anonymizeDocument(
  doc: TEMDocument,
  replacements: Record<string, string>,
): TEMDocument {
  const mappers = new Map(doc.transcripts.flatMap((t) => t.paragraphs.map((p) => [p.id, applyReplacementsWithMap(p.text, replacements)] as const)));
  const replaceRef = (r: SourceRef): SourceRef => ({
    ...r,
    ...remapRange(r, mappers.get(r.paragraphId)),
    quoteText: applyReplacements(r.quoteText, replacements),
  });
  return {
    ...doc,
    transcripts: doc.transcripts.map((tr) => anonymizeTranscript(tr, replacements)),
    sheets: doc.sheets.map((sh) => ({
      ...sh,
      boxes: sh.boxes.map((b) => ({
        ...b,
        // 切片から作った Box の文字は切片の見出し（引用の初め）由来なので置き換える。ほかの Box の文字は解析者の概念名なので置き換えない
        ...(b.segmentId ? { label: applyReplacements(b.label, replacements) } : {}),
        description: b.description ? applyReplacements(b.description, replacements) : b.description,
        sourceRefs: b.sourceRefs?.map(replaceRef),
      })),
      lines: sh.lines.map((l) => ({
        ...l,
        description: l.description ? applyReplacements(l.description, replacements) : l.description,
        sourceRefs: l.sourceRefs?.map(replaceRef),
      })),
      sdsg: sh.sdsg.map((s) => ({
        ...s,
        description: s.description ? applyReplacements(s.description, replacements) : s.description,
        sourceRefs: s.sourceRefs?.map(replaceRef),
      })),
    })),
  };
}
