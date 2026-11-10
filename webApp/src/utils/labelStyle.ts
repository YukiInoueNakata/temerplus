// ============================================================================
// 論文用レポートの結果の節で、図の要素のラベルを括る括弧と書く順（2026-11-10 ユーザー要望）
// 画面（PaperReportDialog）と Word の組み立て（exportReport）の両方が使う。exportReport は重いので
// 画面からは読み込みのときまで import しない。そのため型と一覧をこの小さなファイルに分けた
// ============================================================================

/** ラベルを括る括弧（既定 'auto'＝日本語【…】・英語⟨…⟩。2026-11-10 に日本語を〈〉から調べで最も多かった【】へ）。'auto' は図の言語の既定（翻訳の表 label.wrap。日本語〈…〉・英語⟨…⟩） */
export type LabelBracket = 'auto' | '〈〉' | '【】' | '「」' | '《》' | '［］' | '『』' | '＜＞' | '“”';
export const LABEL_BRACKETS: LabelBracket[] = ['auto', '【】', '〈〉', '「」', '［］', '“”', '『』', '《》', '＜＞'];
/** ID（記号）とラベルの順。'id-first' は BFP1〈…〉、'label-first' は〈…〉（BFP1） */
export type LabelOrder = 'id-first' | 'label-first';
export interface LabelStyle {
  /** Box・時期・径路のラベル */
  box: LabelBracket;
  /** SD・SG のラベル（論文によっては Box と別の括弧を使う） */
  sdsg: LabelBracket;
  order: LabelOrder;
}
export const DEFAULT_LABEL_STYLE: LabelStyle = { box: 'auto', sdsg: 'auto', order: 'id-first' };
