// ============================================================================
// 表記方針（visualConventions）の意味度合いを扱うヘルパ
// - 3 択（意味あり / 緩やかに意味あり / 意味なし）を単一情報源で扱う
// - 旧 .tem（hasMeaning: boolean のみ）との相互運用もここに閉じ込める
// ============================================================================

import type { VisualConventionEntry, VisualConventionMeaning } from '../types';

export const CONVENTION_MEANINGS: VisualConventionMeaning[] = ['yes', 'loose', 'no'];

export const CONVENTION_MEANING_LABELS: Record<VisualConventionMeaning, string> = {
  yes: '意味あり',
  loose: '緩やかに意味あり',
  no: '意味なし',
};

/**
 * エントリから意味の度合いを解決する。
 * meaning が最優先。無ければ旧 hasMeaning から導出し、どちらも無ければ 'no'。
 */
export function resolveConventionMeaning(ent?: VisualConventionEntry): VisualConventionMeaning {
  if (!ent) return 'no';
  if (ent.meaning === 'yes' || ent.meaning === 'loose' || ent.meaning === 'no') return ent.meaning;
  return ent.hasMeaning ? 'yes' : 'no';
}

/** 意味づけがある（説明文を書く対象）か。'yes' と 'loose' が該当する。 */
export function hasConventionMeaning(ent?: VisualConventionEntry): boolean {
  return resolveConventionMeaning(ent) !== 'no';
}

/**
 * 意味の度合いを設定したエントリを作る。
 * 旧バージョンが読んでも破綻しないよう hasMeaning も同時に更新する。
 */
export function setConventionMeaning(
  ent: VisualConventionEntry | undefined,
  meaning: VisualConventionMeaning,
): VisualConventionEntry {
  return {
    ...(ent ?? {}),
    meaning,
    hasMeaning: meaning !== 'no',
  };
}
