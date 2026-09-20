// ============================================================================
// NoteNode - 図上のメモ（解釈・コメント）
// - Box は径路上のデータ、Note は解釈。レベル座標に乗らず自由に置ける
// - 採番・凡例には出ない。レポート出力は Note ごとに ON/OFF（既定 OFF）
// - 引き出し線（対象の Box / SD・SG へ）は既定 OFF。NoteLeaderOverlay が描く
// - 編集: ダブルクリック / Enter / F2（editingNodeId 経由）
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { NodeResizer, useStore as useReactFlowStore, type NodeProps } from 'reactflow';
import { useTEMStore } from '../../store/store';
import { useTEMView } from '../../context/TEMViewContext';
import type { Note } from '../../types';
import { collectSDSGRects } from '../../utils/elementRects';

export interface NoteNodeData {
  id: string;
  text: string;
  width: number;
  height: number;
  style?: Note['style'];
  fontSize?: number;
}

export const NOTE_DEFAULT_WIDTH = 160;
export const NOTE_DEFAULT_HEIGHT = 80;
export const NOTE_DEFAULT_FONT_SIZE = 12;

/** メモの見た目。'note' = 付箋風、'callout' = 白地の吹き出し風 */
export function noteVisualStyle(style: Note['style'] | undefined): React.CSSProperties {
  if (style === 'callout') {
    return { background: '#ffffff', border: '1px solid #666', borderRadius: 6 };
  }
  return { background: '#fff8c5', border: '1px dashed #b8a000', borderRadius: 3 };
}

export function NoteNode({ data, selected }: NodeProps<NoteNodeData>) {
  const view = useTEMView();
  const isPreview = view.isPreview;
  const updateNote = useTEMStore((s) => s.updateNote);
  const editingNodeId = useTEMStore((s) => s.editingNodeId);
  const requestEditNode = useTEMStore((s) => s.requestEditNode);
  const defaultFontSize = view.settings.defaultFontSize ?? 13;
  const fontSize = data.fontSize ?? Math.min(defaultFontSize, NOTE_DEFAULT_FONT_SIZE + 1);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizing = useRef(false);

  useEffect(() => {
    if (editingNodeId && editingNodeId === data.id && !isPreview) {
      setEditing(true);
      requestEditNode(null);
    }
  }, [editingNodeId, data.id, isPreview, requestEditNode]);

  useEffect(() => {
    if (editing) {
      setDraft(data.text);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [editing, data.text]);

  const commit = () => {
    setEditing(false);
    if (draft !== data.text) updateNote(data.id, { text: draft });
  };
  const cancel = () => { setEditing(false); setDraft(data.text); };

  const visual = noteVisualStyle(data.style);
  // 選択直後はリサイズ枠を出さない（BoxNode と同じ理由: ダブルクリックの 2 回目を邪魔しない）
  const [resizerReady, setResizerReady] = useState(false);
  useEffect(() => {
    if (!selected) { setResizerReady(false); return; }
    const t = window.setTimeout(() => setResizerReady(true), 350);
    return () => window.clearTimeout(t);
  }, [selected]);

  return (
    <>
      {!isPreview && (
        <NodeResizer
          isVisible={!!selected && resizerReady && !editing}
          minWidth={60}
          minHeight={30}
          handleStyle={{ width: 8, height: 8, borderRadius: 2, background: '#2684ff', border: '1px solid #fff' }}
          lineStyle={{ borderColor: '#2684ff' }}
          onResizeStart={() => { if (!resizing.current) { resizing.current = true; useTEMStore.temporal.getState().pause(); } }}
          onResize={(_e, p) => updateNote(data.id, { width: p.width, height: p.height })}
          onResizeEnd={() => { if (resizing.current) { resizing.current = false; useTEMStore.temporal.getState().resume(); } }}
        />
      )}
      <div
        style={{
          ...visual,
          width: data.width,
          height: data.height,
          boxSizing: 'border-box',
          padding: 6,
          fontSize,
          lineHeight: 1.4,
          color: '#333',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          boxShadow: selected ? '0 0 0 2px #2684ff' : '1px 1px 3px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
        onDoubleClick={(e) => {
          if (isPreview) return;
          e.stopPropagation();
          setEditing(true);
        }}
        title={isPreview ? undefined : 'メモ（ダブルクリック / Enter で編集）'}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
              else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none',
              background: 'transparent', fontSize, lineHeight: 1.4, fontFamily: 'inherit', color: '#333',
            }}
          />
        ) : (
          data.text || <span style={{ color: '#999' }}>（メモ）</span>
        )}
      </div>
    </>
  );
}

// ----------------------------------------------------------------------------
// 引き出し線オーバーレイ: showLeader && leaderTo のメモから対象の中心へ点線
// ----------------------------------------------------------------------------

export function NoteLeaderOverlay() {
  const view = useTEMView();
  const sheet = view.sheet;
  const transform = useReactFlowStore((s) => s.transform);
  if (!sheet || sheet.notes.length === 0) return null;
  const [panX, panY, zoom] = transform;
  const toScreen = (x: number, y: number) => ({ x: x * zoom + panX, y: y * zoom + panY });

  const segments: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }> = [];
  const needSdsg = sheet.notes.some((n) => n.showLeader && n.leaderTo && sheet.sdsg.some((s) => s.id === n.leaderTo));
  const sdsgRects = needSdsg ? collectSDSGRects(sheet, view.settings.layout, view.settings) : [];
  sheet.notes.forEach((n) => {
    if (!n.showLeader || !n.leaderTo) return;
    const box = sheet.boxes.find((b) => b.id === n.leaderTo);
    let tx: number | undefined; let ty: number | undefined;
    if (box) { tx = box.x + box.width / 2; ty = box.y + box.height / 2; }
    else {
      const sg = sdsgRects.find((r) => r.sdsg.id === n.leaderTo);
      if (sg) { tx = sg.rect.x + sg.rect.width / 2; ty = sg.rect.y + sg.rect.height / 2; }
    }
    if (tx === undefined || ty === undefined) return;
    const from = toScreen(n.x + n.width / 2, n.y + n.height / 2);
    const to = toScreen(tx, ty);
    segments.push({ id: n.id, x1: from.x, y1: from.y, x2: to.x, y2: to.y });
  });
  if (segments.length === 0) return null;

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}
    >
      {segments.map((s) => (
        <line
          key={s.id}
          x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="#888" strokeWidth={1.2} strokeDasharray="5,4"
        />
      ))}
    </svg>
  );
}
