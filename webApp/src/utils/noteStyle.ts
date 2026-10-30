// ============================================================================
// メモ（Note）の寸法の定数。画面（NoteNode）と SVG / PPTX 出力で共用する
// ============================================================================

/** 付箋・吹き出しの内側の余白（px） */
export const NOTE_PADDING_PX = 6;
/** 「文字だけ」メモの内側の余白（px） */
export const NOTE_TEXT_PADDING_PX = 2;
/** 行の高さ（font-size に対する比）。画面で明示している値 */
export const NOTE_LINE_HEIGHT = 1.4;
/**
 * 画面のメモ（とその引き出し線）に付ける印。論文用レポートの図を画像にするとき、
 * メモ・記号を含めないと選んだものをこの印で除く（exportReport.ts）
 */
export const NOTE_MEMO_CLASS = 'temer-note-memo';
export const NOTE_SYMBOL_CLASS = 'temer-note-symbol';
export function noteKindClass(style?: string): string {
  return style === 'text' ? NOTE_SYMBOL_CLASS : NOTE_MEMO_CLASS;
}

/** 「文字だけ」メモで置きやすい記号（強調の後付け用） */
export const NOTE_SYMBOLS = ['★', '☆', '○', '●', '◎', '△', '▲', '□', '■', '◇', '◆', '※'];

/**
 * 「文字だけ」メモで記号パレットを押したときの本文。先頭の記号だけを入れ替え、後ろの文字は残す
 * （「★ 重要」→ ◎ を押す →「◎ 重要」）。先頭が記号でなければ記号を先頭に足す
 */
export function applySymbolToText(text: string, sym: string): string {
  const head = Array.from(text)[0];
  if (head && NOTE_SYMBOLS.includes(head)) return sym + text.slice(head.length);
  return text ? `${sym} ${text}` : sym;
}
