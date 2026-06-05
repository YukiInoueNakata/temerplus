// ============================================================================
// txt パーサ
// - 空行で段落を区切る
// - 段落内の改行は保持
// - 段落先頭から話者表記を検出して speaker フィールドへ
// ============================================================================

import { detectSpeaker } from './speaker';
import { genParagraphId } from '../../store/defaults';
import type { Paragraph } from '../../types';

export function parseTxt(text: string): Paragraph[] {
  // 改行コード正規化
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // 連続する空行で段落分割（1 つ以上の空行）
  const rawParagraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // 空行が全く無いファイルの場合は 1 段落 1 行として行ベース分割にフォールバック
  if (rawParagraphs.length <= 1 && /\n/.test(normalized)) {
    const lines = normalized.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    return lines.map((line, i) => {
      const { speaker, text: body } = detectSpeaker(line);
      return {
        id: genParagraphId(),
        index: i,
        speaker,
        text: body,
      };
    });
  }

  return rawParagraphs.map((p, i) => {
    // 段落の最初の行に話者表記があれば抽出し、残りは段落本文
    const firstNewline = p.indexOf('\n');
    let firstLine = p;
    let rest = '';
    if (firstNewline >= 0) {
      firstLine = p.slice(0, firstNewline);
      rest = p.slice(firstNewline + 1);
    }
    const { speaker, text: firstBody } = detectSpeaker(firstLine);
    const body = rest.length > 0 ? `${firstBody}\n${rest}` : firstBody;
    return {
      id: genParagraphId(),
      index: i,
      speaker,
      text: body,
    };
  });
}
