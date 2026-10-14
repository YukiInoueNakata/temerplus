// ============================================================================
// まとめ枠（Box.isGroup）の共通処理（画面・出力・重なり検出で共用）
// ============================================================================

import type { Box, Note } from '../types';

interface RectLike { x: number; y: number; width: number; height: number }

/** inner が outer の中に収まっているか（端の接触を含む） */
export function rectInside(inner: RectLike, outer: RectLike): boolean {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height;
}

/** まとめ枠の中にある Box（ほかのまとめ枠も含む）とメモ */
export function itemsInsideGroup(group: Box, boxes: Box[], notes: Note[] = []): { boxIds: string[]; noteIds: string[] } {
  return {
    boxIds: boxes.filter((b) => b.id !== group.id && rectInside(b, group)).map((b) => b.id),
    noteIds: notes.filter((n) => rectInside(n, group)).map((n) => n.id),
  };
}

/** 描画順: まとめ枠を先に（背面）。まとめ枠どうしは大きい順（外側の枠を奥に） */
export function boxesInPaintOrder(boxes: Box[]): Box[] {
  const groups = boxes.filter((b) => b.isGroup).sort((a, b) => b.width * b.height - a.width * a.height);
  return [...groups, ...boxes.filter((b) => !b.isGroup)];
}
