// ============================================================================
// Box タイプ別プリセットの解決（動的マージ）
// - 優先順位: box 個別値 > settings.boxTypePresets[type] > BOX_RENDER_SPECS[type]
// - 描画・エクスポート時に呼び出して、各プロパティの実効値を決める
// ============================================================================

import type { Box, BoxType, BoxTypePreset, ProjectSettings } from '../types';
import { BOX_RENDER_SPECS } from '../store/defaults';

/**
 * Box タイプに対応するプリセット（ユーザ設定）を取得。未設定なら空オブジェクト。
 */
export function getBoxPreset(type: BoxType, settings: ProjectSettings): BoxTypePreset {
  return settings.boxTypePresets?.[type] ?? {};
}

/**
 * 工場出荷時の spec を取得。
 */
export function getBoxFactorySpec(type: BoxType) {
  return BOX_RENDER_SPECS[type] ?? BOX_RENDER_SPECS.normal;
}

/**
 * 描画用に解決された値をまとめて返す。
 * 未指定項目は undefined にして呼び出し側の既定フォールバックに委ねる
 * （= 例: '#222' や '#ffffff'）。
 */
export interface ResolvedBoxVisuals {
  // 構造
  borderStyle: 'solid' | 'double' | 'dashed' | 'dotted';
  borderWidth: number;
  shape: 'rect' | 'ellipse';
  // 本体
  backgroundColor: string | undefined;
  borderColor: string | undefined;
  color: string | undefined;
  fontSize: number | undefined;
  bold: boolean | undefined;
  italic: boolean | undefined;
  fontFamily: string | undefined;
  // タイプラベル
  typeLabelColor: string | undefined;
  typeLabelBackgroundColor: string | undefined;
  typeLabelBorderColor: string | undefined;
  typeLabelBorderWidth: number | undefined;
  // サブラベル
  subLabelColor: string | undefined;
  subLabelBackgroundColor: string | undefined;
  subLabelBorderColor: string | undefined;
  subLabelBorderWidth: number | undefined;
}

export function resolveBoxVisuals(box: Box, settings: ProjectSettings): ResolvedBoxVisuals {
  const preset = getBoxPreset(box.type, settings);
  const factory = getBoxFactorySpec(box.type);
  return {
    // 構造: preset → factory（box.shape は既存ロジックが優先するので shape のみ box 優先も考慮）
    borderStyle: preset.borderStyle ?? factory.borderStyle,
    borderWidth: preset.borderWidth ?? factory.borderWidth,
    shape: box.shape ?? preset.shape ?? factory.defaultShape,
    // 本体: box.style → preset → undefined
    backgroundColor: box.style?.backgroundColor ?? preset.backgroundColor,
    borderColor: box.style?.borderColor ?? preset.borderColor,
    color: box.style?.color ?? preset.color,
    fontSize: box.style?.fontSize ?? preset.fontSize,
    bold: box.style?.bold ?? preset.bold,
    italic: box.style?.italic ?? preset.italic,
    fontFamily: box.style?.fontFamily ?? preset.fontFamily,
    // タイプラベル
    typeLabelColor: box.typeLabelColor ?? preset.typeLabelColor,
    typeLabelBackgroundColor: box.typeLabelBackgroundColor ?? preset.typeLabelBackgroundColor,
    typeLabelBorderColor: box.typeLabelBorderColor ?? preset.typeLabelBorderColor,
    typeLabelBorderWidth: box.typeLabelBorderWidth ?? preset.typeLabelBorderWidth,
    // サブラベル
    subLabelColor: box.subLabelColor ?? preset.subLabelColor,
    subLabelBackgroundColor: box.subLabelBackgroundColor ?? preset.subLabelBackgroundColor,
    subLabelBorderColor: box.subLabelBorderColor ?? preset.subLabelBorderColor,
    subLabelBorderWidth: box.subLabelBorderWidth ?? preset.subLabelBorderWidth,
  };
}

/**
 * Box の枠の描き方（画面・PPTX・SVG で共通）。
 * - 'factory': テーマ（boxTypePresets）で線種も太さも指定していない。種別ごとの既定の描き方
 *   （EFP の二重線・P-EFP の二重の点線など）をそのまま使う
 * - 'single' / 'double': テーマの指定どおりに描く。
 * - 'double-dashed': P-EFP・P-2nd EFP をテーマが点線と指定したとき。従来どおり二重の点線で描く。
 *   テーマが singleLine を付けたとき（記号の簡素化方式）だけ点線 1 本（'single'）にする（2026-11-07 レビュー #3）
 *   以前は PPTX・SVG がテーマの線種・太さを見ずに種別で決め打ちしており、画面と食い違っていた
 *   （記号の簡素化方式＝線種を実在性だけに使うテーマ を入れたときに判明。2026-10-30）
 */
export type BoxBorderDraw =
  | { kind: 'factory' }
  | { kind: 'single'; style: 'solid' | 'dashed' | 'dotted'; width: number }
  | { kind: 'double'; width: number }
  | { kind: 'double-dashed'; width: number };

/**
 * 凡例の見本の枠。図の Box と同じくテーマの線種に従う（以前は種別の既定で決め打ちしており、
 * 簡素化方式でも EFP が二重線の見本になって図と食い違った。レビュー #5）
 */
export function legendBorderDraw(key: string, settings: ProjectSettings | undefined): BoxBorderDraw {
  if (!settings) return { kind: 'factory' };
  return resolveBoxBorderDraw({ type: key as BoxType } as Box, settings);
}

/**
 * 二重線を 2 本の線で描くときの 1 本の太さ（CSS の double と同じく、指定の太さの 3 分の 1。最低 1）。
 * 以前は PPTX・SVG で太さ 1 に決め打ちしており、テーマで太くしても細いままだった（レビュー #7）
 */
export function doubleStrokeWidth(totalWidth: number): number {
  return Math.max(1, totalWidth / 3);
}

export function resolveBoxBorderDraw(box: Box, settings: ProjectSettings): BoxBorderDraw {
  const p = getBoxPreset(box.type, settings);
  if (p.borderStyle === undefined && p.borderWidth === undefined) return { kind: 'factory' };
  const v = resolveBoxVisuals(box, settings);
  if (v.borderStyle === 'double') return { kind: 'double', width: v.borderWidth };
  const isPEfp = box.type === 'P-EFP' || box.type === 'P-2nd-EFP';
  if (isPEfp && v.borderStyle === 'dashed' && !p.singleLine) return { kind: 'double-dashed', width: v.borderWidth };
  return { kind: 'single', style: v.borderStyle, width: v.borderWidth };
}
