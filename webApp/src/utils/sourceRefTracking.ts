// ============================================================================
// SourceRef の編集追従ユーティリティ
//
// 段落本文が編集されたとき、その段落を参照する SourceRef[] について
//   1. quoteText が新しい段落本文に存在するかを検索
//   2. ヒットしたら charStart/charEnd を更新（最初の出現位置）
//   3. ヒットしなければ unresolved = true をセット
// するための純関数群。store からインポートして利用する。
// ============================================================================

import type { SourceRef } from '../types';

export interface RetrackResult {
  ref: SourceRef;       // 更新後の SourceRef（同一参照ではなく新オブジェクト）
  changed: boolean;     // 何らかの変更が発生したか
}

/**
 * 1 つの SourceRef を新しい段落本文に対して追従させる。
 *
 * - quoteText が空・undefined のときは段落全体参照とみなし、unresolved 状態を解除して返す
 * - quoteText が新本文中に存在すれば charStart/charEnd を更新し unresolved を解除
 * - 存在しなければ charStart/charEnd は据え置きで unresolved=true をセット
 */
export function retrackSourceRef(ref: SourceRef, newText: string): RetrackResult {
  // 段落全体参照（charStart/charEnd が未指定または quoteText が空）の場合は常に追従成功
  if (!ref.quoteText || ref.quoteText.length === 0) {
    if (ref.unresolved) {
      return { ref: { ...ref, unresolved: false }, changed: true };
    }
    return { ref, changed: false };
  }

  // 既存範囲が引き続き一致するなら何もしない（変更検出のショートカット）
  if (
    typeof ref.charStart === 'number' &&
    typeof ref.charEnd === 'number' &&
    ref.charEnd <= newText.length &&
    newText.slice(ref.charStart, ref.charEnd) === ref.quoteText
  ) {
    if (ref.unresolved) {
      return { ref: { ...ref, unresolved: false }, changed: true };
    }
    return { ref, changed: false };
  }

  // 検索: 最初の出現位置
  const idx = newText.indexOf(ref.quoteText);
  if (idx >= 0) {
    return {
      ref: {
        ...ref,
        charStart: idx,
        charEnd: idx + ref.quoteText.length,
        unresolved: false,
      },
      changed: true,
    };
  }

  // 不一致 → unresolved
  if (!ref.unresolved) {
    return { ref: { ...ref, unresolved: true }, changed: true };
  }
  return { ref, changed: false };
}

/**
 * 段落本文の更新に伴い、その段落を参照する全 SourceRef[] を追従させる。
 * paragraphId が一致するものだけが対象。それ以外はそのまま返す。
 *
 * @returns 更新後の配列（変更がなくても新しい配列インスタンスを返す）と、変更があった件数
 */
export function retrackSourceRefsForParagraph(
  refs: SourceRef[] | undefined,
  paragraphId: string,
  newText: string,
): { refs: SourceRef[] | undefined; changedCount: number } {
  if (!refs || refs.length === 0) return { refs, changedCount: 0 };
  let changedCount = 0;
  const next = refs.map((r) => {
    if (r.paragraphId !== paragraphId) return r;
    const result = retrackSourceRef(r, newText);
    if (result.changed) changedCount++;
    return result.ref;
  });
  return { refs: next, changedCount };
}

/**
 * 段落削除に伴い、その段落を参照する SourceRef を全て unresolved=true にする
 * （ユーザが原文側で段落を消した場合の安全策）。
 */
export function markRefsUnresolvedForParagraph(
  refs: SourceRef[] | undefined,
  paragraphId: string,
): SourceRef[] | undefined {
  if (!refs || refs.length === 0) return refs;
  let changed = false;
  const next = refs.map((r) => {
    if (r.paragraphId === paragraphId && !r.unresolved) {
      changed = true;
      return { ...r, unresolved: true };
    }
    return r;
  });
  return changed ? next : refs;
}

/**
 * Transcript 全体が削除されたとき、その transcriptId を参照する SourceRef を全て除去する。
 * unresolved にするのではなく完全削除する（孤児リンクを残さない）。
 */
export function removeSourceRefsForTranscript(
  refs: SourceRef[] | undefined,
  transcriptId: string,
): SourceRef[] | undefined {
  if (!refs || refs.length === 0) return refs;
  const next = refs.filter((r) => r.transcriptId !== transcriptId);
  return next.length === refs.length ? refs : next;
}
