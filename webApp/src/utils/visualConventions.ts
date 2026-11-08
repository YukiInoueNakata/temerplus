// ============================================================================
// 表記方針（visualConventions）の意味度合いを扱うヘルパ
// - 3 択（意味あり / 緩やかに意味あり / 意味なし）を単一情報源で扱う
// - 旧 .tem（hasMeaning: boolean のみ）との相互運用もここに閉じ込める
// ============================================================================

import i18n from '../i18n';
import type { VisualConventionEntry, VisualConventionMeaning, VisualConventions } from '../types';

export type VisualConventionKey = Exclude<keyof VisualConventions, 'other'>;

/**
 * 表記方針の項目（論文 04_report_format.md Block 4 の表の順に並べる）。
 * 入力画面・論文報告の Word 出力・出力前の確認画面がこの一覧を使う。
 * 表の 12 行のうち「影・立体感の付与」は TEMer に影の機能が無いので入れない（2026-10-30 ユーザー決定）
 * 表示名と書き方の例は翻訳の表 locales/visualConventions.csv から引く（conventionItemLabel / conventionItemHint）。
 * 画面では画面の言語（lng を渡さない）、論文用レポートでは図の言語（doc.settings.locale）で引く
 */
export const VISUAL_CONVENTION_ITEMS: { key: VisualConventionKey; hasHint?: boolean }[] = [
  { key: 'horizontalLength' },
  { key: 'verticalPosition' },
  { key: 'arrowAngle' },
  { key: 'arrowLength' },
  { key: 'boxWidth', hasHint: true },
  { key: 'boxHeight', hasHint: true },
  { key: 'lineWeight' },
  { key: 'colors' },
  { key: 'boxShape' },
  { key: 'fontDecoration' },
  { key: 'textAlignment' },
];

export const CONVENTION_MEANINGS: VisualConventionMeaning[] = ['yes', 'loose', 'no'];

/** 表記方針の項目の表示名。lng を省くと画面の言語 */
export function conventionItemLabel(key: VisualConventionKey, lng?: string): string {
  return i18n.t(`visualConventions:item.${key}`, { lng });
}

/** 表記方針の項目の書き方の例（無い項目は undefined）。lng を省くと画面の言語 */
export function conventionItemHint(key: VisualConventionKey, lng?: string): string | undefined {
  const it = VISUAL_CONVENTION_ITEMS.find((x) => x.key === key);
  return it?.hasHint ? i18n.t(`visualConventions:hint.${key}`, { lng }) : undefined;
}

/** 意味の度合いの表示名（意味あり / 緩やかに意味あり / 意味なし）。lng を省くと画面の言語 */
export function conventionMeaningLabel(m: VisualConventionMeaning, lng?: string): string {
  return i18n.t(`visualConventions:meaning.${m}`, { lng });
}

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
