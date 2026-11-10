// ============================================================================
// 紙面での読みやすさの点検（2026-11-10 ユーザー決定）
// カタログTEA（2023）第 2 章の技術的な留意点: 縮めて印刷したとき 7 ポイント以下の文字は読みにくい。
// 出力の画面の「用紙に収めた後の図」（applyExportTransform の結果。座標と文字は用紙の px＝1 インチ 96 px）から、
// 紙面に出る文字の大きさを pt で見積もる。Box の文字の自動縮小（autoFitText）は数えないので目安
// ============================================================================

import type { TEMDocument } from '../types';
import { getBoxPreset } from './boxPreset';
import { computeLegendItems } from './legend';

/** 印刷で読みにくくなる文字の大きさ（pt）。これ未満を知らせる */
export const MIN_READABLE_PT = 7;
/** 用紙の px（96 dpi）から pt（72 pt / インチ） */
export const PX_TO_PT = 72 / 96;

export type TextKind = 'box' | 'typeLabel' | 'subLabel' | 'sdsg' | 'note' | 'timeArrow' | 'periodLabel' | 'legend';

export interface TextSize {
  kind: TextKind;
  id?: string;
  label?: string;
  pt: number;
}

/**
 * 図の中の文字（出力に出るもの）の紙面での大きさ（pt）を並べる。
 * pageScale は、ページの描く範囲を用紙に写すときの倍率（1 ページなら 1。複数ページで描く範囲が用紙より広ければ 1 未満）
 */
export function textSizesOnPaper(doc: TEMDocument, pageScale = 1): TextSize[] {
  const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId) ?? doc.sheets[0];
  if (!sheet) return [];
  const s = doc.settings;
  const k = PX_TO_PT * pageScale;
  const out: TextSize[] = [];
  const def = s.defaultFontSize ?? 13;
  for (const b of sheet.boxes) {
    if (b.label?.trim()) {
      const px = b.style?.fontSize ?? getBoxPreset(b.type, s).fontSize ?? def;
      out.push({ kind: 'box', id: b.id, label: b.label, pt: px * k });
    }
    // 種別ラベル（BFP-1 など）は通常の経験・潜在経験には出ない
    if (b.type !== 'normal' && b.type !== 'annotation' && b.typeLabelFontSize != null) {
      out.push({ kind: 'typeLabel', id: b.id, label: b.label, pt: b.typeLabelFontSize * k });
    }
    if (b.subLabel?.trim() && b.subLabelFontSize != null) {
      out.push({ kind: 'subLabel', id: b.id, label: b.subLabel, pt: b.subLabelFontSize * k });
    }
  }
  for (const g of sheet.sdsg ?? []) {
    if (g.label?.trim()) out.push({ kind: 'sdsg', id: g.id, label: g.label, pt: (g.style?.fontSize ?? 11) * k });
    // 種別ラベル（SD・SG の文字）とサブラベルも数える（2026-11-10 レビュー。以前は本文だけで、小さな種別ラベルを見逃した）
    if (g.typeLabelFontSize != null && s.typeLabelVisibility?.[g.type] !== false) {
      out.push({ kind: 'typeLabel', id: g.id, label: g.type, pt: g.typeLabelFontSize * k });
    }
    if (g.subLabel?.trim() && g.subLabelFontSize != null) {
      out.push({ kind: 'subLabel', id: g.id, label: g.subLabel, pt: g.subLabelFontSize * k });
    }
  }
  for (const n of sheet.notes ?? []) {
    if (n.text?.trim()) out.push({ kind: 'note', id: n.id, label: n.text, pt: (n.fontSize ?? Math.min(def, 13)) * k });
  }
  if (s.timeArrow?.alwaysVisible !== false && sheet.boxes.length > 0 && s.timeArrow?.label?.trim()) {
    out.push({ kind: 'timeArrow', label: s.timeArrow.label, pt: s.timeArrow.fontSize * k });
  }
  if ((sheet.periodLabels ?? []).length > 0 && s.periodLabels?.fontSize) {
    out.push({ kind: 'periodLabel', pt: s.periodLabels.fontSize * k });
  }
  // 凡例は、出力のどれかに出るなら数える（PNG・PDF は alwaysVisible、PPTX・SVG は includeInExport で描く。2026-11-10 レビュー）
  if (s.legend && (s.legend.includeInExport !== false || s.legend.alwaysVisible !== false)
    && computeLegendItems(sheet, s.legend, s.locale).length > 0) {
    out.push({ kind: 'legend', pt: s.legend.fontSize * k });
  }
  return out;
}

/** いちばん小さい文字と、読みにくい（MIN_READABLE_PT 未満）文字の数 */
export function readabilitySummary(doc: TEMDocument, pageScale = 1): { smallest: TextSize | null; tooSmall: TextSize[] } {
  const all = textSizesOnPaper(doc, pageScale);
  if (all.length === 0) return { smallest: null, tooSmall: [] };
  const smallest = all.reduce((a, b) => (b.pt < a.pt ? b : a));
  return { smallest, tooSmall: all.filter((x) => x.pt < MIN_READABLE_PT - 1e-6) };
}
