// ============================================================================
// 原文の中の順序（2026-11-08。原文 → 切片化 → Box 化、原文の順に並べる）
// 並べる順: 逐語録の順（協力者の並び → 回の番号 → 取り込んだ時刻）→ 段落の順 → 段落の中の文字の位置
// 切片の一覧の並び、切片から作る Box の並び、Box を原文の順に並べ直す処理が同じ順序を使う
// ============================================================================
import type { TEMDocument, Box, SourceRef } from '../types';

export type TextPosition = [number, number, number];

/** 逐語録の並び順（協力者の並び → 回の番号 → 取り込んだ時刻） */
export function transcriptRank(doc: TEMDocument): Map<string, number> {
  const pIndex = new Map(doc.participants.map((p, i) => [p.id, i]));
  const sorted = [...doc.transcripts].sort((a, b) => {
    const pa = a.participantId != null ? (pIndex.get(a.participantId) ?? 9999) : 9999;
    const pb = b.participantId != null ? (pIndex.get(b.participantId) ?? 9999) : 9999;
    if (pa !== pb) return pa - pb;
    const sa = a.sessionNumber ?? Number.MAX_SAFE_INTEGER;
    const sb = b.sessionNumber ?? Number.MAX_SAFE_INTEGER;
    if (sa !== sb) return sa - sb;
    return (a.importedAt ?? '').localeCompare(b.importedAt ?? '');
  });
  return new Map(sorted.map((t, i) => [t.id, i]));
}

/** 原文の範囲の位置（見つからなければ null） */
export function textPosition(
  doc: TEMDocument,
  ref: Pick<SourceRef, 'transcriptId' | 'paragraphId' | 'charStart'>,
  rank: Map<string, number> = transcriptRank(doc),
): TextPosition | null {
  const t = doc.transcripts.find((x) => x.id === ref.transcriptId);
  if (!t) return null;
  const pi = t.paragraphs.findIndex((p) => p.id === ref.paragraphId);
  if (pi < 0) return null;
  return [rank.get(t.id) ?? 0, pi, ref.charStart ?? 0];
}

export function compareTextPosition(a: TextPosition, b: TextPosition): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/**
 * Box の原文での位置。切片から作った Box はその切片の位置、それ以外は原文参照のうち最も前のもの。
 * 原文に結ばれていなければ null
 */
export function boxTextPosition(doc: TEMDocument, box: Box, rank: Map<string, number> = transcriptRank(doc)): TextPosition | null {
  if (box.segmentId) {
    for (const t of doc.transcripts) {
      const seg = t.segments?.find((s) => s.id === box.segmentId);
      if (seg) {
        const pos = textPosition(doc, seg, rank);
        if (pos) return pos;
      }
    }
  }
  let best: TextPosition | null = null;
  for (const r of box.sourceRefs ?? []) {
    if (r.unresolved) continue;
    const pos = textPosition(doc, r, rank);
    if (pos && (!best || compareTextPosition(pos, best) < 0)) best = pos;
  }
  return best;
}
