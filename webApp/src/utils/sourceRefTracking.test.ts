// ============================================================================
// SourceRef 追従ロジックのテスト
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  retrackSourceRef,
  retrackSourceRefsForParagraph,
  markRefsUnresolvedForParagraph,
  removeSourceRefsForTranscript,
} from './sourceRefTracking';
import type { SourceRef } from '../types';

function makeRef(partial: Partial<SourceRef>): SourceRef {
  return {
    id: 'Sr_1',
    transcriptId: 'T1',
    paragraphId: 'P1',
    quoteText: '',
    createdAt: '2026-05-22T00:00:00Z',
    ...partial,
  };
}

describe('retrackSourceRef', () => {
  it('quoteText が空なら段落全体参照として常に成功', () => {
    const ref = makeRef({ quoteText: '', unresolved: true });
    const r = retrackSourceRef(ref, '新しい本文');
    expect(r.ref.unresolved).toBe(false);
    expect(r.changed).toBe(true);
  });

  it('既存範囲が一致するなら何もしない', () => {
    const text = '指導教員と最初に話しました';
    const ref = makeRef({
      quoteText: '指導教員',
      charStart: 0,
      charEnd: 4,
    });
    const r = retrackSourceRef(ref, text);
    expect(r.changed).toBe(false);
    expect(r.ref.charStart).toBe(0);
  });

  it('quoteText が新本文中に見つかれば charStart/charEnd を更新', () => {
    const oldRef = makeRef({
      quoteText: '指導教員',
      charStart: 0,
      charEnd: 4,
    });
    const newText = '実は最初、指導教員に相談しました';
    const r = retrackSourceRef(oldRef, newText);
    expect(r.changed).toBe(true);
    expect(r.ref.charStart).toBe(5);
    expect(r.ref.charEnd).toBe(9);
    expect(r.ref.unresolved).toBeFalsy();
  });

  it('quoteText が見つからなければ unresolved=true', () => {
    const ref = makeRef({
      quoteText: '指導教員',
      charStart: 0,
      charEnd: 4,
    });
    const r = retrackSourceRef(ref, 'まったく別の本文に置き換わった');
    expect(r.changed).toBe(true);
    expect(r.ref.unresolved).toBe(true);
    // charStart は据え置き
    expect(r.ref.charStart).toBe(0);
  });

  it('既に unresolved で再び見つからなければ changed=false', () => {
    const ref = makeRef({
      quoteText: '指導教員',
      unresolved: true,
    });
    const r = retrackSourceRef(ref, 'まったく別の本文');
    expect(r.changed).toBe(false);
    expect(r.ref.unresolved).toBe(true);
  });

  it('unresolved だったが新本文で見つかったら解除', () => {
    const ref = makeRef({
      quoteText: '指導教員',
      unresolved: true,
    });
    const r = retrackSourceRef(ref, '今度こそ指導教員と話しました');
    expect(r.changed).toBe(true);
    expect(r.ref.unresolved).toBe(false);
    expect(r.ref.charStart).toBe(4);
  });
});

describe('retrackSourceRefsForParagraph', () => {
  it('該当 paragraph 以外には影響しない', () => {
    const refs = [
      makeRef({ id: 'r1', paragraphId: 'P1', quoteText: 'A', charStart: 0, charEnd: 1 }),
      makeRef({ id: 'r2', paragraphId: 'P2', quoteText: 'X', charStart: 0, charEnd: 1 }),
    ];
    const result = retrackSourceRefsForParagraph(refs, 'P1', 'まったく別');
    expect(result.changedCount).toBe(1);
    expect(result.refs?.[0].unresolved).toBe(true);
    expect(result.refs?.[1].unresolved).toBeFalsy();
  });

  it('refs が undefined / 空なら何もしない', () => {
    const r1 = retrackSourceRefsForParagraph(undefined, 'P1', 'x');
    expect(r1.changedCount).toBe(0);
    const r2 = retrackSourceRefsForParagraph([], 'P1', 'x');
    expect(r2.changedCount).toBe(0);
  });
});

describe('markRefsUnresolvedForParagraph', () => {
  it('段落削除に伴い、その paragraphId を参照する ref を unresolved にする', () => {
    const refs = [
      makeRef({ id: 'r1', paragraphId: 'P1' }),
      makeRef({ id: 'r2', paragraphId: 'P2' }),
    ];
    const next = markRefsUnresolvedForParagraph(refs, 'P1');
    expect(next?.[0].unresolved).toBe(true);
    expect(next?.[1].unresolved).toBeFalsy();
  });
});

describe('removeSourceRefsForTranscript', () => {
  it('指定 transcriptId を参照する ref を全削除', () => {
    const refs = [
      makeRef({ id: 'r1', transcriptId: 'T1' }),
      makeRef({ id: 'r2', transcriptId: 'T2' }),
      makeRef({ id: 'r3', transcriptId: 'T1' }),
    ];
    const next = removeSourceRefsForTranscript(refs, 'T1');
    expect(next?.length).toBe(1);
    expect(next?.[0].id).toBe('r2');
  });
});
