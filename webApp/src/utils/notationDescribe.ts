// ============================================================================
// notationDescribe - 論文用レポートの Block 1（記号の宣言）に書く「各要素の線種」と「線種が表す意味」
// - 今の図の実際の線種（テーマ＝boxTypePresets と種別ごとの既定）から書く。
//   設定画面で既定の表記と簡素化方式（線種は実在性だけ）のどちらを選んだかが、そのまま文になる
// - 論文 04_report_format.md Block 1「各要素の視覚的表現」「線種が表す意味」
// ============================================================================

import type { Box, BoxType, ProjectSettings, TEMDocument, TypeLabelVisibilityKey } from '../types';
import { BOX_RENDER_SPECS } from '../store/defaults';
import { resolveBoxBorderDraw } from './boxPreset';
import { boxHasType } from './typeDisplay';

export const BOX_TYPE_NAME_JA: Record<BoxType, string> = {
  'normal': '通常の経験',
  'OPP': '必須通過点（OPP）',
  'BFP': '分岐点（BFP）',
  'EFP': '等至点（EFP）',
  'P-EFP': '両極化した等至点（P-EFP）',
  '2nd-EFP': '第2等至点（2nd EFP）',
  'P-2nd-EFP': '両極化した第2等至点（P-2nd EFP）',
  'annotation': '潜在経験（観察されなかった経験）',
  'other': 'その他の種別',
};

const ORDER: BoxType[] = ['normal', 'BFP', 'OPP', 'EFP', 'P-EFP', '2nd-EFP', 'P-2nd-EFP', 'annotation', 'other'];
/** 観察されなかった側（簡素化方式で点線にする種別） */
const UNOBSERVED: BoxType[] = ['annotation', 'P-EFP', 'P-2nd-EFP'];

type Stroke = 'solid' | 'double' | 'dashed' | 'dotted' | 'double-dashed';
const STROKE_NAME: Record<Stroke, string> = {
  solid: '実線', double: '二重線', dashed: '点線', dotted: '細かい点線', 'double-dashed': '二重の点線',
};

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

export function describeNotation(doc: TEMDocument): NotationDescription | null {
  const types = usedBoxTypes(doc);
  if (types.length === 0) return null;
  const settings = doc.settings;
  // 線種を書くのは枠に現れる種別だけ。併記にしか使っていない種別は「種別ラベルだけで示す」と書く（レビュー #6）
  const drawn = drawnBoxTypes(doc);
  const secondaryOnly = types.filter((t) => !drawn.includes(t));
  // 主の種別が通常の経験・潜在経験の Box には種別ラベルが出ない（BoxNode・SVG・PPTX）。そこへの併記は図に現れない（pass-2 新規 #4）
  const allBoxes = doc.sheets.flatMap((s) => s.boxes);
  const labelShown = (b: Box) => b.type !== 'normal' && b.type !== 'annotation';
  const hasSecondary = allBoxes.some((b) => !!b.secondaryType && b.secondaryType !== b.type && labelShown(b));
  const strokes = drawn.map((t) => ({ type: t, ...strokeOf(t, settings) }));
  // 太さは、使っている種別でいちばん多い太さを基準に「太い・細い」で言う
  const widthCount = new Map<number, number>();
  strokes.forEach((s) => widthCount.set(s.width, (widthCount.get(s.width) ?? 0) + 1));
  const base = [...widthCount.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
  const nameOf = (s: { stroke: Stroke; width: number }) => {
    const r = s.width / base;
    const w = r >= 1.6 ? '太い' : r > 1.05 ? 'やや太い' : r < 0.95 ? '細い' : '';
    return `${w}${STROKE_NAME[s.stroke]}`;
  };
  const named = strokes.map((s) => ({ type: s.type, name: nameOf(s) }));
  const lines = named.map((n) => `${BOX_TYPE_NAME_JA[n.type]}: ${n.name}`);
  for (const t of secondaryOnly) {
    const visible = allBoxes.some((b) => b.secondaryType === t && labelShown(b));
    lines.push(visible
      ? `${BOX_TYPE_NAME_JA[t]}: 併記の種別ラベルだけで示す（枠は主の種別の線）`
      : `${BOX_TYPE_NAME_JA[t]}: 図には示していない（通常の経験・潜在経験の Box への併記で，種別ラベルが出ないため）`);
  }

  const observed = named.filter((n) => !UNOBSERVED.includes(n.type));
  const unobserved = named.filter((n) => UNOBSERVED.includes(n.type));
  const same = (xs: { name: string }[]) => xs.length > 0 && xs.every((x) => x.name === xs[0].name);
  const obsSolid = observed.length > 0 && same(observed) && observed[0].name.endsWith('実線');
  const unobsDashed = unobserved.length === 0 || (same(unobserved) && unobserved[0].name.includes('点線'));
  const realityOnly = obsSolid && unobsDashed && (unobserved.length === 0 || unobserved[0].name !== observed[0].name);

  let meaning: string;
  if (realityOnly) {
    const unobsPart = unobserved.length > 0 ? `，${unobserved[0].name}＝観察されなかった経験` : '';
    meaning = `Box の線種は実在性だけを表す（${observed[0].name}＝データの中で観察された経験${unobsPart}）。` +
      '等至点・必須通過点・分岐点などの種別は，線種ではなく図中の種別ラベル（自動採番）で示す。';
    const hidden = types.filter((t) => t !== 'normal' && t !== 'annotation' && t !== 'other'
      && settings.typeLabelVisibility?.[t as TypeLabelVisibilityKey] === false);
    if (hidden.length > 0) meaning += `ただし，${hidden.map((t) => BOX_TYPE_NAME_JA[t]).join('・')}の種別ラベルは表示していない。`;
  } else {
    meaning = 'Box の線種は，要素の種別と実在性（観察されたか否か）の両方を表す。';
  }
  if (hasSecondary) meaning += '2 つの種別を併記した Box は，枠を主の種別の線で描き，併記した種別は種別ラベルで示す。';
  return { lines, meaning, realityOnly };
}
