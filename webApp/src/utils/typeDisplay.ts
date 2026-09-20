// ============================================================================
// Box種別の表示計算（自動連番・オーディナル）
// ============================================================================

import type { Box, BoxType, SDSG, LayoutDirection } from '../types';
import { BOX_TYPE_LABELS } from '../store/defaults';

function toOrdinalEn(n: number): string {
  if (n < 1) return '';
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return `${n}${suffixes[n % 10] ?? 'th'}`;
}

/**
 * Box の表示用タグ文字列を計算する
 * - 通常: 種別名（例: EFP, OPP）
 * - 複数ある場合:
 *   - EFP, P-EFP: "EFP" (1st), "2nd EFP", "3rd EFP"... (英語オーディナル)
 *   - OPP, BFP: "OPP-1", "OPP-2"... (ハイフン番号)
 *   - annotation: "潜在-1", "潜在-2"...
 *   - normal: 連番なし（ID で識別）
 *
 * 同種別は時間軸順で並べる
 */
/** Box が指定の種別を持つか（主種別または併記種別） */
export function boxHasType(b: Box, type: BoxType): boolean {
  return b.type === type || b.secondaryType === type;
}

/** 併記種別として選べる種別（採番のある種別のみ。normal / annotation / other は不可） */
export const SECONDARY_BOX_TYPES: BoxType[] = ['BFP', 'EFP', 'P-EFP', 'OPP', '2nd-EFP', 'P-2nd-EFP'];

const timeOf = (b: Box, layout: LayoutDirection) => (layout === 'horizontal' ? b.x : b.y);

/**
 * 1 つの種別についての表示文字列（採番込み）。
 * 採番は「その種別を主種別または併記種別として持つ Box」を時間軸順に数える。
 */
function displayForType(
  allBoxes: Box[],
  currentBox: Box,
  type: BoxType,
  layout: LayoutDirection,
): string {
  const shortName = BOX_TYPE_LABELS[type]?.shortJa ?? type;
  if (type === 'normal') return '';
  if (currentBox.typeLabelNumbered === false) return shortName;

  const sameType = allBoxes
    .filter((b) => boxHasType(b, type))
    .sort((a, b) => timeOf(a, layout) - timeOf(b, layout));
  if (sameType.length <= 1) return shortName;

  const index = sameType.findIndex((b) => b.id === currentBox.id) + 1;
  if (index <= 0) return shortName;

  // EFP / P-EFP: 英語オーディナル
  if (type === 'EFP' || type === 'P-EFP') {
    if (index === 1) return shortName;
    return `${toOrdinalEn(index)} ${shortName}`;
  }
  // その他: ハイフン番号
  return `${shortName}-${index}`;
}

/** 種別「その他」の表示。customTypeLabel が空なら非表示（''） */
function displayForOther(allBoxes: Box[], currentBox: Box, layout: LayoutDirection): string {
  const label = (currentBox.customTypeLabel ?? '').trim();
  if (!label) return '';
  if (!currentBox.customTypeNumbered) return label;
  const same = allBoxes
    .filter((b) => b.type === 'other' && (b.customTypeLabel ?? '').trim() === label)
    .sort((a, b) => timeOf(a, layout) - timeOf(b, layout));
  if (same.length <= 1) return label;
  const index = same.findIndex((b) => b.id === currentBox.id) + 1;
  return index > 0 ? `${label}-${index}` : label;
}

/**
 * Box の表示用タグ文字列を計算する
 * - 通常: 種別名（例: EFP, OPP）
 * - 複数ある場合:
 *   - EFP, P-EFP: "EFP" (1st), "2nd EFP", "3rd EFP"... (英語オーディナル)
 *   - OPP, BFP: "OPP-1", "OPP-2"... (ハイフン番号)
 *   - annotation: "潜在-1", "潜在-2"...
 *   - normal: 連番なし（ID で識別）
 *   - other: customTypeLabel（customTypeNumbered なら同名内で "-n"）
 * - 併記種別があれば " / " でつなぐ（例: "BFP-2 / OPP-1"）
 *
 * 採番は主種別・併記種別の両方を数え、同種別は時間軸順で並べる
 */
export function computeBoxDisplay(
  allBoxes: Box[],
  currentBox: Box,
  layout: LayoutDirection,
): string {
  const primary = currentBox.type === 'other'
    ? displayForOther(allBoxes, currentBox, layout)
    : displayForType(allBoxes, currentBox, currentBox.type, layout);
  const sec = currentBox.secondaryType;
  const secondary = sec && sec !== currentBox.type && SECONDARY_BOX_TYPES.includes(sec)
    ? displayForType(allBoxes, currentBox, sec, layout)
    : '';
  return [primary, secondary].filter((t) => t).join(' / ');
}

/**
 * SDSG（SD/SG）の表示用タグ文字列を計算する
 *  - 単一: "SD" / "SG"
 *  - 複数: "SD1", "SD2"... / "SG1", "SG2"... (時間軸順)
 *  - typeLabelNumbered=false: 連番を付けず "SD" / "SG"
 */
export function computeSDSGDisplay(
  allSDSGs: SDSG[],
  currentSDSG: SDSG,
  allBoxes: Box[],
  layout: LayoutDirection,
): string {
  const type = currentSDSG.type; // 'SD' | 'SG'

  if (currentSDSG.typeLabelNumbered === false) return type;

  // 同種別の SDSG を attached Box の時間軸位置で並べる
  const sameType = allSDSGs
    .filter((sg) => sg.type === type)
    .sort((a, b) => {
      const aBox = allBoxes.find((bx) => bx.id === a.attachedTo);
      const bBox = allBoxes.find((bx) => bx.id === b.attachedTo);
      const aT = aBox ? (layout === 'horizontal' ? aBox.x : aBox.y) : 0;
      const bT = bBox ? (layout === 'horizontal' ? bBox.x : bBox.y) : 0;
      if (aT !== bT) return aT - bT;
      return a.id.localeCompare(b.id);
    });

  if (sameType.length <= 1) return type;

  const index = sameType.findIndex((sg) => sg.id === currentSDSG.id) + 1;
  if (index <= 0) return type;
  return `${type}${index}`;
}

/**
 * Box の ID 採番用の「論理番号」を時間軸順で返す
 * （ID 生成時の次番号計算に使う参考情報）
 */
export function computeOrdinalNumber(
  allBoxes: Box[],
  currentBox: Box,
  layout: LayoutDirection,
): number {
  const sameType = allBoxes
    .filter((b) => b.type === currentBox.type)
    .sort((a, b) => {
      const aT = layout === 'horizontal' ? a.x : a.y;
      const bT = layout === 'horizontal' ? b.x : b.y;
      return aT - bT;
    });
  return sameType.findIndex((b) => b.id === currentBox.id) + 1;
}

// 再 export for convenience
export { toOrdinalEn };

/**
 * BoxType を受け取り、UI で選択可能な型のリスト（通常/BFP/EFP/P-EFP/OPP/潜在経験）
 * 2nd-EFP / P-2nd-EFP は内部のみ（EFP/P-EFP + オーディナルで代替）
 */
export const SELECTABLE_BOX_TYPES: BoxType[] = [
  'normal',
  'BFP',
  'EFP',
  'P-EFP',
  'OPP',
  'annotation',
  'other',
];
