// ============================================================================
// コメント（2026-11-10 ユーザー決定で作った。それまではデータの入れ物と store の操作だけで、画面が無かった）
// - CommentsSection: 選んだ Box・径路・SD/SG のコメント。書いて付ける・返信・解決／未解決に戻す・削除
// - CommentList: 何も選んでいないときのシートのコメントの一覧。押すとその要素を選ぶ
// - 書いた人の名前はこのブラウザに残す（localStorage。図のファイルには各コメントの author として入る）
// - Box の右クリックの「コメントを付ける」は FOCUS_COMMENT_EVENT を投げ、ここで入力欄に移る
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import type { Comment, Sheet } from '../types';

export const FOCUS_COMMENT_EVENT = 'temer:focus-comment';
const AUTHOR_KEY = 'temer.commentAuthor';

function loadAuthor(): string {
  try { return localStorage.getItem(AUTHOR_KEY) ?? ''; } catch { return ''; }
}
function saveAuthor(v: string): void {
  try { localStorage.setItem(AUTHOR_KEY, v); } catch { /* 保存できなくても続ける */ }
}

function fmtDate(iso: string, lng: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(lng.startsWith('ja') ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** 要素の種類と名前（一覧で見せる） */
export function commentTargetName(sheet: Sheet, targetId: string): { kind: 'box' | 'line' | 'sdsg' | 'missing'; name: string } {
  const b = sheet.boxes.find((x) => x.id === targetId);
  if (b) return { kind: 'box', name: `${b.id} ${b.label ?? ''}`.trim() };
  const l = sheet.lines.find((x) => x.id === targetId);
  if (l) return { kind: 'line', name: l.id };
  const g = sheet.sdsg.find((x) => x.id === targetId);
  if (g) return { kind: 'sdsg', name: `${g.id} ${g.label ?? ''}`.trim() };
  return { kind: 'missing', name: targetId };
}

/** 未解決のコメントの数（図の上の印に使う） */
export function unresolvedCount(sheet: Sheet | null | undefined, targetId: string): number {
  return (sheet?.comments ?? []).filter((c) => c.targetId === targetId && !c.resolved).length;
}

const box: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: 4, padding: '6px 8px', marginBottom: 6, background: '#fff' };
const meta: React.CSSProperties = { fontSize: '0.8em', color: '#888' };
const linkBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#2962ff', cursor: 'pointer', padding: 0, fontSize: '0.85em' };

function CommentItem({ c }: { c: Comment }) {
  const { t, i18n } = useTranslation('comments');
  const [reply, setReply] = useState('');
  const st = useTEMStore.getState;
  return (
    <div className="comment-item" style={{ ...box, opacity: c.resolved ? 0.6 : 1 }}>
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.text}</div>
      <div style={meta}>
        {c.author ? `${c.author} · ` : ''}{fmtDate(c.createdAt, i18n.language)}{c.resolved ? ` · ${t('resolved')}` : ''}
      </div>
      {(c.replies ?? []).map((r) => (
        <div key={r.id} style={{ borderLeft: '2px solid #e0e0e0', paddingLeft: 6, marginTop: 4 }}>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.text}</div>
          <div style={meta}>
            {r.author ? `${r.author} · ` : ''}{fmtDate(r.createdAt, i18n.language)}
            {' '}<button style={linkBtn} onClick={() => st().removeCommentReply(c.id, r.id)}>{t('deleteReply')}</button>
          </div>
        </div>
      ))}
      {!c.resolved && (
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          <input
            value={reply}
            placeholder={t('replyPlaceholder')}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && reply.trim()) { st().addCommentReply(c.id, reply.trim(), loadAuthor() || undefined); setReply(''); }
            }}
            style={{ flex: 1, minWidth: 0 }}
          />
          <button className="style-btn" disabled={!reply.trim()} onClick={() => { st().addCommentReply(c.id, reply.trim(), loadAuthor() || undefined); setReply(''); }}>
            {t('reply')}
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button style={linkBtn} onClick={() => st().setCommentResolved(c.id, !c.resolved)}>{c.resolved ? t('reopen') : t('resolve')}</button>
        <button style={{ ...linkBtn, color: '#c62828' }} onClick={() => st().removeComment(c.id)}>{t('delete')}</button>
      </div>
    </div>
  );
}

/** 選んだ要素のコメント（プロパティパネルの下に出す） */
export function CommentsSection({ targetId }: { targetId: string }) {
  const { t } = useTranslation('comments');
  const sheet = useActiveSheet();
  const [text, setText] = useState('');
  const [author, setAuthor] = useState(loadAuthor);
  const [showResolved, setShowResolved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onFocus = () => { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ block: 'nearest' }); };
    window.addEventListener(FOCUS_COMMENT_EVENT, onFocus);
    return () => window.removeEventListener(FOCUS_COMMENT_EVENT, onFocus);
  }, []);

  if (!sheet) return null;
  const all = (sheet.comments ?? []).filter((c) => c.targetId === targetId);
  const open = all.filter((c) => !c.resolved);
  const done = all.filter((c) => c.resolved);
  const add = () => {
    if (!text.trim()) return;
    useTEMStore.getState().addComment(targetId, text.trim(), author.trim() || undefined);
    setText('');
  };

  return (
    <div className="prop-section comments-section">
      <h4>{t('title')}{open.length > 0 && <span className="multi-badge">{open.length}</span>}</h4>
      {open.map((c) => <CommentItem key={c.id} c={c} />)}
      {done.length > 0 && (
        <button style={linkBtn} onClick={() => setShowResolved((v) => !v)}>
          {showResolved ? t('hideResolved') : t('showResolved', { count: done.length })}
        </button>
      )}
      {showResolved && done.map((c) => <CommentItem key={c.id} c={c} />)}
      <textarea
        ref={inputRef}
        className="comment-input"
        value={text}
        placeholder={t('placeholder')}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); add(); } }}
        rows={2}
        style={{ width: '100%', boxSizing: 'border-box', marginTop: 6 }}
      />
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
        <input
          value={author}
          placeholder={t('authorPlaceholder')}
          title={t('authorTitle')}
          onChange={(e) => { setAuthor(e.target.value); saveAuthor(e.target.value); }}
          style={{ flex: 1, minWidth: 0 }}
        />
        <button className="style-btn" disabled={!text.trim()} onClick={add} title={t('addTitle')}>{t('add')}</button>
      </div>
    </div>
  );
}

/** 何も選んでいないときのシートのコメントの一覧。押すとその要素を選ぶ */
export function CommentList() {
  const { t } = useTranslation('comments');
  const sheet = useActiveSheet();
  const [showResolved, setShowResolved] = useState(false);
  if (!sheet || (sheet.comments ?? []).length === 0) return null;
  const list = sheet.comments.filter((c) => showResolved || !c.resolved);
  const nResolved = sheet.comments.filter((c) => c.resolved).length;
  const select = (targetId: string) => {
    const k = commentTargetName(sheet, targetId).kind;
    const st = useTEMStore.getState();
    if (k === 'box') st.setSelection([targetId], [], []);
    else if (k === 'line') st.setSelection([], [targetId], []);
    else if (k === 'sdsg') st.setSelection([], [], [targetId]);
  };
  return (
    <div className="prop-section comment-list">
      <h4>{t('listTitle')}</h4>
      {list.length === 0 && <p className="hint">{t('noOpen')}</p>}
      {list.map((c) => {
        const target = commentTargetName(sheet, c.targetId);
        return (
          <button key={c.id} onClick={() => select(c.targetId)} title={t('jump')}
            style={{ ...box, display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', opacity: c.resolved ? 0.6 : 1 }}>
            <div style={{ ...meta, color: '#555' }}>{target.name}{c.resolved ? ` · ${t('resolved')}` : ''}{(c.replies?.length ?? 0) > 0 ? ` · ${t('replies', { count: c.replies!.length })}` : ''}</div>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden', maxHeight: '3.6em' }}>{c.text}</div>
          </button>
        );
      })}
      {nResolved > 0 && (
        <button style={linkBtn} onClick={() => setShowResolved((v) => !v)}>
          {showResolved ? t('hideResolved') : t('showResolved', { count: nResolved })}
        </button>
      )}
    </div>
  );
}

/** 図の上のコメントの印の class。出力（exportImage の buildFilter）ではこの class の要素を除く */
export const COMMENT_BADGE_CLASS = 'temer-comment-badge';

/** 図の上の、未解決のコメントの印（吹き出しと件数）。編集の画面だけ */
export function CommentBadge({ count }: { count: number }) {
  const { t } = useTranslation('comments');
  if (count <= 0) return null;
  return (
    <div className={COMMENT_BADGE_CLASS} title={t('badge', { count })}
      style={{ position: 'absolute', top: -12, left: -12, zIndex: 5, width: 22, height: 20, cursor: 'help', pointerEvents: 'auto' }}>
      <svg width="22" height="20" viewBox="0 0 22 20" aria-hidden="true">
        <path d="M3 1 H19 A2 2 0 0 1 21 3 V12 A2 2 0 0 1 19 14 H9 L4 19 V14 H3 A2 2 0 0 1 1 12 V3 A2 2 0 0 1 3 1 Z" fill="#fff59d" stroke="#b28704" strokeWidth="1.2" />
        <text x="11" y="11" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5d4300">{count > 9 ? '9+' : count}</text>
      </svg>
    </div>
  );
}
