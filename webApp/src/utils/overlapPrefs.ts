// ============================================================================
// 重なりチェックの表示設定（利用者ごとの好みなので .tem には保存しない）
// localStorage が使えない環境でも既定値で動くようにしてある
// ============================================================================

import { DEFAULT_OVERLAP_CHECKS, type OverlapChecks } from './overlapDetect';

const CHECKS_KEY = 'temer:overlap-checks';
const STATUS_KEY = 'temer:overlap-status-bar';

export function loadOverlapChecks(): OverlapChecks {
  try {
    const raw = localStorage.getItem(CHECKS_KEY);
    if (!raw) return { ...DEFAULT_OVERLAP_CHECKS };
    const parsed = JSON.parse(raw) as Partial<OverlapChecks>;
    return { ...DEFAULT_OVERLAP_CHECKS, ...parsed };
  } catch {
    return { ...DEFAULT_OVERLAP_CHECKS };
  }
}

export function saveOverlapChecks(checks: OverlapChecks): void {
  try {
    localStorage.setItem(CHECKS_KEY, JSON.stringify(checks));
  } catch {
    // 保存できなくても動作は続ける
  }
}

/** ステータスバーに件数を常時表示するか。既定 false（編集のたびに再計算しない） */
export function loadOverlapStatusBar(): boolean {
  try {
    return localStorage.getItem(STATUS_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveOverlapStatusBar(on: boolean): void {
  try {
    localStorage.setItem(STATUS_KEY, on ? '1' : '0');
  } catch {
    // ignore
  }
}
