// ============================================================================
// notationDescribe - 論文用レポートの Block 1（記号の宣言）に書く「各要素の線種」と「線種が表す意味」
// - 今の図の実際の線種（テーマ＝boxTypePresets と種別ごとの既定）から書く。
//   設定画面で既定の表記と簡素化方式（線種は実在性だけ）のどちらを選んだかが、そのまま文になる
// - 論文 04_report_format.md Block 1「各要素の視覚的表現」「線種が表す意味」
// - 文は図の言語（doc.settings.locale）で書く。文言は翻訳の表 locales/notationDescribe.csv
// ============================================================================

import i18n from '../i18n';
import type { Box, BoxType, ProjectSettings, TEMDocument, TypeLabelVisibilityKey } from '../types';
import { BOX_RENDER_SPECS } from '../store/defaults';
import { resolveBoxBorderDraw, legendSampleShape } from './boxPreset';
import { boxHasType } from './typeDisplay';

/** Box の種別の名前（図の言語） */
export function boxTypeName(type: BoxType, lng: string): string {
  return i18n.t(`notationDescribe:boxType.${type}`, { lng });
}

const ORDER: BoxType[] = ['normal', 'BFP', 'OPP', 'EFP', 'P-EFP', '2nd-EFP', 'P-2nd-EFP', 'annotation', 'other'];
/** 観察されなかった側（簡素化方式で点線にする種別） */
const UNOBSERVED: BoxType[] = ['annotation', 'P-EFP', 'P-2nd-EFP'];

type Stroke = 'solid' | 'double' | 'dashed' | 'dotted' | 'double-dashed';
/** 点線の仲間（簡素化方式で「観察されなかった」を表す線） */
const DASHED_STROKES: Stroke[] = ['dashed', 'dotted', 'double-dashed'];

function strokeOf(type: BoxType, settings: ProjectSettings): { stroke: Stroke; width: number } {
  const d = resolveBoxBorderDraw({ type } as Box, settings);
  if (d.kind === 'single') return { stroke: d.style, width: d.width };
  if (d.kind === 'double') return { stroke: 'double', width: d.width };
  if (d.kind === 'double-dashed') return { stroke: 'double-dashed', width: d.width };
  const f = BOX_RENDER_SPECS[type] ?? BOX_RENDER_SPECS.normal;
  if (type === 'P-EFP' || type === 'P-2nd-EFP') return { stroke: 'double-dashed', width: f.borderWidth };
  return { stroke: f.borderStyle, width: f.borderWidth };
}

/** 図で使っている Box の種別（並びは ORDER） */
export function usedBoxTypes(doc: TEMDocument): BoxType[] {
  const boxes = doc.sheets.flatMap((s) => s.boxes).filter((b) => !b.isGroup || b.type !== 'normal');
  return ORDER.filter((t) => boxes.some((b) => boxHasType(b, t)));
}

export interface NotationDescription {
  /** 「等至点（EFP）: 二重線」の形 */
  lines: string[];
  /** 線種が表す意味（1 文） */
  meaning: string;
  /** 線種が実在性だけを表している（簡素化方式） */
  realityOnly: boolean;
}

/** 枠の線として図に現れる種別（主の種別）。併記の種別は枠に出ない（枠は主の種別の線で描く） */
function drawnBoxTypes(doc: TEMDocument): BoxType[] {
  const boxes = doc.sheets.flatMap((s) => s.boxes).filter((b) => !b.isGroup || b.type !== 'normal');
  return ORDER.filter((t) => boxes.some((b) => b.type === t));
}

/**
 * Block 1 の「各要素の線種」と「線種が表す意味」。
 * 文は図の言語（doc.settings.locale。凡例と同じ）で書く
 */
export function describeNotation(doc: TEMDocument): NotationDescription | null {
  const types = usedBoxTypes(doc);
  if (types.length === 0) return null;
  const settings = doc.settings;
  const lng = settings.locale ?? 'ja';
  const t = (key: string, opts?: Record<string, unknown>): string => i18n.t(key, { ...opts, lng });
  // 線種を書くのは枠に現れる種別だけ。併記にしか使っていない種別は「種別ラベルだけで示す」と書く（レビュー #6）
  const drawn = drawnBoxTypes(doc);
  const secondaryOnly = types.filter((x) => !drawn.includes(x));
  // 主の種別が通常の経験・潜在経験の Box には種別ラベルが出ない（BoxNode・SVG・PPTX）。そこへの併記は図に現れない（pass-2 新規 #4）
  const allBoxes = doc.sheets.flatMap((s) => s.boxes);
  const labelShown = (b: Box) => b.type !== 'normal' && b.type !== 'annotation';
  const hasSecondary = allBoxes.some((b) => !!b.secondaryType && b.secondaryType !== b.type && labelShown(b));
  const strokes = drawn.map((x) => ({ type: x, ...strokeOf(x, settings) }));
  // 太さは、使っている種別でいちばん多い太さを基準に「太い・細い」で言う
  const widthCount = new Map<number, number>();
  strokes.forEach((s) => widthCount.set(s.width, (widthCount.get(s.width) ?? 0) + 1));
  const base = [...widthCount.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
  const nameOf = (s: { stroke: Stroke; width: number }) => {
    const r = s.width / base;
    const w = r >= 1.6 ? 'thick' : r > 1.05 ? 'slightlyThick' : r < 0.95 ? 'thin' : '';
    const stroke = i18n.t(`notationDescribe:stroke.${s.stroke}`, { lng });
    return w ? i18n.t(`notationDescribe:weight.${w}`, { lng, stroke }) : stroke;
  };
  const named = strokes.map((s) => ({ type: s.type, stroke: s.stroke, name: nameOf(s) }));
  // テーマが楕円を指定した種別は「細い実線の楕円」のように形も書く（カタログTEA 図 2-1 の例の OPP。2026-11-10）。
  // 線種の意味の判定（下の realityOnly）には形を入れない
  const lines = named.map((n) => t('notationDescribe:line', {
    type: boxTypeName(n.type, lng),
    stroke: legendSampleShape(n.type, settings) === 'ellipse' ? t('notationDescribe:shape.ellipse', { stroke: n.name }) : n.name,
  }));
  for (const x of secondaryOnly) {
    const visible = allBoxes.some((b) => b.secondaryType === x && labelShown(b));
    lines.push(visible
      ? t('notationDescribe:line.secondaryLabelOnly', { type: boxTypeName(x, lng) })
      : t('notationDescribe:line.secondaryHidden', { type: boxTypeName(x, lng) }));
  }

  const observed = named.filter((n) => !UNOBSERVED.includes(n.type));
  const unobserved = named.filter((n) => UNOBSERVED.includes(n.type));
  const same = (xs: { name: string }[]) => xs.length > 0 && xs.every((x) => x.name === xs[0].name);
  // 線の種類で判定する（以前は日本語の名前の「実線」「点線」で見ていた。意味は同じ）
  const obsSolid = observed.length > 0 && same(observed) && observed[0].stroke === 'solid';
  const unobsDashed = unobserved.length === 0 || (same(unobserved) && DASHED_STROKES.includes(unobserved[0].stroke));
  const realityOnly = obsSolid && unobsDashed && (unobserved.length === 0 || unobserved[0].name !== observed[0].name);

  // 文を並べる（日本語は詰めて、英語は空白で区切る）
  const sentences: string[] = [];
  if (realityOnly) {
    const unobsPart = unobserved.length > 0 ? t('notationDescribe:meaning.unobservedPart', { stroke: unobserved[0].name }) : '';
    sentences.push(t('notationDescribe:meaning.realityOnly', { observed: observed[0].name, unobserved: unobsPart }));
    sentences.push(t('notationDescribe:meaning.typesByLabel'));
    const hidden = types.filter((x) => x !== 'normal' && x !== 'annotation' && x !== 'other'
      && settings.typeLabelVisibility?.[x as TypeLabelVisibilityKey] === false);
    if (hidden.length > 0) {
      sentences.push(t('notationDescribe:meaning.hiddenLabels', {
        types: hidden.map((x) => boxTypeName(x, lng)).join(t('notationDescribe:list.separator')),
      }));
    }
  } else {
    sentences.push(t('notationDescribe:meaning.both'));
  }
  if (hasSecondary) sentences.push(t('notationDescribe:meaning.secondary'));
  const meaning = sentences.join(lng === 'ja' ? '' : ' '); // 文の区切り（日本語は詰める）
  return { lines, meaning, realityOnly };
}
