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
 *   以前は PPTX・SVG がテーマの線種・太さを見ずに種別で決め打ちしており、画面と食い違っていた
 *   （記号の簡素化方式＝線種を実在性だけに使うテーマ を入れたときに判明。2026-10-30）
 */
export type BoxBorderDraw =
  | { kind: 'factory' }
  | { kind: 'single'; style: 'solid' | 'dashed' | 'dotted'; width: number }
  | { kind: 'double'; width: number };

export function resolveBoxBorderDraw(box: Box, settings: ProjectSettings): BoxBorderDraw {
  const p = getBoxPreset(box.type, settings);
  if (p.borderStyle === undefined && p.borderWidth === undefined) return { kind: 'factory' };
  const v = resolveBoxVisuals(box, settings);
  if (v.borderStyle === 'double') return { kind: 'double', width: v.borderWidth };
  return { kind: 'single', style: v.borderStyle, width: v.borderWidth };
}
