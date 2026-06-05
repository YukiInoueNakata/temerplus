// ============================================================================
// SourceRefsSection - Box / Line / SDSG プロパティパネルに埋め込む
// 「原文参照」セクション
// - 紐付く SourceRef[] を一覧表示
// - 引用テキスト・追従状態・原文ジャンプ・削除
// - 「原文ビューアを開く」ボタン
// ============================================================================

import { useTEMStore, useActiveSheet } from '../store/store';
import type { SourceRef } from '../types';
import { CollapsibleSection } from './CollapsibleSection';

export function SourceRefsSection({
  target,
  onOpenTranscriptViewer,
}: {
  target: { type: 'box' | 'line' | 'sdsg'; id: string };
  onOpenTranscriptViewer?: (focusBoxId?: string) => void;
}) {
  const sheet = useActiveSheet();
  const transcripts = useTEMStore((s) => s.doc.transcripts);
  const participants = useTEMStore((s) => s.doc.participants);
  const removeSourceRef = useTEMStore((s) => s.removeSourceRef);

  if (!sheet) return null;

  const entity =
    target.type === 'box' ? sheet.boxes.find((b) => b.id === target.id)
    : target.type === 'line' ? sheet.lines.find((l) => l.id === target.id)
    : sheet.sdsg.find((s) => s.id === target.id);

  const refs: SourceRef[] = entity?.sourceRefs ?? [];
  const count = refs.length;
  const unresolved = refs.filter((r) => r.unresolved).length;

  // 原文があるモードかどうか
  const hasTranscripts = transcripts.length > 0;

  // 協力者カバレッジ: この要素に紐付く SourceRef から、何人の participant にまたがるかを算出
  const coveredParticipantIds = new Set<string>();
  let hasUnassignedSource = false;
  for (const r of refs) {
    const tr = transcripts.find((t) => t.id === r.transcriptId);
    if (tr?.participantId) coveredParticipantIds.add(tr.participantId);
    else if (tr) hasUnassignedSource = true;
  }
  const coverageCount = coveredParticipantIds.size + (hasUnassignedSource ? 1 : 0);
  const coverageNames = Array.from(coveredParticipantIds).map((id) => {
    const p = participants.find((x) => x.id === id);
    return p?.pseudonym ?? id;
  }).join(', ') + (hasUnassignedSource ? (coveredParticipantIds.size > 0 ? ', (未割当)' : '(未割当)') : '');

  // 未引用警告 (Box のみ。原文ありモードかつ refs=0 件)
  // Line と SDSG も警告対象としても良いが、Line は径路なので必ずしも原文不要、
  // SDSG は社会的影響なので原文紐付け推奨。両方とも警告を出す方向で。
  const showUnreferencedWarning = hasTranscripts && refs.length === 0;

  return (
    <CollapsibleSection
      title={
        `原文参照 (${count})` +
        (unresolved > 0 ? ` ⚠${unresolved} 追従不能` : '') +
        (showUnreferencedWarning ? ' ⚠ 未引用' : '') +
        (refs.length > 0 && hasTranscripts ? ` / 協力者 ${coverageCount}` : '')
      }
      sectionKey={`source-refs:${target.type}:${target.id}`}
      defaultOpen={count > 0 || showUnreferencedWarning}
      compact
    >
      <div style={{ padding: '4px 0' }}>
        {showUnreferencedWarning && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderLeft: '4px solid #c0392b',
              borderRadius: 4,
              padding: 6,
              marginBottom: 6,
              fontSize: 12,
              color: '#7f1d1d',
            }}
          >
            ⚠ <strong>原文への引用がありません</strong><br />
            この要素は原文ビューアで段落をリンクすると根拠を保証できます。
          </div>
        )}
        {refs.length > 0 && hasTranscripts && (
          <div
            style={{
              background: coverageCount >= 4 ? '#d1fae5' : coverageCount >= 2 ? '#fef3c7' : '#fee2e2',
              border: '1px solid ' + (coverageCount >= 4 ? '#34d399' : coverageCount >= 2 ? '#fcd34d' : '#fca5a5'),
              borderRadius: 4,
              padding: 6,
              marginBottom: 6,
              fontSize: 11,
            }}
            title="TEM の 1/4/9/16 法則: 4 協力者以上で類型としての強度が高まる"
          >
            👥 <strong>協力者カバレッジ: {coverageCount} 名</strong>
            {coverageCount >= 4
              ? ' (1/4/9/16 法則: 類型として十分)'
              : coverageCount >= 2
                ? ' (複数協力者から支持)'
                : ' (単一協力者のみ)'}
            <br />
            <span style={{ color: '#555' }}>対象: {coverageNames}</span>
          </div>
        )}
        {refs.length === 0 ? (
          !showUnreferencedWarning && (
            <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
              この要素に紐付く原文引用はまだありません。
            </p>
          )
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            {refs.map((r) => {
              const tr = transcripts.find((t) => t.id === r.transcriptId);
              const para = tr?.paragraphs.find((p) => p.id === r.paragraphId);
              const paraIndex = para?.index ?? -1;
              return (
                <li
                  key={r.id}
                  style={{
                    fontSize: 12,
                    border: '1px solid #e0e0e0',
                    borderLeft: r.unresolved ? '3px solid #c0392b' : '3px solid #4a90e2',
                    borderRadius: 3,
                    padding: 6,
                    marginBottom: 6,
                    background: '#fafafa',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>
                    {tr ? (
                      <>
                        {tr.sessionNumber !== undefined && (
                          <span style={{ color: '#888', fontWeight: 400, marginRight: 4 }}>
                            第{tr.sessionNumber}回
                          </span>
                        )}
                        {tr.title}
                      </>
                    ) : '（原文不明）'}
                    {paraIndex >= 0 && ` §${paraIndex + 1}`}
                  </div>
                  <div style={{ color: '#555', whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'auto', fontSize: 11 }}>
                    「{(r.quoteText ?? '').slice(0, 140)}{(r.quoteText ?? '').length > 140 ? '...' : ''}」
                  </div>
                  {r.unresolved && (
                    <div style={{ color: '#c0392b', fontSize: 11, marginTop: 2 }}>
                      ⚠ 原文編集により位置追従に失敗しています
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <button
                      style={{ fontSize: 11, padding: '2px 6px' }}
                      onClick={() => onOpenTranscriptViewer?.(target.type === 'box' ? target.id : undefined)}
                    >
                      原文へジャンプ
                    </button>
                    <button
                      style={{ fontSize: 11, padding: '2px 6px', color: '#c0392b' }}
                      onClick={() => {
                        if (confirm('このリンクを解除しますか？\n（原文と要素自体は残ります）')) {
                          removeSourceRef(target, r.id);
                        }
                      }}
                    >
                      リンク解除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <button
          style={{ fontSize: 11, padding: '4px 8px', marginTop: 4 }}
          onClick={() => onOpenTranscriptViewer?.(target.type === 'box' ? target.id : undefined)}
        >
          原文ビューアを開く
        </button>
      </div>
    </CollapsibleSection>
  );
}
