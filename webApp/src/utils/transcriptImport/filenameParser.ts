// ============================================================================
// ファイル名からの協力者 / セッション番号 推測
//
// 典型パターン (拡張子は事前除去):
//   "A_第1回"           → participantHint="A",        sessionHint=1
//   "A_session2"        → participantHint="A",        sessionHint=2
//   "Yamada_v3"         → participantHint="Yamada",   sessionHint=3
//   "B-1"               → participantHint="B",        sessionHint=1
//   "協力者A_第2回"      → participantHint="A",       sessionHint=2
//                          ("協力者" prefix を剥がす)
//   "interview_C_3"     → participantHint="C",        sessionHint=3
//   "A第3回 (2026-04)"  → participantHint="A",       sessionHint=3
//   "Yuki"              → participantHint="Yuki",     sessionHint=undefined
//   "20240415_A"        → participantHint="A",        sessionHint=undefined
// ============================================================================

export interface FilenameHints {
  participantHint?: string;
  sessionHint?: number;
}

// セッション番号らしいパターン: 「第N回」「sessionN」「vN」「session-N」「-N (数字末尾)」
// アンダースコアは regex の \w に含まれるため \b が効かないので、
// 前後境界を (?:^|[\s_\-]) / (?=$|[\s_\-]) で明示。
const SESSION_PATTERNS: RegExp[] = [
  /第\s*(\d{1,3})\s*回/,                                       // 第N回
  /(?:^|[\s_\-])session[\s_\-]?(\d{1,3})(?=$|[\s_\-])/i,        // session N
  /(?:^|[\s_\-])sess[\s_\-]?(\d{1,3})(?=$|[\s_\-])/i,           // sess N
  /(?:^|[\s_\-])v(\d{1,3})(?=$|[\s_\-])/i,                      // vN
  /(?:^|[\s_\-])interview[\s_\-]?(\d{1,3})(?=$|[\s_\-])/i,      // interview N
  /[_\-](\d{1,3})\s*$/,                                          // 末尾の _N / -N
];

// 協力者 prefix として削除する語
const PARTICIPANT_PREFIX_PATTERNS: RegExp[] = [
  /^協力者\s*/,
  /^participant[\s_-]*/i,
  /^interviewee[\s_-]*/i,
  /^subject[\s_-]*/i,
  /^p[\s_-]*/i,
];

// セッション関連表記を一括除去するパターン
const SESSION_STRIP_PATTERNS: RegExp[] = [
  /第\s*\d{1,3}\s*回/g,
  /(?:^|[\s_\-])session[\s_\-]?\d{1,3}(?=$|[\s_\-])/gi,
  /(?:^|[\s_\-])sess[\s_\-]?\d{1,3}(?=$|[\s_\-])/gi,
  /(?:^|[\s_\-])v\d{1,3}(?=$|[\s_\-])/gi,
  /(?:^|[\s_\-])interview[\s_\-]?\d{1,3}(?=$|[\s_\-])/gi,
];

/**
 * ファイル名（拡張子なし）から協力者と回数を推測する。
 */
export function parseFilenameHints(filenameNoExt: string): FilenameHints {
  // 全角→半角の数字統一 (最小限)
  const normalized = toHalfWidthDigits(filenameNoExt);

  // 1. セッション番号を抽出
  let sessionHint: number | undefined;
  for (const re of SESSION_PATTERNS) {
    const m = re.exec(normalized);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > 0 && n < 1000) {
        sessionHint = n;
        break;
      }
    }
  }

  // 2. セッション関連表記を除去
  let rest = normalized;
  for (const re of SESSION_STRIP_PATTERNS) {
    rest = rest.replace(re, ' ');
  }
  // 末尾 _N / -N の sessionHint も除去
  rest = rest.replace(/[_\-]\d{1,3}\s*$/, '');
  // 日付っぽいプレフィクス (8 桁数字 or 6 桁) を除去
  rest = rest.replace(/^\d{6,8}[_\-\s]+/, '');
  // 拡張子裏装飾 (xxxファイル名 (xxx)) → カッコ内除去
  rest = rest.replace(/[（(][^）)]*[）)]/g, ' ');

  // 3. セパレータで分割し、有意な語を participant 候補に
  const tokens = rest
    .split(/[\s_\-、，,/\\.]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  // 4. participant prefix を剥がして最初の意味あるトークンを採用
  let participantHint: string | undefined;
  for (const t of tokens) {
    let token = t;
    for (const re of PARTICIPANT_PREFIX_PATTERNS) {
      token = token.replace(re, '');
    }
    token = token.trim();
    // 全部数字 / 1 文字未満は除外
    if (token.length === 0) continue;
    if (/^\d+$/.test(token)) continue;
    // 「interview」「transcript」「逐語録」「原文」など意味のない単語は除外
    if (/^(interview|transcript|逐語録|原文|raw|data|notes?)$/i.test(token)) continue;
    participantHint = token;
    break;
  }

  return { participantHint, sessionHint };
}

function toHalfWidthDigits(s: string): string {
  return s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
}

/**
 * ファイル名から拡張子を除いて返す。
 */
export function stripExtension(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i > 0 ? filename.slice(0, i) : filename;
}
