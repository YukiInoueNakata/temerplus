// コメント（2026-11-10 に画面を作った）の store の操作
import { describe, it, expect, afterEach } from 'vitest';
import { useTEMStore } from './store';
import { unresolvedCount, commentTargetName } from '../components/CommentsSection';

const sheet = () => { const s = useTEMStore.getState(); return s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)!; };
afterEach(() => { useTEMStore.getState().resetDocument(); });

describe('コメントの操作', () => {
  it('付ける・返信・解決にする・未解決に戻す・返信を消す・コメントを消す', () => {
    const st = useTEMStore.getState();
    const a = st.addBox({ type: 'normal', label: 'A', x: 0, y: 0 });
    const c = st.addComment(a, '根拠は？', '中田');
    expect(unresolvedCount(sheet(), a)).toBe(1);
    const r = useTEMStore.getState().addCommentReply(c, '語りの 3 段落目', 'A');
    expect(sheet().comments[0].replies).toHaveLength(1);
    useTEMStore.getState().setCommentResolved(c, true);
    expect(unresolvedCount(sheet(), a)).toBe(0);
    useTEMStore.getState().setCommentResolved(c, false);
    expect(unresolvedCount(sheet(), a)).toBe(1);
    useTEMStore.getState().removeCommentReply(c, r);
    expect(sheet().comments[0].replies).toHaveLength(0);
    useTEMStore.getState().removeComment(c);
    expect(sheet().comments).toHaveLength(0);
  });

  it('Box・径路・SD/SG を消すと、付いていたコメントも消える', () => {
    const st = useTEMStore.getState();
    const a = st.addBox({ type: 'BFP', label: 'A', x: 0, y: 0 });
    const b = st.addBox({ type: 'normal', label: 'B', x: 200, y: 0 });
    const l = st.addLine(a, b);
    st.addComment(a, 'Box へ');
    st.addComment(l, '径路へ');
    st.addComment(b, 'もう一つの Box へ');
    useTEMStore.getState().removeLines([l]);
    expect(sheet().comments.map((c) => c.text)).toEqual(['Box へ', 'もう一つの Box へ']);
    useTEMStore.getState().removeBoxes([a]);
    expect(sheet().comments.map((c) => c.text)).toEqual(['もう一つの Box へ']);
  });

  it('一覧に出す要素の名前', () => {
    const st = useTEMStore.getState();
    const a = st.addBox({ type: 'normal', label: '高校に入る', x: 0, y: 0 });
    expect(commentTargetName(sheet(), a)).toEqual({ kind: 'box', name: `${a} 高校に入る` });
    expect(commentTargetName(sheet(), 'nope').kind).toBe('missing');
  });
});
