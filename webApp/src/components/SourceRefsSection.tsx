// ============================================================================
// SourceRefsSection - Box / Line / SDSG プロパティパネルに埋め込む
// 「原文参照」セクション
// - 紐付く SourceRef[] を一覧表示
// - 引用テキスト・追従状態・原文ジャンプ・削除
// - 「原文ビューアを開く」ボタン
// ============================================================================

import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('sourceRefsSection');
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
    const tr = transcripts.find((x) => x.id === r.transcriptId);
    if (tr?.participantId) coveredParticipantIds.add(tr.participantId);
    else if (tr) hasUnassignedSource = true;
  }
  const coverageCount = coveredParticipantIds.size + (hasUnassignedSource ? 1 : 0);
  const coverageNames = Array.from(coveredParticipantIds).map((id) => {
    const p = participants.find((x) => x.id === id);
    return p?.pseudonym ?? id;
  }).join(', ') + (hasUnassignedSource ? (coveredParticipantIds.size > 0 ? ', ' + t('unassigned') : t('unassigned')) : '');

  // 未引用警告 (Box のみ。原文ありモードかつ refs=0 件)
  // Line と SDSG も警告対象としても良いが、Line は径路なので必ずしも原文不要、
  // SDSG は社会的影響なので原文紐付け推奨。両方とも警告を出す方向で。
  const showUnreferencedWarning = hasTranscripts && refs.length === 0;

  return (
    <CollapsibleSection
      title={
        t('title', { count }) +
        (unresolved > 0 ? ' ' + t('title.unresolved', { count: unresolved }) : '') +
        (showUnreferencedWarning ? ' ' + t('title.unreferenced') : '') +
        (refs.length > 0 && hasTranscripts ? ' / ' + t('title.coverage', { count: coverageCount }) : '')
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
            ⚠ <strong>{t('warn.noRefs')}</strong><br />
            {t('warn.noRefs.hint')}
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
            title={t('coverage.tooltip')}
          >
            👥 <strong>{t('coverage.count', { count: coverageCount })}</strong>
            {coverageCount >= 4
              ? ' ' + t('coverage.enough')
              : coverageCount >= 2
                ? ' ' + t('coverage.multiple')
                : ' ' + t('coverage.single')}
            <br />
            <span style={{ color: '#555' }}>{t('coverage.targets', { names: coverageNames })}</span>
          </div>
        )}
        {refs.length === 0 ? (
          !showUnreferencedWarning && (
            <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>
              {t('empty')}
            </p>
          )
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            {refs.map((r) => {
              const tr = transcripts.find((x) => x.id === r.transcriptId);
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
                            {t('session', { n: tr.sessionNumber })}
                          </span>
                        )}
                        {tr.title}
                      </>
                    ) : t('unknownTranscript')}
                    {paraIndex >= 0 && ` §${paraIndex + 1}`}
                  </div>
                  <div style={{ color: '#555', whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'auto', fontSize: 11 }}>
                    {t('quote', { text: (r.quoteText ?? '').slice(0, 140) + ((r.quoteText ?? '').length > 140 ? '...' : '') })}
                  </div>
                  {r.unresolved && (
                    <div style={{ color: '#c0392b', fontSize: 11, marginTop: 2 }}>
                      ⚠ {t('unresolved')}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <button
                      style={{ fontSize: 11, padding: '2px 6px' }}
                      onClick={() => onOpenTranscriptViewer?.(target.type === 'box' ? target.id : undefined)}
                    >
                      {t('jump')}
                    </button>
                    <button
                      style={{ fontSize: 11, padding: '2px 6px', color: '#c0392b' }}
                      onClick={() => {
                        if (confirm(t('confirm.unlink'))) {
                          removeSourceRef(target, r.id);
                        }
                      }}
                    >
                      {t('unlink')}
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
          {t('openViewer')}
        </button>
      </div>
    </CollapsibleSection>
  );
}
