// ============================================================================
// 話者検出ユーティリティ
// txt / docx / csv の本文から「話者名: 発言」のパターンを抽出する。
// ============================================================================

// 検出パターン:
//   - "A:", "A：", "A:"（半角・全角コロン両対応）
//   - "Q:", "A:", "A1:", "B2:" のように 1〜2 文字 + 任意の数字
//   - "話者A：", "山田：" のように日本語名 + コロン
//   - "話者A) ", "山田) " のように 閉じカッコ も許容
//   - "[A]", "【A】" などのカッコ表記
//
// 行頭から先頭話者表記を切り離す。話者と本文が同じ行にあると想定。
// パターンに合致しない行は speaker=undefined, text=元行 とする。

const SPEAKER_PATTERNS: Array<{ re: RegExp; speakerGroup: number; restGroup: number }> = [
  // "A:", "Q:", "A1:", "山田:", "Aさん:" など（ASCII または 日本語 1〜10文字）
  // [^\s:：)）】\]] で speaker 中にコロン類が来ないよう制限
  { re: /^\s*([^\s:：)）】\]]{1,10})\s*[:：]\s*(.*)$/, speakerGroup: 1, restGroup: 2 },
  // "A) ", "山田) "
  { re: /^\s*([^\s:：)）】\]]{1,10})\s*[)）]\s+(.*)$/, speakerGroup: 1, restGroup: 2 },
  // "[A] ", "【A】 ", "（A）" など
  { re: /^\s*[\[【（(]\s*([^\s:：)）】\]]{1,10})\s*[\]】）)]\s*(.*)$/, speakerGroup: 1, restGroup: 2 },
];

export interface SpeakerDetectResult {
  speaker?: string;
  text: string;
}

/**
 * 1 行/段落の先頭から話者表記を切り離す。
 * - マッチすれば { speaker: "A", text: "発言本文" }
 * - 何もなければ { text: 入力テキスト }
 */
export function detectSpeaker(line: string): SpeakerDetectResult {
  if (!line || line.length === 0) return { text: '' };
  for (const pat of SPEAKER_PATTERNS) {
    const m = pat.re.exec(line);
    if (m) {
      const speaker = m[pat.speakerGroup].trim();
      const rest = m[pat.restGroup] ?? '';
      // 話者が空 or 異常に長いものを除外
      if (speaker.length === 0 || speaker.length > 12) continue;
      // "Q" "A" "A1" などの典型パターンは強く採用、
      // 日本語含むものも採用、それ以外は本文に含まれる ":" を誤検出している可能性があるため除外する
      // → ここでは緩めに採用する（誤検出が出たらユーザが UI で speaker を消せばよい）
      return { speaker, text: rest };
    }
  }
  return { text: line };
}
