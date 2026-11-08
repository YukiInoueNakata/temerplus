// ============================================================================
// SegmentList - 原文の切片の一覧（原文 → 切片化 → Box 化。2026-11-08 ユーザー要望）
// - 原文の順に並べ、見出し・種別・Item レベル・メモをその場で直せる。直すと、この切片から作った Box にも反映される
// - 選んだ切片から Box を作る（原文の順に時間の方向へ並ぶ）。Box を原文の順に並べ直す
// ============================================================================
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore } from '../store/store';
import { BOX_TYPE_LABELS } from '../store/defaults';
import { SELECTABLE_BOX_TYPES } from '../utils/typeDisplay';
import { transcriptRank, textPosition, compareTextPosition } from '../utils/textOrder';
import type { Transcript, TranscriptSegment, BoxType } from '../types';

export function SegmentList({ transcript, onJump }: { transcript: Transcript; onJump: (paragraphId: string) => void }) {
  const { t, i18n } = useTranslation('segmentList');
  const doc = useTEMStore((s) => s.doc);
  const updateSegment = useTEMStore((s) => s.updateSegment);
  const removeSegment = useTEMStore((s) => s.removeSegment);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const typeLabel = (bt: BoxType) => (i18n.language.startsWith('ja') ? BOX_TYPE_LABELS[bt].ja : t(`terms:boxType.${bt}`));

  // 原文の順
  const rows = useMemo(() => {
    const rank = transcriptRank(doc);
    return [...(transcript.segments ?? [])]
      .map((sg) => ({ sg, pos: textPosition(doc, sg, rank) }))
      .sort((a, b) => (a.pos && b.pos ? compareTextPosition(a.pos, b.pos) : a.pos ? -1 : b.pos ? 1 : 0))
      .map((x) => x.sg);
  }, [doc, transcript.segments]);

  // 今のシートで、切片から作った Box
  const boxBySegment = useMemo(() => {
    const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId);
    const m = new Map<string, string>();
    for (const b of sheet?.boxes ?? []) if (b.segmentId) m.set(b.segmentId, b.id);
    return m;
  }, [doc]);

  const toggle = (id: string) => setChecked((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const allChecked = rows.length > 0 && rows.every((r) => checked.has(r.id));
  const toCreate = rows.filter((r) => checked.has(r.id) && !boxBySegment.has(r.id));

  const createBoxes = () => {
    const ids = useTEMStore.getState().createBoxesFromSegments(transcript.id, toCreate.map((r) => r.id));
    setMessage(t('created', { count: ids.length }));
    setChecked(new Set());
  };
  const arrange = () => {
    const linked = rows.map((r) => boxBySegment.get(r.id)).filter((x): x is string => !!x);
    const moved = useTEMStore.getState().arrangeBoxesByTextOrder(linked);
    setMessage(moved > 0 ? t('arranged', { count: moved }) : t('arranged.none'));
  };
  const selectBox = (boxId: string) => {
    const st = useTEMStore.getState();
    st.setSelection([boxId], [], []);
    const sheet = st.doc.sheets.find((s) => s.id === st.doc.activeSheetId);
    const b = sheet?.boxes.find((x) => x.id === boxId);
    if (b) st.requestFocusRect({ x: b.x, y: b.y, width: b.width, height: b.height });
  };

  if (rows.length === 0) {
    return <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{t('empty')}</p>;
  }

  const cell: React.CSSProperties = { padding: '3px 4px', borderBottom: '1px solid #eee', verticalAlign: 'top', fontSize: 12 };
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <button className="ribbon-btn-small" onClick={() => setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)))}>
          {allChecked ? t('uncheckAll') : t('checkAll')}
        </button>
        <button className="ribbon-btn-small" disabled={toCreate.length === 0} onClick={createBoxes} title={t('createBoxes.tip')}>
          {t('createBoxes', { count: toCreate.length })}
        </button>
        <button className="ribbon-btn-small" disabled={boxBySegment.size < 2} onClick={arrange} title={t('arrange.tip')}>
          {t('arrange')}
        </button>
        {message && <span style={{ fontSize: 12, color: '#2b7a3d' }}>{message}</span>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
            <th style={cell}><input type="checkbox" checked={allChecked} onChange={() => setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)))} aria-label={t('checkAll')} /></th>
            <th style={cell}>#</th>
            <th style={{ ...cell, width: '45%' }}>{t('col.label')} / {t('col.quote')}</th>
            <th style={cell}>{t('col.type')}</th>
            <th style={cell} title={t('col.item.tip')}>{t('col.item')}</th>
            <th style={cell}>{t('col.note')}</th>
            <th style={cell}>{t('col.box')}</th>
            <th style={cell}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((sg, i) => (
            <SegmentRow
              key={sg.id}
              sg={sg}
              index={i + 1}
              checked={checked.has(sg.id)}
              boxId={boxBySegment.get(sg.id)}
              typeLabel={typeLabel}
              cell={cell}
              onToggle={() => toggle(sg.id)}
              onChange={(patch) => updateSegment(transcript.id, sg.id, patch)}
              onRemove={() => removeSegment(transcript.id, sg.id)}
              onJump={() => onJump(sg.paragraphId)}
              onSelectBox={selectBox}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SegmentRow({
  sg, index, checked, boxId, typeLabel, cell, onToggle, onChange, onRemove, onJump, onSelectBox,
}: {
  sg: TranscriptSegment;
  index: number;
  checked: boolean;
  boxId?: string;
  typeLabel: (bt: BoxType) => string;
  cell: React.CSSProperties;
  onToggle: () => void;
  onChange: (patch: Partial<Pick<TranscriptSegment, 'label' | 'boxType' | 'itemLevel' | 'note'>>) => void;
  onRemove: () => void;
  onJump: () => void;
  onSelectBox: (boxId: string) => void;
}) {
  const { t } = useTranslation('segmentList');
  // 見出し・メモ・Item は打ち終えたとき（フォーカスが外れた・Enter）に反映する（1 字ごとに Box を書き換えない）
  const [label, setLabel] = useState(sg.label);
  const [note, setNote] = useState(sg.note ?? '');
  const [item, setItem] = useState(sg.itemLevel != null ? String(sg.itemLevel) : '');
  const commitOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); };
  const quote = sg.quoteText.length > 40 ? sg.quoteText.slice(0, 40) + '…' : sg.quoteText;
  return (
    <tr style={{ background: checked ? '#eef4ff' : undefined }}>
      <td style={cell}><input type="checkbox" checked={checked} onChange={onToggle} aria-label={t('check', { n: index })} /></td>
      <td style={{ ...cell, color: '#888' }}>{index}</td>
      <td style={cell}>
        <input
          aria-label={t('col.label')}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => { if (label !== sg.label) onChange({ label }); }}
          onKeyDown={commitOnEnter}
          style={{ width: '100%', fontSize: 12, boxSizing: 'border-box' }}
        />
        {/* 引用（押すと原文のその場所へ）。見出しの下に小さく */}
        <button
          type="button"
          onClick={onJump}
          title={sg.quoteText}
          style={{ display: 'block', marginTop: 2, border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: sg.unresolved ? '#b00020' : '#777', fontSize: 11 }}
        >
          {sg.unresolved ? `⚠ ${quote}` : t('pptxImport:quote', { text: quote })}
        </button>
      </td>
      <td style={cell}>
        <select value={sg.boxType ?? 'normal'} onChange={(e) => onChange({ boxType: e.target.value as BoxType })} style={{ fontSize: 12 }}>
          {SELECTABLE_BOX_TYPES.map((bt) => <option key={bt} value={bt}>{typeLabel(bt)}</option>)}
        </select>
      </td>
      <td style={cell}>
        <input
          type="number"
          step={0.5}
          value={item}
          placeholder="0"
          onChange={(e) => setItem(e.target.value)}
          onBlur={() => {
            const v = item.trim() === '' ? NaN : Number(item);
            if ((Number.isFinite(v) ? v : undefined) !== sg.itemLevel) onChange({ itemLevel: v });
          }}
          onKeyDown={commitOnEnter}
          style={{ width: 44, fontSize: 12 }}
        />
      </td>
      <td style={cell}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => { if (note !== (sg.note ?? '')) onChange({ note }); }}
          onKeyDown={commitOnEnter}
          style={{ width: '100%', minWidth: 60, fontSize: 12, boxSizing: 'border-box' }}
        />
      </td>
      <td style={cell}>
        {boxId
          ? <button type="button" className="ribbon-btn-small" onClick={() => onSelectBox(boxId)} title={t('col.box.tip')}>{boxId}</button>
          : <span style={{ color: '#999' }}>—</span>}
      </td>
      <td style={cell}>
        <button type="button" onClick={onRemove} title={t('remove.tip')} style={{ border: 'none', background: 'none', color: '#b00020', cursor: 'pointer' }}>×</button>
      </td>
    </tr>
  );
}
