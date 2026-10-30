// ============================================================================
// 表記方針（visualConventions）の意味度合いを扱うヘルパ
// - 3 択（意味あり / 緩やかに意味あり / 意味なし）を単一情報源で扱う
// - 旧 .tem（hasMeaning: boolean のみ）との相互運用もここに閉じ込める
// ============================================================================

import type { VisualConventionEntry, VisualConventionMeaning, VisualConventions } from '../types';

export type VisualConventionKey = Exclude<keyof VisualConventions, 'other'>;

/**
 * 表記方針の項目（論文 04_report_format.md Block 4 の 9 項目・この順に並べる）。
 * 入力画面・論文報告の Word 出力・出力前の確認画面がこの一覧を使う
 */
export const VISUAL_CONVENTION_ITEMS: { key: VisualConventionKey; label: string; hint?: string }[] = [
  { key: 'horizontalLength', label: '横軸（時間軸）の間隔' },
  { key: 'verticalPosition', label: '縦軸（並置軸）の位置' },
  { key: 'arrowAngle', label: '矢印の角度' },
  { key: 'arrowLength', label: '矢印の距離（長さ）' },
  { key: 'boxWidth', label: 'Box の横幅', hint: '時間軸上の位置を Box のどこで読むか（左辺・中心など）も書く' },
  { key: 'boxHeight', label: 'Box の高さ', hint: '文字量に合わせた（テキスト駆動）か意味を持たせた（意味駆動）か、比べるときの基準（中心など）も書く' },
  { key: 'lineWeight', label: '線の太さ' },
  { key: 'colors', label: '色の使用（塗り・枠線・文字）' },
  { key: 'boxShape', label: 'Box の形状（角丸・直角・楕円）' },
];

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
