// ============================================================================
// exportContent - 出力の前に「含めるか」を確かめる要素（メモ・記号・コメント・凡例・時期ラベル）
// - 図の出力（PPTX・SVG・PNG・PDF・印刷）の確認欄が使う（2026-10-30 ユーザー指示「チェック機構重要」）
// - 毎回すべて未選択から始め、図にある要素をすべて選ぶまで出力できない
// - 選んだ結果は applyExportContent で出力用の doc に当てる（プレビューにもそのまま出る）
// ============================================================================

import { produce } from 'immer';
import type { Sheet, TEMDocument } from '../types';

export type ExportContentKind = 'notes' | 'symbols' | 'comments' | 'legend' | 'periodLabels';

export type ExportContentChoices = Partial<Record<ExportContentKind, boolean>>;

export interface ExportContentItem {
  kind: ExportContentKind;
  label: string;
  /** 図にあるもの（選ばないと出力できない） */
  count: number;
  /** 図に描けないもの（コメント）。選べるのは「含めない」だけ */
  cannotDraw?: boolean;
  hint?: string;
}

export interface ExportContentReport {
  items: ExportContentItem[];
  /** 図に無いことへの注意（出力は止めない） */
  cautions: string[];
}

const isSymbolNote = (style?: string) => style === 'text';

/** 図にある「含めるか確かめる要素」と、無いことへの注意 */
export function detectExportContent(sheet: Sheet | undefined): ExportContentReport {
  const items: ExportContentItem[] = [];
  const cautions: string[] = [];
  if (!sheet) return { items, cautions };
  const notes = sheet.notes ?? [];
  const memo = notes.filter((n) => !isSymbolNote(n.style)).length;
  const symbols = notes.filter((n) => isSymbolNote(n.style)).length;
  if (memo > 0) items.push({ kind: 'notes', label: 'メモ（付箋・吹き出し）', count: memo, hint: '解釈や作業用のメモが図に残っていないか確かめてください' });
  if (symbols > 0) items.push({ kind: 'symbols', label: '記号（★・〇 など文字だけのメモ）', count: symbols, hint: '含めるなら、記号の意味を図の説明や本文で示してください' });
  const comments = sheet.comments?.length ?? 0;
  if (comments > 0) items.push({ kind: 'comments', label: 'コメント', count: comments, cannotDraw: true, hint: 'コメントは図には描けません（論文用レポートには載せられます）' });
  // 凡例は自動で作られるので、いつも確かめる
  items.push({ kind: 'legend', label: '凡例', count: 1, hint: '含めないなら、記号の意味を図の説明や本文で示してください' });
  if (sheet.periodLabels.length > 0) {
    items.push({ kind: 'periodLabels', label: '時期ラベル（時期区分）', count: sheet.periodLabels.length });
  } else {
    cautions.push('時期ラベル（時期区分）がありません。時期区分を示さないまま出力します。');
  }
  return { items, cautions };
}

/** すべての要素を選んだか（未選択が残っていれば、その表示名の一覧を返す） */
export function missingChoices(report: ExportContentReport, choices: ExportContentChoices): string[] {
  return report.items.filter((it) => choices[it.kind] === undefined).map((it) => it.label);
}

/** 凡例を含めないと選んだときの注意 */
export function choiceCautions(choices: ExportContentChoices): string[] {
  return choices.legend === false ? ['凡例を含めずに出力します。記号の意味を図の説明や本文で示してください。'] : [];
}

/**
 * 選んだ結果を出力用の doc に当てる。未選択の要素は元のまま（プレビュー用）。
 * 凡例・時期ラベルは「編集中の表示」と「出力に含める」の両方に入れる。
 * PNG・PDF はプレビューの表示（alwaysVisible）を画像にし、PPTX・SVG は includeInExport を見るため
 */
export function applyExportContent(doc: TEMDocument, choices: ExportContentChoices): TEMDocument {
  return produce(doc, (d) => {
    for (const sh of d.sheets) {
      if (!sh.notes) continue;
      sh.notes = sh.notes.filter((n) => {
        const keep = isSymbolNote(n.style) ? choices.symbols : choices.notes;
        return keep !== false;
      });
    }
    if (choices.legend !== undefined) {
      d.settings.legend.includeInExport = choices.legend;
      d.settings.legend.alwaysVisible = choices.legend;
    }
    if (choices.periodLabels !== undefined) {
      d.settings.periodLabels.includeInExport = choices.periodLabels;
      d.settings.periodLabels.alwaysVisible = choices.periodLabels;
    }
  });
}
