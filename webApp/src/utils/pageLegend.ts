// 複数ページの各ページの凡例に載せる種類を、そのページで実際に描くものから決める（2026-11-07）。
// 以前は「両端の Box がこのページにある矢印」「付いている Box がこのページにある SD/SG」だけを見ており、
// 境目をまたぐ矢印や矢印に付けた SD/SG が凡例から抜けた。PPTX は逆に全矢印を見て、無い種類まで載せた。
import type { LayoutDirection, ProjectSettings, Sheet } from '../types';
import { collectSDSGRects } from './elementRects';

type Rect = { x: number; y: number; width: number; height: number };

const overlap = (a: Rect, b: Rect) =>
  a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height;

export function legendSheetForClip(sheet: Sheet, clip: Rect, layout: LayoutDirection, settings: ProjectSettings): Sheet {
  const isH = layout !== 'vertical';
  const boxes = sheet.boxes.filter((b) => overlap({ x: b.x, y: b.y, width: b.width, height: b.height }, clip));
  const byId = new Map(sheet.boxes.map((b) => [b.id, b]));
  const c0 = isH ? clip.x : clip.y;
  const c1 = c0 + (isH ? clip.width : clip.height);
  const lines = sheet.lines.filter((l) => {
    const f = byId.get(l.from);
    const t = byId.get(l.to);
    if (!f || !t) return false;
    // 両端の Box と曲線の制御点の範囲（曲線だけが隣のページへ張り出す場合も入れる）
    const cps = (l.controlPoints ?? []).map((p) => (isH ? p.x : p.y));
    const s = Math.min(isH ? f.x : f.y, isH ? t.x : t.y, ...cps);
    const e = Math.max(isH ? f.x + f.width : f.y + f.height, isH ? t.x + t.width : t.y + t.height, ...cps);
    return s <= c1 && e >= c0;
  });
  const onPage = new Set(collectSDSGRects(sheet, layout, settings).filter((r) => overlap(r.rect, clip)).map((r) => r.sdsg.id));
  const sdsg = sheet.sdsg.filter((s) => onPage.has(s.id));
  return { ...sheet, boxes, lines, sdsg };
}
