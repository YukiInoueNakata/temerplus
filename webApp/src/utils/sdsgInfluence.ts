// ============================================================================
// 幅を持つ SD/SG の「影響線」
// - between モードで四角形にした SD/SG から、影響先の各 Box へ太い矢印を 1 本ずつ引く
//   （2026-09-20 ユーザー判断: 案 X）
// - 線分は SD/SG の枠の縁から Box の枠の縁まで（中心どうしを結ぶ直線を両端でクリップ）
// - キャンバス（オーバーレイ）/ SVG / PPTX で同じ計算を使う
// ============================================================================

import type { Sheet, ProjectSettings, LayoutDirection, SDSG } from '../types';
import { collectSDSGRects, type Rect } from './elementRects';

export const DEFAULT_INFLUENCE_STROKE_WIDTH = 3;

export interface InfluenceSegment {
  sdsgId: string;
  boxId: string;
  x1: number; y1: number;   // SD/SG 側（始点）
  x2: number; y2: number;   // Box 側（終点・矢頭）
  strokeWidth: number;
  color: string;
}

/**
 * 矩形の中心から方向 (dx, dy) に進んだとき、矩形の縁と交わる点を返す。
 * dx = dy = 0 なら中心を返す。
 */
export function rectEdgePoint(r: Rect, dx: number, dy: number): { x: number; y: number } {
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const hw = r.width / 2;
  const hh = r.height / 2;
  // 縁までの倍率: x 方向と y 方向で小さい方が先に当たる
  const tx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
  const ty = dy !== 0 ? hh / Math.abs(dy) : Infinity;
  const k = Math.min(tx, ty);
  return { x: cx + dx * k, y: cy + dy * k };
}

/** SD/SG の矩形と Box の矩形を結ぶ線分（両端を縁でクリップ） */
export function influenceSegment(from: Rect, to: Rect): { x1: number; y1: number; x2: number; y2: number } | null {
  const dx = (to.x + to.width / 2) - (from.x + from.width / 2);
  const dy = (to.y + to.height / 2) - (from.y + from.height / 2);
  if (dx === 0 && dy === 0) return null;
  const p = rectEdgePoint(from, dx, dy);
  const q = rectEdgePoint(to, -dx, -dy);
  // 矩形が重なっていて始点が終点を追い越す場合は描かない
  if ((q.x - p.x) * dx + (q.y - p.y) * dy <= 0) return null;
  return { x1: p.x, y1: p.y, x2: q.x, y2: q.y };
}

/** SD/SG が影響線を持つか */
export function hasInfluence(sg: SDSG): boolean {
  return Array.isArray(sg.influenceTargets) && sg.influenceTargets.length > 0;
}

/**
 * シート内の全 SD/SG について影響線を計算する。
 * 影響先に存在しない Box が指定されていれば黙って飛ばす（Box 削除後の残骸を許容）。
 */
export function collectInfluenceSegments(
  sheet: Sheet,
  layout: LayoutDirection,
  settings: ProjectSettings,
): InfluenceSegment[] {
  const withInfluence = sheet.sdsg.filter(hasInfluence);
  if (withInfluence.length === 0) return [];
  const rects = collectSDSGRects(sheet, layout, settings);
  const boxById = new Map(sheet.boxes.map((b) => [b.id, b]));
  const out: InfluenceSegment[] = [];
  withInfluence.forEach((sg) => {
    const own = rects.find((r) => r.sdsg.id === sg.id);
    if (!own) return;
    const strokeWidth = sg.influenceStrokeWidth ?? DEFAULT_INFLUENCE_STROKE_WIDTH;
    const color = sg.style?.borderColor ?? '#333';
    (sg.influenceTargets ?? []).forEach((boxId) => {
      const box = boxById.get(boxId);
      if (!box) return;
      const seg = influenceSegment(own.rect, { x: box.x, y: box.y, width: box.width, height: box.height });
      if (!seg) return;
      out.push({ sdsgId: sg.id, boxId, ...seg, strokeWidth, color });
    });
  });
  return out;
}
