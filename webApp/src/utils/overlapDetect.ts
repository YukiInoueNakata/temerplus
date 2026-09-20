// ============================================================================
// 重なり検出
// - 図の要素どうしが視覚的に衝突している箇所を、座標から計算して列挙する
// - 4 種の検査を個別にオンオフできる:
//     labelLabel   ラベル類どうし / ラベルと図形の重なり
//     boxBox       Box・SD/SG の本体どうしの重なり
//     textOverflow Box の枠から本文がはみ出している
//     lineLabel    矢印がラベルや無関係な Box の上を通っている
// - 判定は elementRects の矩形が土台。描画 DOM に依存しないので、
//   画面に出ていないシートでも、テストからでも同じ結果が出る
// ============================================================================

import type { Sheet, ProjectSettings, LayoutDirection } from '../types';
import {
  collectElementRects,
  collectLineSegments,
  type ElementPart,
  type ElementRect,
  type Rect,
} from './elementRects';
import { canvasMeasurer, type TextMeasurer } from './textMeasure';
import type { Pt } from './linePath';

export type OverlapCheck = 'labelLabel' | 'boxBox' | 'textOverflow' | 'lineLabel';

export type OverlapChecks = Record<OverlapCheck, boolean>;

export const DEFAULT_OVERLAP_CHECKS: OverlapChecks = {
  labelLabel: true,
  boxBox: true,
  textOverflow: true,
  lineLabel: true,
};

export const OVERLAP_CHECK_LABELS: Record<OverlapCheck, string> = {
  labelLabel: 'ラベル類の重なり',
  boxBox: 'Box 同士の重なり',
  textOverflow: 'テキストのはみ出し',
  lineLabel: '矢印とラベルの衝突',
};

export interface OverlapTarget {
  id: string;
  part: ElementPart | 'line';
  text?: string;
}

export interface OverlapIssue {
  kind: OverlapCheck;
  /** 人が読む説明。結果一覧にそのまま出す */
  message: string;
  /** 関係する要素（1〜2 件）。クリックで選択・ジャンプするのに使う */
  targets: OverlapTarget[];
  /** 重なりの大きさ（px^2）。並べ替えの基準。はみ出しははみ出し量の面積 */
  amount: number;
  /** 画面をそこへ寄せるための領域 */
  focusRect: Rect;
}

export interface DetectOptions {
  checks?: Partial<OverlapChecks>;
  measure?: TextMeasurer;
  /** これ未満の重なりは無視する（px）。既定 2 */
  tolerance?: number;
}

// ----------------------------------------------------------------------------
// 幾何
// ----------------------------------------------------------------------------

function intersection(a: Rect, b: Rect): Rect | null {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  if (x2 <= x1 || y2 <= y1) return null;
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

function union(a: Rect, b: Rect): Rect {
  const x1 = Math.min(a.x, b.x);
  const y1 = Math.min(a.y, b.y);
  const x2 = Math.max(a.x + a.width, b.x + b.width);
  const y2 = Math.max(a.y + a.height, b.y + b.height);
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

/** 線分が矩形と交差するか（端点が内側にある場合も含む） */
export function segmentIntersectsRect(p: Pt, q: Pt, r: Rect): boolean {
  const inside = (pt: Pt) =>
    pt.x >= r.x && pt.x <= r.x + r.width && pt.y >= r.y && pt.y <= r.y + r.height;
  if (inside(p) || inside(q)) return true;

  const edges: Array<[Pt, Pt]> = [
    [{ x: r.x, y: r.y }, { x: r.x + r.width, y: r.y }],
    [{ x: r.x + r.width, y: r.y }, { x: r.x + r.width, y: r.y + r.height }],
    [{ x: r.x + r.width, y: r.y + r.height }, { x: r.x, y: r.y + r.height }],
    [{ x: r.x, y: r.y + r.height }, { x: r.x, y: r.y }],
  ];
  return edges.some(([a, b]) => segmentsCross(p, q, a, b));
}

function cross(o: Pt, a: Pt, b: Pt): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function segmentsCross(p1: Pt, p2: Pt, p3: Pt, p4: Pt): boolean {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** 矩形を四方に縮める（許容量の分だけ甘く判定する） */
function shrink(r: Rect, by: number): Rect {
  return { x: r.x + by, y: r.y + by, width: r.width - by * 2, height: r.height - by * 2 };
}

// ----------------------------------------------------------------------------
// 検出
// ----------------------------------------------------------------------------

/** ラベルとして扱う部位（枠の外に出て他とぶつかり得るもの） */
const LABEL_PARTS: ElementPart[] = ['typeLabel', 'subLabel', 'periodLabel', 'timeArrowLabel', 'legend'];
/** 本体として扱う部位 */
const BODY_PARTS: ElementPart[] = ['box', 'sdsg'];

const PART_NAMES: Record<ElementPart | 'line', string> = {
  box: 'Box',
  boxLabel: '本文',
  subLabel: 'サブラベル',
  typeLabel: '種別ラベル',
  sdsg: 'SD/SG',
  periodLabel: '時期ラベル',
  timeArrowLabel: '時間軸ラベル',
  legend: '凡例',
  line: '矢印',
};

function describe(r: ElementRect): string {
  const name = PART_NAMES[r.part];
  const text = (r.text ?? '').replace(/\s+/g, ' ').trim();
  const short = text.length > 16 ? `${text.slice(0, 16)}…` : text;
  return short ? `${r.id} の${name}「${short}」` : `${r.id} の${name}`;
}

export function detectOverlaps(
  sheet: Sheet,
  layout: LayoutDirection,
  settings: ProjectSettings,
  options: DetectOptions = {},
): OverlapIssue[] {
  const checks: OverlapChecks = { ...DEFAULT_OVERLAP_CHECKS, ...(options.checks ?? {}) };
  const tolerance = options.tolerance ?? 2;
  const measure = options.measure ?? canvasMeasurer;
  const rects = collectElementRects(sheet, layout, settings, measure);
  const issues: OverlapIssue[] = [];

  const bodies = rects.filter((r) => BODY_PARTS.includes(r.part));
  const labels = rects.filter((r) => LABEL_PARTS.includes(r.part));

  // --- テキストのはみ出し ---
  if (checks.textOverflow) {
    rects.forEach((r) => {
      if (r.part !== 'boxLabel' || !r.overflow) return;
      const { x, y } = r.overflow;
      if (x <= tolerance && y <= tolerance) return;
      const dirs: string[] = [];
      if (x > tolerance) dirs.push(`横に ${Math.round(x)}px`);
      if (y > tolerance) dirs.push(`縦に ${Math.round(y)}px`);
      issues.push({
        kind: 'textOverflow',
        message: `${r.id} の本文が枠から${dirs.join('・')}はみ出しています`,
        targets: [{ id: r.id, part: 'boxLabel', text: r.text }],
        amount: Math.max(x, 0) * Math.max(y, 1) + Math.max(y, 0),
        focusRect: r.rect,
      });
    });
  }

  // --- ラベル類の重なり（ラベル×ラベル / ラベル×本体）---
  if (checks.labelLabel) {
    const pairs: Array<[ElementRect, ElementRect]> = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) pairs.push([labels[i], labels[j]]);
      bodies.forEach((b) => pairs.push([labels[i], b]));
    }
    pairs.forEach(([a, b]) => {
      // 同じ要素に属する部位どうしは対象外（設計上そもそも離して置いている）
      if (a.id === b.id) return;
      const hit = intersection(shrink(a.rect, tolerance / 2), shrink(b.rect, tolerance / 2));
      if (!hit) return;
      issues.push({
        kind: 'labelLabel',
        message: `${describe(a)} と ${describe(b)} が重なっています`,
        targets: [
          { id: a.id, part: a.part, text: a.text },
          { id: b.id, part: b.part, text: b.text },
        ],
        amount: hit.width * hit.height,
        focusRect: union(a.rect, b.rect),
      });
    });
  }

  // --- 本体どうしの重なり ---
  if (checks.boxBox) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const hit = intersection(shrink(a.rect, tolerance / 2), shrink(b.rect, tolerance / 2));
        if (!hit) continue;
        issues.push({
          kind: 'boxBox',
          message: `${describe(a)} と ${describe(b)} が重なっています`,
          targets: [
            { id: a.id, part: a.part, text: a.text },
            { id: b.id, part: b.part, text: b.text },
          ],
          amount: hit.width * hit.height,
          focusRect: union(a.rect, b.rect),
        });
      }
    }
  }

  // --- 矢印とラベル / 無関係な Box の衝突 ---
  if (checks.lineLabel) {
    const segments = collectLineSegments(sheet, layout);
    const lineById = new Map(sheet.lines.map((l) => [l.id, l]));
    segments.forEach(({ id, points }) => {
      const line = lineById.get(id);
      const endpoints = new Set([line?.from, line?.to].filter(Boolean) as string[]);
      const candidates = [
        ...labels,
        // 始点・終点の Box は通って当然なので除く
        ...bodies.filter((b) => !endpoints.has(b.id)),
      ];
      candidates.forEach((target) => {
        const r = shrink(target.rect, tolerance / 2);
        if (r.width <= 0 || r.height <= 0) return;
        let hit = false;
        for (let k = 0; k + 1 < points.length && !hit; k++) {
          if (segmentIntersectsRect(points[k], points[k + 1], r)) hit = true;
        }
        if (!hit) return;
        issues.push({
          kind: 'lineLabel',
          message: `矢印 ${id} が ${describe(target)} の上を通っています`,
          targets: [
            { id, part: 'line' },
            { id: target.id, part: target.part, text: target.text },
          ],
          amount: target.rect.width * target.rect.height,
          focusRect: target.rect,
        });
      });
    });
  }

  // 大きい重なりから順に
  return issues.sort((a, b) => b.amount - a.amount);
}

/** 検査種別ごとの件数 */
export function countByKind(issues: OverlapIssue[]): Record<OverlapCheck, number> {
  const out: Record<OverlapCheck, number> = { labelLabel: 0, boxBox: 0, textOverflow: 0, lineLabel: 0 };
  issues.forEach((i) => { out[i.kind] += 1; });
  return out;
}
