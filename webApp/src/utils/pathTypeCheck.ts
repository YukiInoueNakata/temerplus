// ============================================================================
// 径路の線種と Box の種別の食い違いを見つける（2026-11-10 ユーザー要望）
// - 点線の径路（XLine）でしかつながっていない通常の Box は、実現しなかった潜在経験のはず → 潜在経験にするよう促す
// - 潜在経験の Box に実線の径路（RLine）がつながっている → 実現した経験なので通常にするよう促す
// 種別は自動では変えない（線を引く途中で一時的に点線だけになることがあり、意図して通常のままにする使い方もあるため）。
// 「このままにする」を選んだ Box（pathTypeCheckIgnored）は知らせない
// ============================================================================

import type { Box, Line } from '../types';

export type PathTypeIssue = 'dashedOnly' | 'latentOnSolid';

/** 図の上の「!」の印の class。出力（exportImage の buildFilter）ではこの class の要素を除く */
export const PATH_TYPE_BADGE_CLASS = 'temer-path-type-badge';

/** 1 つの Box について食い違いを返す（無ければ null）。lines はその Box が載っているシートの Line */
export function pathTypeIssueFor(box: Box, lines: readonly Line[]): PathTypeIssue | null {
  if (box.pathTypeCheckIgnored || box.isGroup) return null;
  if (box.type !== 'normal' && box.type !== 'annotation') return null;
  let solid = 0;
  let dashed = 0;
  for (const l of lines) {
    if (l.from !== box.id && l.to !== box.id) continue;
    if (l.type === 'XLine') dashed += 1;
    else solid += 1;
  }
  if (box.type === 'normal' && dashed > 0 && solid === 0) return 'dashedOnly';
  if (box.type === 'annotation' && solid > 0) return 'latentOnSolid';
  return null;
}

/** シートの中の食い違いを Box の ID ごとに返す */
export function findPathTypeIssues(sheet: { boxes: readonly Box[]; lines: readonly Line[] }): Map<string, PathTypeIssue> {
  const out = new Map<string, PathTypeIssue>();
  for (const b of sheet.boxes) {
    const issue = pathTypeIssueFor(b, sheet.lines);
    if (issue) out.set(b.id, issue);
  }
  return out;
}

/** 食い違いを直すときの種別（dashedOnly → 潜在経験、latentOnSolid → 通常） */
export function suggestedTypeFor(issue: PathTypeIssue): 'annotation' | 'normal' {
  return issue === 'dashedOnly' ? 'annotation' : 'normal';
}
