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
  prefix = '協力者',
): Record<string, string> {
  const names = namesCsv
    .split(/[,、，]/)
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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Transcript 全段落のテキスト + speaker + SourceRef.quoteText に置換を適用した
 * 新しい Transcript を返す。anonymizationMap には適用辞書を記録。
 */
export function anonymizeTranscript(
  tr: Transcript,
  replacements: Record<string, string>,
): Transcript {
  const paragraphs = tr.paragraphs.map((p) => ({
    ...p,
    speaker: p.speaker ? applyReplacements(p.speaker, replacements) : p.speaker,
    text: applyReplacements(p.text, replacements),
  }));
  const prevMap = tr.metadata?.anonymizationMap ?? {};
  return {
    ...tr,
    paragraphs,
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
  const replaceRef = (r: SourceRef): SourceRef => ({
    ...r,
    quoteText: applyReplacements(r.quoteText, replacements),
  });
  return {
    ...doc,
    transcripts: doc.transcripts.map((tr) => anonymizeTranscript(tr, replacements)),
    sheets: doc.sheets.map((sh) => ({
      ...sh,
      boxes: sh.boxes.map((b) => ({
        ...b,
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
