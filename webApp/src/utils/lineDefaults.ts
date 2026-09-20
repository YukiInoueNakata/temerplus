// ============================================================================
// Line（矢印）の既定スタイル
// - 工場出荷値（各描画箇所にハードコードされていた値）を 1 か所に集約する
// - settings.lineDefaults が未定義でも必ず解決できるようにし、旧 .tem の
//   後方互換を取る（visualConventions の resolve と同じ考え方）
// ============================================================================

import type { Line, LineDefaults, ProjectSettings } from '../types';

/**
 * 工場出荷値。Canvas / ExportPreviewCanvas / exportPPT / exportSVGNative が
 * `l.style?.color ?? '#222'` のように持っていた既定値と一致させてある。
 */
export const FACTORY_LINE_DEFAULTS: Required<LineDefaults> = {
  type: 'RLine',
  shape: 'straight',
  color: '#222',
  strokeWidth: 1.5,
  startOffsetTime: 0,
  startOffsetItem: 0,
  endOffsetTime: 0,
  endOffsetItem: 0,
  startMargin: 0,
  endMargin: 0,
  angleMode: false,
  angleDeg: 0,
  elbowBendRatio: 0.5,
  curveIntensity: 0.5,
};

/** settings.lineDefaults を工場出荷値で埋めて解決する。未設定でも必ず全項目が揃う。 */
export function resolveLineDefaults(settings?: Pick<ProjectSettings, 'lineDefaults'>): Required<LineDefaults> {
  const d = settings?.lineDefaults;
  if (!d) return { ...FACTORY_LINE_DEFAULTS };
  const pick = <K extends keyof LineDefaults>(key: K): Required<LineDefaults>[K] =>
    (d[key] ?? FACTORY_LINE_DEFAULTS[key]) as Required<LineDefaults>[K];
  return {
    type: pick('type'),
    shape: pick('shape'),
    color: pick('color'),
    strokeWidth: pick('strokeWidth'),
    startOffsetTime: pick('startOffsetTime'),
    startOffsetItem: pick('startOffsetItem'),
    endOffsetTime: pick('endOffsetTime'),
    endOffsetItem: pick('endOffsetItem'),
    startMargin: pick('startMargin'),
    endMargin: pick('endMargin'),
    angleMode: pick('angleMode'),
    angleDeg: pick('angleDeg'),
    elbowBendRatio: pick('elbowBendRatio'),
    curveIntensity: pick('curveIntensity'),
  };
}

export interface LineDefaultsPatchOptions {
  /** 線種（RLine / XLine）も揃える。既定 false＝実線/点線の区別を壊さない */
  includeType?: boolean;
}

/**
 * 既定スタイルを Line への patch に変換する。
 * 線種は既定では含めない（一括適用で実現径路/未実現径路の区別が消えるのを防ぐため）。
 */
export function lineDefaultsToPatch(
  d: Required<LineDefaults>,
  options: LineDefaultsPatchOptions = {},
): Partial<Line> {
  const patch: Partial<Line> = {
    shape: d.shape,
    style: { color: d.color, strokeWidth: d.strokeWidth },
    startOffsetTime: d.startOffsetTime,
    startOffsetItem: d.startOffsetItem,
    endOffsetTime: d.endOffsetTime,
    endOffsetItem: d.endOffsetItem,
    startMargin: d.startMargin,
    endMargin: d.endMargin,
    angleMode: d.angleMode,
    angleDeg: d.angleDeg,
    elbowBendRatio: d.elbowBendRatio,
    curveIntensity: d.curveIntensity,
  };
  if (options.includeType) patch.type = d.type;
  return patch;
}
