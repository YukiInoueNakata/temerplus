// ============================================================================
// TranscriptViewer - インタビュー原文ビューア
// - 左ペイン: Transcript リスト + 検索ボックス
// - 中央: 段落本文（編集可、選択範囲から Box リンク作成）
// - 右ペイン: 段落に紐付く SourceRef 一覧
// - リンク済範囲を Box 色でハイライト + 右肩 Box ID タグ
//   重なりは underline で多重表現
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTEMStore, useActiveSheet } from '../store/store';
import { BOX_TYPE_LABELS } from '../store/defaults';
import type { BoxType, Paragraph, Participant, SourceRef, Transcript } from '../types';
import { TranscriptImportDialog } from './TranscriptImportDialog';
import { TranscriptBulkImportDialog } from './TranscriptBulkImportDialog';
import { AnonymizeExportDialog } from './AnonymizeExportDialog';

type LinkTarget = { type: 'box' | 'line' | 'sdsg'; id: string };

// Box type ごとの代表色（ハイライト用、薄い背景）
const BOX_TYPE_COLOR: Record<BoxType, string> = {
  'normal':     '#9aa0a6',
  'OPP':        '#e74c3c',
  'BFP':        '#3498db',
  'EFP':        '#27ae60',
  'P-EFP':      '#16a085',
  '2nd-EFP':    '#2ecc71',
  'P-2nd-EFP':  '#1abc9c',
  'annotation': '#95a5a6',
};

function withAlpha(hex: string, alpha: number): string {
  // hex は #RRGGBB
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return hex + a;
}

// ----------------------------------------------------------------------------

export function TranscriptViewer({
  open,
  onClose,
  focusBoxId,
  autoOpenImport,
}: {
  open: boolean;
  onClose: () => void;
  focusBoxId?: string;             // 起動時にフォーカスする Box（PropertyPanel から起動時など）
  autoOpenImport?: boolean;        // 起動時に取り込みダイアログも自動 open (起動ウィザード経由)
}) {
  const transcripts = useTEMStore((s) => s.doc.transcripts);
  const participants = useTEMStore((s) => s.doc.participants);
  const splitParagraph = useTEMStore((s) => s.splitParagraph);
  const mergeParagraphWithNext = useTEMStore((s) => s.mergeParagraphWithNext);
  const updateParagraphText = useTEMStore((s) => s.updateParagraphText);
  const updateParagraphMeta = useTEMStore((s) => s.updateParagraphMeta);
  const removeTranscript = useTEMStore((s) => s.removeTranscript);
  const addSourceRef = useTEMStore((s) => s.addSourceRef);
  const removeSourceRef = useTEMStore((s) => s.removeSourceRef);
  const addBox = useTEMStore((s) => s.addBox);
  const sheet = useActiveSheet();

  const [activeTranscriptId, setActiveTranscriptId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [anonExportOpen, setAnonExportOpen] = useState(false);
  // モーダルの位置 (null = 中央自動配置) とサイズ
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 1100, height: Math.round(window.innerHeight * 0.85) });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, dlgX: 0, dlgY: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });
  // 左右ペイン幅
  const [leftPaneWidth, setLeftPaneWidth] = useState(220);
  const [rightPaneWidth, setRightPaneWidth] = useState(260);
  const [paneResizing, setPaneResizing] = useState<'left' | 'right' | null>(null);
  const paneResizeStart = useRef({ mouseX: 0, w: 0 });
  // 選択中の段落 ID と選択された文字範囲（charStart..charEnd）
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  // リンク作成ダイアログ
  const [linkDialog, setLinkDialog] = useState<{
    paragraph: Paragraph;
    range: { start: number; end: number } | null;       // null = 段落全体
  } | null>(null);
  // 一括リンクダイアログ (検索ヒット用)
  // 複数 Transcript にまたがる横断検索ヒットにも対応するため
  // (transcriptId, paragraphId) のペア配列を渡す
  const [bulkLinkDialog, setBulkLinkDialog] = useState<{
    candidates: Array<{ transcriptId: string; paragraphId: string }>;
  } | null>(null);
  // 検索モード:
  //   'current'     = 表示中 Transcript 内のみ
  //   'participant' = 現在 Transcript と同一 participantId の全 Transcript
  //   'all'         = 全 Transcript 横断
  const [searchMode, setSearchMode] = useState<'current' | 'participant' | 'all'>('current');
  // 未リンク段落フィルタ (F)
  const [onlyUnlinked, setOnlyUnlinked] = useState(false);
  // unresolved リンク再接続ダイアログ
  const [reconnectDialog, setReconnectDialog] = useState<{
    ref: SourceRef;
    target: LinkTarget;
  } | null>(null);

  // 初期: 1 つ目を選択
  useEffect(() => {
    if (open && transcripts.length > 0 && !activeTranscriptId) {
      setActiveTranscriptId(transcripts[0].id);
    }
  }, [open, transcripts, activeTranscriptId]);

  // ドラッグ移動
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setPos({ x: dragStart.current.dlgX + dx, y: dragStart.current.dlgY + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  // リサイズ
  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.mouseX;
      const dy = e.clientY - resizeStart.current.mouseY;
      setSize({
        width: Math.max(560, resizeStart.current.w + dx),
        height: Math.max(360, resizeStart.current.h + dy),
      });
    };
    const onUp = () => setResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing]);

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const cur = pos ?? { x: (window.innerWidth - size.width) / 2, y: (window.innerHeight - size.height) / 2 };
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, dlgX: cur.x, dlgY: cur.y };
    setPos(cur);
    setDragging(true);
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, w: size.width, h: size.height };
    setResizing(true);
  };

  // 左右ペインのリサイズ
  useEffect(() => {
    if (!paneResizing) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - paneResizeStart.current.mouseX;
      if (paneResizing === 'left') {
        // 左ペイン: 右にドラッグで広がる
        setLeftPaneWidth(Math.max(120, Math.min(size.width - 360, paneResizeStart.current.w + dx)));
      } else {
        // 右ペイン: 左にドラッグで広がる
        setRightPaneWidth(Math.max(160, Math.min(size.width - 360, paneResizeStart.current.w - dx)));
      }
    };
    const onUp = () => setPaneResizing(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [paneResizing, size.width]);

  const onLeftPaneResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    paneResizeStart.current = { mouseX: e.clientX, w: leftPaneWidth };
    setPaneResizing('left');
  };
  const onRightPaneResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    paneResizeStart.current = { mouseX: e.clientX, w: rightPaneWidth };
    setPaneResizing('right');
  };

  // autoOpenImport: open=true になったタイミングでインポートダイアログも開く
  useEffect(() => {
    if (open && autoOpenImport) setImportOpen(true);
  }, [open, autoOpenImport]);

  // focusBoxId が指定されていれば、その Box の最初の SourceRef にジャンプ
  useEffect(() => {
    if (!open || !focusBoxId || !sheet) return;
    const box = sheet.boxes.find((b) => b.id === focusBoxId);
    const ref = box?.sourceRefs?.[0];
    if (ref) {
      setActiveTranscriptId(ref.transcriptId);
      setSelectedParagraphId(ref.paragraphId);
      // スクロールは描画後に
      setTimeout(() => {
        const el = document.querySelector(`[data-paragraph-id="${ref.paragraphId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [open, focusBoxId, sheet]);

  const activeTranscript = transcripts.find((t) => t.id === activeTranscriptId) ?? null;

  // 全 SourceRef を集約（多対多のため Box/Line/SDSG 全てから取得）
  const allSourceRefs = useMemo(() => {
    if (!sheet) return [];
    const list: Array<{ ref: SourceRef; target: LinkTarget; label: string; color: string }> = [];
    for (const b of sheet.boxes) {
      for (const r of b.sourceRefs ?? []) {
        list.push({ ref: r, target: { type: 'box', id: b.id }, label: b.label || b.id, color: BOX_TYPE_COLOR[b.type] });
      }
    }
    for (const l of sheet.lines) {
      for (const r of l.sourceRefs ?? []) {
        list.push({ ref: r, target: { type: 'line', id: l.id }, label: l.label || l.id, color: '#7f8c8d' });
      }
    }
    for (const sg of sheet.sdsg) {
      for (const r of sg.sourceRefs ?? []) {
        list.push({ ref: r, target: { type: 'sdsg', id: sg.id }, label: sg.label || sg.id, color: sg.type === 'SD' ? '#9b59b6' : '#27ae60' });
      }
    }
    return list;
  }, [sheet]);

  // 全 Transcript の全段落から収集した一意なタグ一覧 (補完候補用)
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of transcripts) {
      for (const p of t.paragraphs) {
        if (p.tags) for (const tag of p.tags) set.add(tag);
      }
    }
    return Array.from(set).sort();
  }, [transcripts]);

  // 現在 Transcript 内検索 (中央ペインのハイライト用): 段落 ID セット
  const searchHits = useMemo(() => {
    if (!search || !activeTranscript) return null;
    const lower = search.toLowerCase();
    return new Set(activeTranscript.paragraphs.filter((p) => p.text.toLowerCase().includes(lower)).map((p) => p.id));
  }, [search, activeTranscript]);

  // 横断検索ヒット: 'all' または 'participant' モード時に複数 Transcript を対象に検索
  // hit には participantId / sessionNumber も含めて、結果側でグルーピング表示できるようにする
  const crossHits = useMemo(() => {
    if (!search) return null;
    if (searchMode === 'current') return null;
    const lower = search.toLowerCase();
    const targetTranscripts =
      searchMode === 'participant'
        ? transcripts.filter((t) =>
            activeTranscript?.participantId
              ? t.participantId === activeTranscript.participantId
              : !t.participantId,
          )
        : transcripts;
    const hits: Array<{
      transcriptId: string;
      paragraphId: string;
      transcriptTitle: string;
      participantId?: string;
      sessionNumber?: number;
      paragraphIndex: number;
      speaker?: string;
      text: string;
    }> = [];
    for (const t of targetTranscripts) {
      for (const p of t.paragraphs) {
        if (p.text.toLowerCase().includes(lower)) {
          hits.push({
            transcriptId: t.id,
            paragraphId: p.id,
            transcriptTitle: t.title,
            participantId: t.participantId,
            sessionNumber: t.sessionNumber,
            paragraphIndex: p.index,
            speaker: p.speaker,
            text: p.text,
          });
        }
      }
    }
    return hits;
  }, [search, searchMode, transcripts, activeTranscript]);

  const popout = () => {
    // 簡易 popout: 現在の URL のクエリ ?popout=transcript-viewer で別ウィンドウを開く
    // 将来的に Broadcast Channel で state を同期するが、MVP は親ウィンドウと独立した一時状態を持つだけ
    const url = `${location.origin}${location.pathname}?popout=transcript-viewer`;
    window.open(url, 'temer-transcript-viewer', 'width=800,height=900,resizable=yes');
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          style={pos
            ? { width: size.width, height: size.height, maxWidth: '98vw', maxHeight: '98vh', position: 'absolute', left: pos.x, top: pos.y, margin: 0, display: 'flex', flexDirection: 'column' }
            : { width: size.width, height: size.height, maxWidth: '98vw', maxHeight: '98vh', position: 'relative', display: 'flex', flexDirection: 'column' }
          }
        >
          <div
            className="modal-header"
            onMouseDown={onHeaderMouseDown}
            style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
            title="ドラッグで移動"
          >
            <h3>インタビュー原文ビューア {activeTranscript && `— ${activeTranscript.title}`}</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="ribbon-btn-small" onClick={() => setImportOpen(true)}>＋ 原文を取り込む</button>
              <button
                className="ribbon-btn-small"
                onClick={() => setBulkImportOpen(true)}
                title="複数ファイル/フォルダから一括取り込み (ファイル名から協力者・回数を自動推測)"
              >📦 一括取り込み</button>
              {transcripts.length > 0 && (
                <button
                  className="ribbon-btn-small"
                  onClick={() => setAnonExportOpen(true)}
                  title="人名・組織名を仮名に置換した .tem を別ファイルとして書き出す"
                >🔒 匿名化エクスポート</button>
              )}
              <button className="ribbon-btn-small" onClick={popout} title="別ウィンドウで開く">⛶</button>
              <button onClick={onClose} className="modal-close">×</button>
            </div>
          </div>

          {transcripts.length === 0 ? (
            <div className="modal-body" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <p>まだ原文が登録されていません。</p>
              <button className="ribbon-btn-primary" onClick={() => setImportOpen(true)}>原文ファイルを取り込む</button>
              <p className="hint">対応形式: .txt / .csv / .xlsx / .docx</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* 左ペイン: Transcript リスト (協力者ごとにグループ化) */}
              <div style={{ width: leftPaneWidth, flexShrink: 0, borderRight: '1px solid #ddd', overflow: 'auto', padding: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>原文 (協力者別)</div>
                <ParticipantGroupedTranscriptList
                  transcripts={transcripts}
                  participants={participants}
                  activeTranscriptId={activeTranscriptId}
                  onSelect={(id) => { setActiveTranscriptId(id); setSelectedParagraphId(null); }}
                  onRemove={(t) => {
                    if (confirm(`「${t.title}」を削除しますか？\nこの原文を参照している全ての SourceRef も削除されます。`)) {
                      removeTranscript(t.id);
                      setActiveTranscriptId(null);
                    }
                  }}
                />
              </div>

              {/* 左ペイン リサイザ */}
              <div
                onMouseDown={onLeftPaneResizeStart}
                title="ドラッグで左ペインの幅を変更"
                style={{
                  width: 5,
                  cursor: 'col-resize',
                  background: paneResizing === 'left' ? '#4a90e2' : 'transparent',
                  flexShrink: 0,
                }}
              />

              {/* 中央: 段落本文 */}
              <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder={
                      searchMode === 'all' ? '全原文を横断検索' :
                      searchMode === 'participant' ? '同じ協力者の全回を検索' :
                      '検索キーワード (現在の原文)'
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: '4px 8px' }}
                  />
                  <select
                    value={searchMode}
                    onChange={(e) => setSearchMode(e.target.value as 'current' | 'participant' | 'all')}
                    style={{ fontSize: 12, padding: '3px 4px' }}
                    title="検索範囲"
                  >
                    <option value="current">現在の原文</option>
                    <option value="participant" disabled={!activeTranscript?.participantId}>
                      同じ協力者の全回
                    </option>
                    <option value="all">全原文を横断</option>
                  </select>
                  {searchMode === 'current' && searchHits && (
                    <span style={{ fontSize: 12 }}>ヒット {searchHits.size} 段落</span>
                  )}
                  {searchMode !== 'current' && crossHits && (
                    <span style={{ fontSize: 12 }}>
                      ヒット {crossHits.length} 段落
                      （{new Set(crossHits.map((h) => h.transcriptId)).size} 原文）
                    </span>
                  )}
                  {/* 一括リンクボタン */}
                  {searchMode === 'current' && searchHits && searchHits.size > 0 && activeTranscriptId && (
                    <button
                      className="ribbon-btn-small"
                      onClick={() => setBulkLinkDialog({
                        candidates: Array.from(searchHits).map((pid) => ({
                          transcriptId: activeTranscriptId,
                          paragraphId: pid,
                        })),
                      })}
                      title="ヒットした段落を Box に一括リンク"
                    >
                      一括リンク...
                    </button>
                  )}
                  {searchMode !== 'current' && crossHits && crossHits.length > 0 && (
                    <button
                      className="ribbon-btn-small"
                      onClick={() => setBulkLinkDialog({
                        candidates: crossHits.map((h) => ({
                          transcriptId: h.transcriptId,
                          paragraphId: h.paragraphId,
                        })),
                      })}
                      title="横断ヒットを Box に一括リンク (複数原文/複数回を 1 Box にまとめる)"
                    >
                      {searchMode === 'all' ? '横断一括リンク...' : '協力者一括リンク...'}
                    </button>
                  )}
                  <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }} title="まだ Box にリンクされていない段落だけ表示">
                    <input
                      type="checkbox"
                      checked={onlyUnlinked}
                      onChange={(e) => setOnlyUnlinked(e.target.checked)}
                    />
                    未リンクのみ
                  </label>
                </div>

                {searchMode !== 'current' && search && crossHits ? (
                  <CrossSearchResults
                    hits={crossHits}
                    keyword={search}
                    participants={participants}
                    onJump={(transcriptId, paragraphId) => {
                      setSearchMode('current');
                      setActiveTranscriptId(transcriptId);
                      setSelectedParagraphId(paragraphId);
                      setSelectedRange(null);
                      // 描画後にスクロール
                      setTimeout(() => {
                        const el = document.querySelector(`[data-paragraph-id="${paragraphId}"]`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                  />
                ) : activeTranscript ? (
                  <ParagraphList
                    transcript={activeTranscript}
                    allSourceRefs={allSourceRefs}
                    searchHits={searchHits}
                    selectedParagraphId={selectedParagraphId}
                    onlyUnlinked={onlyUnlinked}
                    allTags={allTags}
                    onSelectParagraph={(id, range) => {
                      setSelectedParagraphId(id);
                      setSelectedRange(range);
                    }}
                    onUpdateText={(pid, newText) => updateParagraphText(activeTranscript.id, pid, newText)}
                    onUpdateMeta={(pid, patch) => updateParagraphMeta(activeTranscript.id, pid, patch)}
                    onOpenLinkDialog={(p, range) => setLinkDialog({ paragraph: p, range })}
                    onSplit={(pid, offset) => splitParagraph(activeTranscript.id, pid, offset)}
                    onMergeWithNext={(pid) => mergeParagraphWithNext(activeTranscript.id, pid)}
                  />
                ) : (
                  <p>左ペインから原文を選択してください。</p>
                )}
              </div>

              {/* 右ペイン リサイザ */}
              <div
                onMouseDown={onRightPaneResizeStart}
                title="ドラッグで右ペインの幅を変更"
                style={{
                  width: 5,
                  cursor: 'col-resize',
                  background: paneResizing === 'right' ? '#4a90e2' : 'transparent',
                  flexShrink: 0,
                }}
              />

              {/* 右ペイン: 選択段落のリンク一覧 */}
              <div style={{ width: rightPaneWidth, flexShrink: 0, borderLeft: '1px solid #ddd', overflow: 'auto', padding: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>引用リンク一覧</div>
                {selectedParagraphId ? (
                  <RefListForParagraph
                    paragraphId={selectedParagraphId}
                    allSourceRefs={allSourceRefs}
                    onRemove={(ref, target) => removeSourceRef(target, ref.id)}
                    onReconnect={(ref, target) => setReconnectDialog({ ref, target })}
                  />
                ) : (
                  <p style={{ fontSize: 12, color: '#666' }}>段落を選択するとここに表示</p>
                )}
                {selectedParagraphId && selectedRange && (
                  <div style={{ marginTop: 12, padding: 8, background: '#fff3cd', borderRadius: 4, fontSize: 12 }}>
                    選択範囲: {selectedRange.start}〜{selectedRange.end} 文字
                    <button
                      style={{ display: 'block', marginTop: 6, fontSize: 11 }}
                      onClick={() => {
                        const p = activeTranscript?.paragraphs.find((x) => x.id === selectedParagraphId);
                        if (p) setLinkDialog({ paragraph: p, range: selectedRange });
                      }}
                    >この範囲を Box にリンク</button>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* 右下リサイズハンドル */}
          <div
            onMouseDown={onResizeMouseDown}
            title="ドラッグでサイズ変更"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 16,
              height: 16,
              cursor: 'nwse-resize',
              background: 'linear-gradient(135deg, transparent 50%, #999 50%, #999 60%, transparent 60%, transparent 70%, #999 70%, #999 80%, transparent 80%)',
              zIndex: 10,
            }}
          />
        </div>
      </div>

      {/* リンク作成ダイアログ */}
      {linkDialog && activeTranscript && (
        <LinkCreationDialog
          paragraph={linkDialog.paragraph}
          range={linkDialog.range}
          transcript={activeTranscript}
          onClose={() => setLinkDialog(null)}
          onCreateNewBox={(boxType, label) => {
            const p = linkDialog.paragraph;
            const range = linkDialog.range;
            const quoteText = range ? p.text.slice(range.start, range.end) : p.text;
            const boxId = addBox({ type: boxType, label, description: quoteText });
            addSourceRef({ type: 'box', id: boxId }, {
              transcriptId: activeTranscript.id,
              paragraphId: p.id,
              charStart: range?.start,
              charEnd: range?.end,
              quoteText,
            });
            setLinkDialog(null);
          }}
          onLinkExisting={(target) => {
            const p = linkDialog.paragraph;
            const range = linkDialog.range;
            const quoteText = range ? p.text.slice(range.start, range.end) : p.text;
            addSourceRef(target, {
              transcriptId: activeTranscript.id,
              paragraphId: p.id,
              charStart: range?.start,
              charEnd: range?.end,
              quoteText,
            });
            setLinkDialog(null);
          }}
        />
      )}

      {/* 一括リンクダイアログ (検索ヒット用、横断対応) */}
      {bulkLinkDialog && (
        <BulkLinkDialog
          transcripts={transcripts}
          candidates={bulkLinkDialog.candidates}
          onClose={() => setBulkLinkDialog(null)}
          onConfirm={(selectedPairs, mode) => {
            // ペアから (transcript, paragraph) を解決
            const resolved = selectedPairs
              .map((pair) => {
                const t = transcripts.find((x) => x.id === pair.transcriptId);
                const p = t?.paragraphs.find((x) => x.id === pair.paragraphId);
                return t && p ? { t, p } : null;
              })
              .filter((x): x is { t: Transcript; p: Paragraph } => !!x);
            if (mode.kind === 'new-box') {
              // 1 Box を作成し、選択した全段落を SourceRef として追加（段落全体）
              // 横断時は description に Transcript title も入れる
              const desc = resolved.length === 1
                ? resolved[0].p.text
                : resolved
                    .map(({ t, p }) => `[${t.title} §${p.index + 1}] ${p.text}`)
                    .join('\n\n');
              const boxId = addBox({ type: mode.boxType, label: mode.label, description: desc });
              for (const { t, p } of resolved) {
                addSourceRef({ type: 'box', id: boxId }, {
                  transcriptId: t.id,
                  paragraphId: p.id,
                  quoteText: p.text,
                });
              }
            } else {
              // 既存要素に複数 SourceRef を追加
              for (const { t, p } of resolved) {
                addSourceRef(mode.target, {
                  transcriptId: t.id,
                  paragraphId: p.id,
                  quoteText: p.text,
                });
              }
            }
            setBulkLinkDialog(null);
          }}
        />
      )}

      {/* リンク再接続ダイアログ */}
      {reconnectDialog && (
        <ReconnectDialog
          sourceRef={reconnectDialog.ref}
          target={reconnectDialog.target}
          onClose={() => setReconnectDialog(null)}
        />
      )}

      <TranscriptImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(id) => setActiveTranscriptId(id)}
      />

      <TranscriptBulkImportDialog
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
      />

      <AnonymizeExportDialog
        open={anonExportOpen}
        onClose={() => setAnonExportOpen(false)}
      />
    </>
  );
}

// ----------------------------------------------------------------------------
// 協力者ごとにグループ化した Transcript リスト (左ペイン)
// ----------------------------------------------------------------------------

function ParticipantGroupedTranscriptList({
  transcripts,
  participants,
  activeTranscriptId,
  onSelect,
  onRemove,
}: {
  transcripts: Transcript[];
  participants: Participant[];
  activeTranscriptId: string | null;
  onSelect: (id: string) => void;
  onRemove: (t: Transcript) => void;
}) {
  // participantId -> Transcript[] へグルーピング
  // - participants の順序を維持
  // - participantId 未指定 Transcript は最後に '(未割当)' として
  const grouped = useMemo(() => {
    const map = new Map<string, Transcript[]>();
    for (const p of participants) map.set(p.id, []);
    map.set('__unassigned__', []);
    for (const t of transcripts) {
      const key = t.participantId && map.has(t.participantId) ? t.participantId : '__unassigned__';
      map.get(key)!.push(t);
    }
    // 各グループ内: sessionNumber 順、未指定は最後 (importedAt 順)
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const sa = a.sessionNumber ?? Number.POSITIVE_INFINITY;
        const sb = b.sessionNumber ?? Number.POSITIVE_INFINITY;
        if (sa !== sb) return sa - sb;
        return (a.importedAt ?? '').localeCompare(b.importedAt ?? '');
      });
    }
    return map;
  }, [transcripts, participants]);

  const renderGroup = (heading: string, list: Transcript[], isUnassigned: boolean) => {
    if (list.length === 0) return null;
    return (
      <div key={heading} style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isUnassigned ? '#888' : '#1e6091',
            borderBottom: '1px solid #eee',
            padding: '2px 0 3px',
            marginBottom: 4,
          }}
        >
          {heading} ({list.length})
        </div>
        {list.map((t) => {
          const isActive = t.id === activeTranscriptId;
          const sessionLabel = t.sessionNumber ? `第${t.sessionNumber}回` : '(回数未指定)';
          return (
            <div key={t.id} style={{ marginBottom: 4 }}>
              <button
                onClick={() => onSelect(t.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '5px 7px',
                  background: isActive ? '#e8f0fe' : 'transparent',
                  border: '1px solid ' + (isActive ? '#4a90e2' : '#e0e0e0'),
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  <span style={{ color: '#888', fontWeight: 400, marginRight: 4 }}>{sessionLabel}</span>
                  {t.title}
                </div>
                <div style={{ color: '#666', fontSize: 11 }}>
                  {t.paragraphs.length} 段落 / {t.source}
                </div>
              </button>
              {isActive && (
                <button
                  onClick={() => onRemove(t)}
                  style={{ fontSize: 11, padding: '2px 6px', marginTop: 2, color: '#c0392b' }}
                >削除</button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {participants.map((p) =>
        renderGroup(p.pseudonym ?? p.id, grouped.get(p.id) ?? [], false)
      )}
      {renderGroup('(未割当)', grouped.get('__unassigned__') ?? [], true)}
    </>
  );
}

// ----------------------------------------------------------------------------
// 段落リスト
// ----------------------------------------------------------------------------

function ParagraphList({
  transcript,
  allSourceRefs,
  searchHits,
  selectedParagraphId,
  onlyUnlinked,
  allTags,
  onSelectParagraph,
  onUpdateText,
  onUpdateMeta,
  onOpenLinkDialog,
  onSplit,
  onMergeWithNext,
}: {
  transcript: Transcript;
  allSourceRefs: Array<{ ref: SourceRef; target: LinkTarget; label: string; color: string }>;
  searchHits: Set<string> | null;
  selectedParagraphId: string | null;
  onlyUnlinked: boolean;
  allTags: string[];
  onSelectParagraph: (id: string, range: { start: number; end: number } | null) => void;
  onUpdateText: (paragraphId: string, newText: string) => void;
  onUpdateMeta: (paragraphId: string, patch: { speaker?: string; timestamp?: string; tags?: string[]; note?: string }) => void;
  onOpenLinkDialog: (p: Paragraph, range: { start: number; end: number } | null) => void;
  onSplit: (paragraphId: string, offset: number) => void;
  onMergeWithNext: (paragraphId: string) => void;
}) {
  const visibleParagraphs = onlyUnlinked
    ? transcript.paragraphs.filter((p) => !allSourceRefs.some((x) => x.ref.paragraphId === p.id))
    : transcript.paragraphs;
  return (
    <div>
      {onlyUnlinked && (
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px' }}>
          未リンク段落のみ表示中: {visibleParagraphs.length} / {transcript.paragraphs.length} 段落
        </p>
      )}
      {visibleParagraphs.map((p, i) => {
        const refs = allSourceRefs.filter((x) => x.ref.paragraphId === p.id);
        const isHit = searchHits ? searchHits.has(p.id) : false;
        const isSelected = selectedParagraphId === p.id;
        const isLast = i === visibleParagraphs.length - 1;
        return (
          <ParagraphRow
            key={p.id}
            paragraph={p}
            refs={refs}
            isHit={isHit}
            isSelected={isSelected}
            isLast={isLast}
            allTags={allTags}
            onSelect={(range) => onSelectParagraph(p.id, range)}
            onUpdateText={(newText) => onUpdateText(p.id, newText)}
            onUpdateMeta={(patch) => onUpdateMeta(p.id, patch)}
            onOpenLinkDialog={(range) => onOpenLinkDialog(p, range)}
            onSplit={(offset) => onSplit(p.id, offset)}
            onMergeWithNext={() => onMergeWithNext(p.id)}
          />
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 1 段落の描画 + 編集 + ハイライト
// ----------------------------------------------------------------------------

function ParagraphRow({
  paragraph,
  refs,
  isHit,
  isSelected,
  isLast,
  allTags,
  onSelect,
  onUpdateText,
  onUpdateMeta,
  onOpenLinkDialog,
  onSplit,
  onMergeWithNext,
}: {
  paragraph: Paragraph;
  refs: Array<{ ref: SourceRef; target: LinkTarget; label: string; color: string }>;
  isHit: boolean;
  isSelected: boolean;
  isLast: boolean;
  allTags: string[];
  onSelect: (range: { start: number; end: number } | null) => void;
  onUpdateText: (newText: string) => void;
  onUpdateMeta: (patch: { speaker?: string; timestamp?: string; tags?: string[]; note?: string }) => void;
  onOpenLinkDialog: (range: { start: number; end: number } | null) => void;
  onSplit: (offset: number) => void;
  onMergeWithNext: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(paragraph.text);
  const [draftOffset, setDraftOffset] = useState(0);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteDraft, setNoteDraft] = useState(paragraph.note ?? '');
  const [tagInput, setTagInput] = useState('');

  // 段落本文を文字単位で分割し、各文字に被さる SourceRef を集める
  const segments = useMemo(() => buildHighlightSegments(paragraph.text, refs), [paragraph.text, refs]);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      onSelect(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const container = document.querySelector(`[data-paragraph-id="${paragraph.id}"] .paragraph-body`);
    if (!container || !container.contains(range.commonAncestorContainer)) {
      onSelect(null);
      return;
    }
    if (sel.isCollapsed) {
      onSelect(null);
      return;
    }
    // 範囲の開始/終了オフセットを段落内文字 index に変換
    const start = getOffsetInContainer(container as HTMLElement, range.startContainer, range.startOffset);
    const end = getOffsetInContainer(container as HTMLElement, range.endContainer, range.endOffset);
    if (start === null || end === null || start === end) {
      onSelect(null);
      return;
    }
    const [s, e] = start < end ? [start, end] : [end, start];
    onSelect({ start: s, end: e });
  };

  return (
    <div
      data-paragraph-id={paragraph.id}
      style={{
        marginBottom: 12,
        padding: 8,
        background: isHit ? '#fff8d6' : isSelected ? '#f0f7ff' : 'transparent',
        border: '1px solid ' + (isSelected ? '#4a90e2' : '#eee'),
        borderRadius: 4,
      }}
      onMouseDown={() => onSelect(null)}
      onMouseUp={handleMouseUp}
    >
      <div style={{ fontSize: 11, color: '#666', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>§{paragraph.index + 1}</span>
        {editing ? (
          <>
            <input
              type="text"
              defaultValue={paragraph.speaker ?? ''}
              placeholder="話者"
              onBlur={(e) => onUpdateMeta({ speaker: e.target.value || undefined })}
              style={{ width: 80, fontSize: 11 }}
            />
            <input
              type="text"
              defaultValue={paragraph.timestamp ?? ''}
              placeholder="時刻"
              onBlur={(e) => onUpdateMeta({ timestamp: e.target.value || undefined })}
              style={{ width: 80, fontSize: 11 }}
            />
          </>
        ) : (
          <>
            {paragraph.speaker && <strong style={{ color: '#2c3e50' }}>[{paragraph.speaker}]</strong>}
            {paragraph.timestamp && <span>{paragraph.timestamp}</span>}
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {!editing && refs.length > 0 && <span style={{ fontSize: 10, color: '#e67e22' }}>★ {refs.length} リンク</span>}
          {paragraph.note && !showNoteEditor && (
            <span style={{ fontSize: 10, color: '#8e44ad', cursor: 'pointer' }} onClick={(ev) => { ev.stopPropagation(); setShowNoteEditor(true); }} title={paragraph.note}>
              📝 メモ
            </span>
          )}
          <button style={{ fontSize: 10 }} onClick={(ev) => { ev.stopPropagation(); onOpenLinkDialog(null); }}>段落全体をリンク</button>
          <button style={{ fontSize: 10 }} onClick={(ev) => { ev.stopPropagation(); setShowNoteEditor(!showNoteEditor); if (!showNoteEditor) setNoteDraft(paragraph.note ?? ''); }}>
            {showNoteEditor ? 'メモ閉' : 'メモ'}
          </button>
          <button style={{ fontSize: 10 }} onClick={(ev) => { ev.stopPropagation(); setEditing(!editing); if (!editing) { setDraft(paragraph.text); setDraftOffset(0); } }}>
            {editing ? 'プレビュー' : '編集'}
          </button>
          {editing && (
            <button
              style={{ fontSize: 10, color: '#1e6091' }}
              disabled={draftOffset <= 0 || draftOffset >= draft.length}
              onClick={(ev) => {
                ev.stopPropagation();
                // 編集中の draft をまず保存 → 分割
                if (draft !== paragraph.text) onUpdateText(draft);
                onSplit(draftOffset);
                setEditing(false);
              }}
              title="キャレット位置でこの段落を 2 つに分割"
            >ここで分割</button>
          )}
          {!isLast && (
            <button
              style={{ fontSize: 10, color: '#1e6091' }}
              onClick={(ev) => {
                ev.stopPropagation();
                if (confirm('次の段落と結合しますか？\n後段落の引用リンクは前段落に統合され、charStart/charEnd は再計算されます。')) {
                  onMergeWithNext();
                }
              }}
              title="次の段落と結合"
            >↓結合</button>
          )}
        </div>
      </div>

      {/* タグ表示・編集 */}
      <ParagraphTagsRow
        tags={paragraph.tags ?? []}
        allTags={allTags}
        input={tagInput}
        onInputChange={setTagInput}
        onAdd={(t) => {
          const trimmed = t.trim();
          if (!trimmed) return;
          const next = Array.from(new Set([...(paragraph.tags ?? []), trimmed]));
          onUpdateMeta({ tags: next });
          setTagInput('');
        }}
        onRemove={(t) => {
          onUpdateMeta({ tags: (paragraph.tags ?? []).filter((x) => x !== t) });
        }}
      />

      {/* メモエディタ */}
      {showNoteEditor && (
        <div style={{ background: '#faf5ff', border: '1px solid #d6bcfa', borderRadius: 4, padding: 6, marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: '#6b46c1', marginBottom: 4 }}>段落メモ</div>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={() => { if (noteDraft !== (paragraph.note ?? '')) onUpdateMeta({ note: noteDraft }); }}
            placeholder="ここは要確認 / 後で再検討 / ...などの分析メモ"
            style={{ width: '100%', minHeight: 50, fontSize: 12, fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>
      )}

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            const t = e.target as HTMLTextAreaElement;
            setDraftOffset(t.selectionStart ?? 0);
          }}
          onClick={(e) => {
            const t = e.target as HTMLTextAreaElement;
            setDraftOffset(t.selectionStart ?? 0);
          }}
          onKeyUp={(e) => {
            const t = e.target as HTMLTextAreaElement;
            setDraftOffset(t.selectionStart ?? 0);
          }}
          onBlur={() => { if (draft !== paragraph.text) onUpdateText(draft); }}
          style={{ width: '100%', minHeight: 80, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
        />
      ) : (
        <div className="paragraph-body" style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', userSelect: 'text' }}>
          {segments.map((seg, i) => (
            <HighlightSpan key={i} seg={seg} />
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 段落タグ編集行
// ----------------------------------------------------------------------------

function ParagraphTagsRow({
  tags,
  allTags,
  input,
  onInputChange,
  onAdd,
  onRemove,
}: {
  tags: string[];
  allTags: string[];
  input: string;
  onInputChange: (v: string) => void;
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
}) {
  const suggestions = useMemo(() => {
    if (!input.trim()) return [];
    const lower = input.toLowerCase();
    return allTags.filter((t) => t.toLowerCase().includes(lower) && !tags.includes(t)).slice(0, 6);
  }, [input, allTags, tags]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 4, fontSize: 11 }}>
      <span style={{ color: '#888' }}>🏷</span>
      {tags.map((t) => (
        <span
          key={t}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            background: '#e0f2fe',
            border: '1px solid #7dd3fc',
            borderRadius: 10,
            padding: '1px 6px',
            color: '#0c4a6e',
          }}
        >
          {t}
          <button
            style={{ fontSize: 9, padding: 0, background: 'transparent', border: 'none', color: '#0369a1', cursor: 'pointer' }}
            onClick={(ev) => { ev.stopPropagation(); onRemove(t); }}
            title="タグ削除"
          >×</button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            onAdd(input);
          }
        }}
        onBlur={() => { if (input.trim()) onAdd(input); }}
        placeholder="+ タグ追加"
        list={`tag-suggest-${tags.join('-')}`}
        style={{ width: 120, fontSize: 11, padding: '1px 4px' }}
      />
      {suggestions.length > 0 && (
        <datalist id={`tag-suggest-${tags.join('-')}`}>
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// ハイライト描画
// ----------------------------------------------------------------------------

interface Segment {
  text: string;
  refs: Array<{ ref: SourceRef; target: LinkTarget; label: string; color: string }>;
}

function buildHighlightSegments(
  text: string,
  refs: Array<{ ref: SourceRef; target: LinkTarget; label: string; color: string }>,
): Segment[] {
  if (refs.length === 0) return [{ text, refs: [] }];

  // 各文字位置に重なる ref のセットを構築（O(n*m)、n=文字数、m=ref数）
  // m は実用範囲で大きくない想定
  const breakpoints = new Set<number>([0, text.length]);
  for (const r of refs) {
    const s = r.ref.charStart ?? 0;
    const e = r.ref.charEnd ?? text.length;
    breakpoints.add(Math.max(0, Math.min(text.length, s)));
    breakpoints.add(Math.max(0, Math.min(text.length, e)));
  }
  const sorted = Array.from(breakpoints).sort((a, b) => a - b);
  const segs: Segment[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (start === end) continue;
    const slice = text.slice(start, end);
    const coveringRefs = refs.filter((r) => {
      const s = r.ref.charStart ?? 0;
      const e = r.ref.charEnd ?? text.length;
      return start >= s && end <= e;
    });
    segs.push({ text: slice, refs: coveringRefs });
  }
  return segs;
}

function HighlightSpan({ seg }: { seg: Segment }) {
  if (seg.refs.length === 0) return <span>{seg.text}</span>;
  // 1 重: 単純背景塗り。複数重: 下線で重なりを表現
  const primary = seg.refs[0];
  const bg = withAlpha(primary.color, seg.refs.length > 1 ? 0.4 : 0.25);
  const underline = seg.refs.length > 1
    ? `underline 2px ${seg.refs[1].color}`
    : 'none';
  const tags = seg.refs.map((r) => r.target.id).join(',');
  return (
    <span
      title={`リンク: ${seg.refs.map((r) => `${r.target.type}/${r.target.id} (${r.label})`).join(' / ')}`}
      style={{
        background: bg,
        textDecoration: underline,
        textDecorationSkipInk: 'none',
        cursor: 'help',
        position: 'relative',
      }}
    >
      {seg.text}
      <sup style={{ fontSize: 9, marginLeft: 2, color: '#333', background: 'rgba(255,255,255,0.7)', padding: '0 2px', borderRadius: 2 }}>
        {tags}
      </sup>
    </span>
  );
}

// テキストノードベースの選択範囲をコンテナ内文字 index に変換
function getOffsetInContainer(
  container: HTMLElement,
  node: Node,
  offset: number,
): number | null {
  let result = 0;
  let found = false;
  const walk = (n: Node) => {
    if (found) return;
    if (n === node) {
      if (n.nodeType === Node.TEXT_NODE) {
        result += offset;
      } else {
        // 要素ノードへの caret 位置（offset = 子インデックス）
        for (let i = 0; i < offset; i++) {
          result += textLength(n.childNodes[i]);
        }
      }
      found = true;
      return;
    }
    if (n.nodeType === Node.TEXT_NODE) {
      result += (n.nodeValue ?? '').length;
      return;
    }
    for (let i = 0; i < n.childNodes.length; i++) {
      walk(n.childNodes[i]);
      if (found) return;
    }
  };
  walk(container);
  return found ? result : null;
}

function textLength(n: Node): number {
  if (n.nodeType === Node.TEXT_NODE) return (n.nodeValue ?? '').length;
  let len = 0;
  for (let i = 0; i < n.childNodes.length; i++) {
    len += textLength(n.childNodes[i]);
  }
  return len;
}

// ----------------------------------------------------------------------------
// リンク一覧 (右ペイン)
// ----------------------------------------------------------------------------

function RefListForParagraph({
  paragraphId,
  allSourceRefs,
  onRemove,
  onReconnect,
}: {
  paragraphId: string;
  allSourceRefs: Array<{ ref: SourceRef; target: LinkTarget; label: string; color: string }>;
  onRemove: (ref: SourceRef, target: LinkTarget) => void;
  onReconnect?: (ref: SourceRef, target: LinkTarget) => void;
}) {
  const refs = allSourceRefs.filter((x) => x.ref.paragraphId === paragraphId);
  if (refs.length === 0) return <p style={{ fontSize: 12, color: '#666' }}>この段落への引用はまだありません。</p>;
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none', fontSize: 12 }}>
      {refs.map((r) => (
        <li key={r.ref.id} style={{ marginBottom: 6, padding: 6, border: '1px solid #eee', borderRadius: 3, borderLeft: `3px solid ${r.color}` }}>
          <div style={{ fontWeight: 600 }}>{r.target.type.toUpperCase()} / {r.target.id}</div>
          <div style={{ color: '#666' }}>{r.label}</div>
          {r.ref.charStart !== undefined && (
            <div style={{ color: '#888', fontSize: 11 }}>範囲 {r.ref.charStart}〜{r.ref.charEnd}</div>
          )}
          {r.ref.unresolved && (
            <div style={{ color: '#c0392b', fontSize: 11 }}>⚠ 追従不能</div>
          )}
          <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {r.ref.unresolved && onReconnect && (
              <button style={{ fontSize: 10, color: '#1e6091' }} onClick={() => onReconnect(r.ref, r.target)}>
                再接続
              </button>
            )}
            <button style={{ fontSize: 10, color: '#c0392b' }} onClick={() => onRemove(r.ref, r.target)}>リンク解除</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ----------------------------------------------------------------------------
// リンク作成ダイアログ
// ----------------------------------------------------------------------------

function LinkCreationDialog({
  paragraph,
  range,
  onClose,
  onCreateNewBox,
  onLinkExisting,
}: {
  paragraph: Paragraph;
  range: { start: number; end: number } | null;
  transcript: Transcript;
  onClose: () => void;
  onCreateNewBox: (boxType: BoxType, label: string) => void;
  onLinkExisting: (target: LinkTarget) => void;
}) {
  const sheet = useActiveSheet();
  const [tab, setTab] = useState<'new' | 'existing'>('new');
  const [boxType, setBoxType] = useState<BoxType>('normal');
  const [boxLabel, setBoxLabel] = useState('');
  const [targetKind, setTargetKind] = useState<'box' | 'line' | 'sdsg'>('box');
  const [targetId, setTargetId] = useState<string>('');

  const quoteText = range ? paragraph.text.slice(range.start, range.end) : paragraph.text;

  const options = useMemo(() => {
    if (!sheet) return [];
    if (targetKind === 'box') return sheet.boxes.map((b) => ({ id: b.id, label: b.label }));
    if (targetKind === 'line') return sheet.lines.map((l) => ({ id: l.id, label: l.label || `${l.from}→${l.to}` }));
    return sheet.sdsg.map((s) => ({ id: s.id, label: s.label }));
  }, [sheet, targetKind]);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 480 }}>
        <div className="modal-header">
          <h3>原文を要素にリンク</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12, marginBottom: 12, maxHeight: 100, overflow: 'auto' }}>
            <div style={{ color: '#666', marginBottom: 2 }}>引用テキスト:</div>
            「{quoteText.slice(0, 200)}{quoteText.length > 200 ? '...' : ''}」
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            <button
              onClick={() => setTab('new')}
              style={{ flex: 1, padding: 6, background: tab === 'new' ? '#4a90e2' : '#f5f5f5', color: tab === 'new' ? 'white' : '#333', border: 'none', borderRadius: 4 }}
            >
              新規 Box を作成
            </button>
            <button
              onClick={() => setTab('existing')}
              style={{ flex: 1, padding: 6, background: tab === 'existing' ? '#4a90e2' : '#f5f5f5', color: tab === 'existing' ? 'white' : '#333', border: 'none', borderRadius: 4 }}
            >
              既存要素にリンク
            </button>
          </div>

          {tab === 'new' && (
            <div>
              <div className="setting-row">
                <label>Box 種別</label>
                <select value={boxType} onChange={(e) => setBoxType(e.target.value as BoxType)}>
                  {(['normal', 'OPP', 'BFP', 'EFP', 'P-EFP', '2nd-EFP', 'P-2nd-EFP', 'annotation'] as BoxType[]).map((t) => (
                    <option key={t} value={t}>{BOX_TYPE_LABELS[t]?.ja ?? t}</option>
                  ))}
                </select>
              </div>
              <div className="setting-row" style={{ alignItems: 'flex-start' }}>
                <label>Box ラベル</label>
                <textarea
                  value={boxLabel}
                  onChange={(e) => setBoxLabel(e.target.value)}
                  placeholder="例: 卒業研究着手（空でも可、後で編集できます）"
                  style={{ width: 320, minHeight: 40, resize: 'vertical', fontFamily: 'inherit' }}
                  autoFocus
                />
              </div>
              <p className="hint">
                description には上記引用テキストを自動貼付します。<br />
                ラベルが空でも作成可能で、PropertyPanel から後で編集できます。
              </p>
            </div>
          )}

          {tab === 'existing' && (
            <div>
              <div className="setting-row">
                <label>種別</label>
                <select value={targetKind} onChange={(e) => { setTargetKind(e.target.value as 'box' | 'line' | 'sdsg'); setTargetId(''); }}>
                  <option value="box">Box</option>
                  <option value="line">Line</option>
                  <option value="sdsg">SDSG</option>
                </select>
              </div>
              <div className="setting-row">
                <label>対象</label>
                <select value={targetId} onChange={(e) => setTargetId(e.target.value)} style={{ minWidth: 240 }}>
                  <option value="">— 選択 —</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>{o.id} ({o.label || '無名'})</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="ribbon-btn-small" onClick={onClose}>キャンセル</button>
          {tab === 'new' ? (
            <button
              className="ribbon-btn-primary"
              onClick={() => onCreateNewBox(boxType, boxLabel.trim())}
            >
              リンクした Box を作成
            </button>
          ) : (
            <button
              className="ribbon-btn-primary"
              disabled={!targetId}
              onClick={() => onLinkExisting({ type: targetKind, id: targetId })}
            >
              リンク追加
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 一括リンクダイアログ (検索ヒット用)
// ----------------------------------------------------------------------------

type BulkLinkMode =
  | { kind: 'new-box'; boxType: BoxType; label: string }
  | { kind: 'existing'; target: LinkTarget };

function BulkLinkDialog({
  transcripts,
  candidates: candidatePairs,
  onClose,
  onConfirm,
}: {
  transcripts: Transcript[];
  candidates: Array<{ transcriptId: string; paragraphId: string }>;
  onClose: () => void;
  onConfirm: (
    selectedPairs: Array<{ transcriptId: string; paragraphId: string }>,
    mode: BulkLinkMode,
  ) => void;
}) {
  const sheet = useActiveSheet();
  // 候補段落 (Transcript+Paragraph 解決済み、Transcript 順 → 段落 index 順)
  const candidates = useMemo(() => {
    const trIndex = new Map(transcripts.map((t, i) => [t.id, i]));
    return candidatePairs
      .map((pair) => {
        const t = transcripts.find((x) => x.id === pair.transcriptId);
        const p = t?.paragraphs.find((x) => x.id === pair.paragraphId);
        if (!t || !p) return null;
        return { transcript: t, paragraph: p, key: `${t.id}:${p.id}` };
      })
      .filter((x): x is { transcript: Transcript; paragraph: Paragraph; key: string } => !!x)
      .sort((a, b) => {
        const ta = trIndex.get(a.transcript.id) ?? 0;
        const tb = trIndex.get(b.transcript.id) ?? 0;
        if (ta !== tb) return ta - tb;
        return a.paragraph.index - b.paragraph.index;
      });
  }, [transcripts, candidatePairs]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(candidates.map((c) => c.key)));
  const [tab, setTab] = useState<'new' | 'existing'>('new');
  const [boxType, setBoxType] = useState<BoxType>('normal');
  const [boxLabel, setBoxLabel] = useState('');
  const [targetKind, setTargetKind] = useState<'box' | 'line' | 'sdsg'>('box');
  const [targetId, setTargetId] = useState<string>('');

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const allSelected = candidates.length > 0 && candidates.every((c) => selected.has(c.key));
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(candidates.map((c) => c.key)));
  };
  // 横断表示判定 (複数 Transcript にまたがるか)
  const isCross = new Set(candidates.map((c) => c.transcript.id)).size > 1;

  const options = useMemo(() => {
    if (!sheet) return [];
    if (targetKind === 'box') return sheet.boxes.map((b) => ({ id: b.id, label: b.label }));
    if (targetKind === 'line') return sheet.lines.map((l) => ({ id: l.id, label: l.label || `${l.from}→${l.to}` }));
    return sheet.sdsg.map((s) => ({ id: s.id, label: s.label }));
  }, [sheet, targetKind]);

  const canConfirm =
    selected.size > 0 &&
    (tab === 'new' || (tab === 'existing' && !!targetId));

  const onConfirmClick = () => {
    const pairs = candidates
      .filter((c) => selected.has(c.key))
      .map((c) => ({ transcriptId: c.transcript.id, paragraphId: c.paragraph.id }));
    if (tab === 'new') {
      onConfirm(pairs, { kind: 'new-box', boxType, label: boxLabel.trim() });
    } else {
      onConfirm(pairs, { kind: 'existing', target: { type: targetKind, id: targetId } });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 720, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3>
            {isCross ? '横断検索ヒットを一括リンク' : '検索ヒットを一括リンク'} ({candidates.length} 件
            {isCross && ` / ${new Set(candidates.map((c) => c.transcript.id)).size} 原文`})
          </h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            <button
              onClick={() => setTab('new')}
              style={{ flex: 1, padding: 6, background: tab === 'new' ? '#4a90e2' : '#f5f5f5', color: tab === 'new' ? 'white' : '#333', border: 'none', borderRadius: 4 }}
            >新規 Box を作成</button>
            <button
              onClick={() => setTab('existing')}
              style={{ flex: 1, padding: 6, background: tab === 'existing' ? '#4a90e2' : '#f5f5f5', color: tab === 'existing' ? 'white' : '#333', border: 'none', borderRadius: 4 }}
            >既存要素にリンク</button>
          </div>

          {tab === 'new' && (
            <>
              <div className="setting-row">
                <label>Box 種別</label>
                <select value={boxType} onChange={(e) => setBoxType(e.target.value as BoxType)}>
                  {(['normal', 'OPP', 'BFP', 'EFP', 'P-EFP', '2nd-EFP', 'P-2nd-EFP', 'annotation'] as BoxType[]).map((t) => (
                    <option key={t} value={t}>{BOX_TYPE_LABELS[t]?.ja ?? t}</option>
                  ))}
                </select>
              </div>
              <div className="setting-row" style={{ alignItems: 'flex-start' }}>
                <label>Box ラベル</label>
                <input
                  type="text"
                  value={boxLabel}
                  onChange={(e) => setBoxLabel(e.target.value)}
                  placeholder="例: 指導教員との出会い"
                  style={{ flex: 1, padding: '4px 8px' }}
                />
              </div>
              <p className="hint">
                description には選択した全段落の本文を連結して貼付します（§番号付き）。
              </p>
            </>
          )}

          {tab === 'existing' && (
            <>
              <div className="setting-row">
                <label>種別</label>
                <select value={targetKind} onChange={(e) => { setTargetKind(e.target.value as 'box' | 'line' | 'sdsg'); setTargetId(''); }}>
                  <option value="box">Box</option>
                  <option value="line">Line</option>
                  <option value="sdsg">SDSG</option>
                </select>
              </div>
              <div className="setting-row">
                <label>対象</label>
                <select value={targetId} onChange={(e) => setTargetId(e.target.value)} style={{ minWidth: 240 }}>
                  <option value="">— 選択 —</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>{o.id} ({o.label || '無名'})</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div style={{ borderTop: '1px solid #eee', marginTop: 12, paddingTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} /> 全選択
              </label>
              <span style={{ fontSize: 12, color: '#666' }}>
                {selected.size} / {candidates.length} 段落を選択中
              </span>
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: 12, maxHeight: 280, overflow: 'auto' }}>
              {candidates.map((c) => (
                <li key={c.key} style={{ padding: 4, borderBottom: '1px solid #f0f0f0' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={selected.has(c.key)}
                      onChange={() => toggle(c.key)}
                      style={{ marginTop: 2 }}
                    />
                    <span>
                      {isCross && (
                        <span style={{ color: '#1e6091', fontWeight: 600 }}>
                          [{c.transcript.title}]{' '}
                        </span>
                      )}
                      <strong>§{c.paragraph.index + 1}</strong>
                      {c.paragraph.speaker && <span style={{ color: '#2c3e50' }}> [{c.paragraph.speaker}]</span>}
                      : {c.paragraph.text.slice(0, 140)}{c.paragraph.text.length > 140 ? '...' : ''}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="ribbon-btn-small" onClick={onClose}>キャンセル</button>
          <button
            className="ribbon-btn-primary"
            disabled={!canConfirm}
            onClick={onConfirmClick}
          >
            {tab === 'new' ? `Box 作成 + ${selected.size} 段落をリンク` : `${selected.size} 段落をリンク追加`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 横断検索結果ビュー (中央ペインに表示)
// ----------------------------------------------------------------------------

interface CrossHit {
  transcriptId: string;
  paragraphId: string;
  transcriptTitle: string;
  participantId?: string;
  sessionNumber?: number;
  paragraphIndex: number;
  speaker?: string;
  text: string;
}

function CrossSearchResults({
  hits,
  keyword,
  participants,
  onJump,
}: {
  hits: CrossHit[];
  keyword: string;
  participants: Participant[];
  onJump: (transcriptId: string, paragraphId: string) => void;
}) {
  if (hits.length === 0) {
    return (
      <div style={{ color: '#666', padding: 20, textAlign: 'center' }}>
        「{keyword}」にマッチする段落が見つかりませんでした。
      </div>
    );
  }

  // 協力者 → Transcript (回) → ヒット[] の階層
  // unassigned は最後にまとめる
  type SessionGroup = { transcriptId: string; title: string; sessionNumber?: number; hits: CrossHit[] };
  type ParticipantGroup = { participantId: string | null; label: string; sessions: SessionGroup[] };
  const participantOrder = new Map(participants.map((p, i) => [p.id, i]));
  const participantLabel = (id?: string) => {
    if (!id) return '(未割当)';
    const p = participants.find((x) => x.id === id);
    return p?.pseudonym ?? id;
  };

  const byParticipant = new Map<string | null, ParticipantGroup>();
  for (const h of hits) {
    const pid = h.participantId ?? null;
    if (!byParticipant.has(pid)) {
      byParticipant.set(pid, {
        participantId: pid,
        label: participantLabel(h.participantId),
        sessions: [],
      });
    }
    const pg = byParticipant.get(pid)!;
    let sg = pg.sessions.find((s) => s.transcriptId === h.transcriptId);
    if (!sg) {
      sg = { transcriptId: h.transcriptId, title: h.transcriptTitle, sessionNumber: h.sessionNumber, hits: [] };
      pg.sessions.push(sg);
    }
    sg.hits.push(h);
  }
  // 並び替え: participants の順 → 未割当は最後
  const groups = Array.from(byParticipant.values()).sort((a, b) => {
    if (a.participantId === null) return 1;
    if (b.participantId === null) return -1;
    const oa = participantOrder.get(a.participantId) ?? 99999;
    const ob = participantOrder.get(b.participantId) ?? 99999;
    return oa - ob;
  });
  for (const g of groups) {
    g.sessions.sort((a, b) => {
      const sa = a.sessionNumber ?? Number.POSITIVE_INFINITY;
      const sb = b.sessionNumber ?? Number.POSITIVE_INFINITY;
      if (sa !== sb) return sa - sb;
      return a.title.localeCompare(b.title);
    });
  }

  const lower = keyword.toLowerCase();
  const totalTranscripts = groups.reduce((acc, g) => acc + g.sessions.length, 0);

  return (
    <div>
      <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px' }}>
        {groups.length} 協力者 / {totalTranscripts} 原文に渡って {hits.length} 件のヒット。各行クリックで該当段落へジャンプします。
      </p>
      {groups.map((g) => (
        <div key={g.participantId ?? '__unassigned__'} style={{ marginBottom: 18 }}>
          <h4
            style={{
              margin: '8px 0 4px',
              fontSize: 14,
              color: g.participantId === null ? '#888' : '#1e6091',
              borderBottom: '2px solid #cfe2f3',
              paddingBottom: 2,
            }}
          >
            {g.label} ({g.sessions.reduce((acc, s) => acc + s.hits.length, 0)} 件 / {g.sessions.length} 回)
          </h4>
          {g.sessions.map((s) => (
            <div key={s.transcriptId} style={{ marginBottom: 10, marginLeft: 8 }}>
              <h5 style={{ margin: '4px 0 2px', fontSize: 12, color: '#444' }}>
                {s.sessionNumber ? `第${s.sessionNumber}回 — ` : ''}{s.title} ({s.hits.length} 件)
              </h5>
              <ul style={{ listStyle: 'none', paddingLeft: 8, margin: 0 }}>
                {s.hits.map((h) => (
                  <li
                    key={h.paragraphId}
                    onClick={() => onJump(h.transcriptId, h.paragraphId)}
                    style={{
                      padding: '5px 8px',
                      borderBottom: '1px solid #f5f5f5',
                      cursor: 'pointer',
                      fontSize: 12,
                      lineHeight: 1.4,
                    }}
                    title="クリックで該当段落へジャンプ"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f0f7ff'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div style={{ color: '#666', fontSize: 11, marginBottom: 2 }}>
                      §{h.paragraphIndex + 1}
                      {h.speaker && <span style={{ color: '#2c3e50', marginLeft: 6 }}>[{h.speaker}]</span>}
                    </div>
                    <div>
                      {highlightKeyword(h.text, lower)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// キーワードを含む段落本文をヒット箇所だけハイライトして JSX で返す
function highlightKeyword(text: string, lowerKeyword: string): JSX.Element[] {
  if (!lowerKeyword) return [<span key="0">{text}</span>];
  const parts: JSX.Element[] = [];
  const lowerText = text.toLowerCase();
  let i = 0;
  let key = 0;
  // 大量の本文を出さない: 最初のヒット周辺だけ ±60 文字でクリップ
  const firstIdx = lowerText.indexOf(lowerKeyword);
  if (firstIdx < 0) return [<span key="0">{text.slice(0, 200)}</span>];
  const start = Math.max(0, firstIdx - 60);
  const end = Math.min(text.length, firstIdx + lowerKeyword.length + 120);
  const clipped = text.slice(start, end);
  const clippedLower = clipped.toLowerCase();
  i = 0;
  while (true) {
    const j = clippedLower.indexOf(lowerKeyword, i);
    if (j < 0) {
      if (i < clipped.length) parts.push(<span key={key++}>{clipped.slice(i)}</span>);
      break;
    }
    if (j > i) parts.push(<span key={key++}>{clipped.slice(i, j)}</span>);
    parts.push(
      <mark key={key++} style={{ background: '#fff3cd', padding: '0 2px' }}>
        {clipped.slice(j, j + lowerKeyword.length)}
      </mark>
    );
    i = j + lowerKeyword.length;
  }
  if (start > 0) parts.unshift(<span key="prefix">…</span>);
  if (end < text.length) parts.push(<span key="suffix">…</span>);
  return parts;
}

// ----------------------------------------------------------------------------
// リンク再接続ダイアログ (unresolved SourceRef)
// ----------------------------------------------------------------------------

function ReconnectDialog({
  sourceRef: srcRef,
  target,
  onClose,
}: {
  sourceRef: SourceRef;
  target: LinkTarget;
  onClose: () => void;
}) {
  const transcripts = useTEMStore((s) => s.doc.transcripts);
  const updateSourceRef = useTEMStore((s) => s.updateSourceRef);
  const removeSourceRef = useTEMStore((s) => s.removeSourceRef);

  const transcript = transcripts.find((t) => t.id === srcRef.transcriptId);
  const paragraph = transcript?.paragraphs.find((p) => p.id === srcRef.paragraphId);

  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);

  const onMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setSelectedRange(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const container = document.getElementById('reconnect-paragraph-body');
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setSelectedRange(null);
      return;
    }
    const start = getOffsetInContainer(container, range.startContainer, range.startOffset);
    const end = getOffsetInContainer(container, range.endContainer, range.endOffset);
    if (start === null || end === null || start === end) {
      setSelectedRange(null);
      return;
    }
    const [s, e] = start < end ? [start, end] : [end, start];
    setSelectedRange({ start: s, end: e });
  };

  const onApplyRange = () => {
    if (!selectedRange || !paragraph) return;
    const newQuote = paragraph.text.slice(selectedRange.start, selectedRange.end);
    updateSourceRef(target, srcRef.id, {
      charStart: selectedRange.start,
      charEnd: selectedRange.end,
      quoteText: newQuote,
      unresolved: false,
    });
    onClose();
  };

  const onApplyWholeParagraph = () => {
    if (!paragraph) return;
    updateSourceRef(target, srcRef.id, {
      charStart: undefined,
      charEnd: undefined,
      quoteText: '',
      unresolved: false,
    });
    onClose();
  };

  const onDeleteRef = () => {
    if (confirm('このリンクを完全に削除しますか？')) {
      removeSourceRef(target, srcRef.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 720, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3>リンク再接続 ({target.type.toUpperCase()} / {target.id})</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ flex: 1, overflow: 'auto' }}>
          {!transcript || !paragraph ? (
            <p style={{ color: '#c0392b' }}>
              元の原文または段落が見つかりません（削除された可能性があります）。<br />
              リンクを削除して整理することをお勧めします。
            </p>
          ) : (
            <>
              <section style={{ marginBottom: 16 }}>
                <h4 style={{ marginTop: 0 }}>元の引用テキスト (スナップショット)</h4>
                <div style={{ background: '#fff3cd', padding: 8, borderRadius: 4, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                  {srcRef.quoteText
                    ? `「${srcRef.quoteText}」`
                    : '（段落全体参照）'}
                </div>
              </section>
              <section style={{ marginBottom: 16 }}>
                <h4>現在の段落本文 (§{paragraph.index + 1})</h4>
                <p className="hint" style={{ marginTop: 0 }}>
                  下記から該当箇所をマウスドラッグで範囲選択するか、段落全体を参照に切り替えてください。
                </p>
                <div
                  id="reconnect-paragraph-body"
                  onMouseUp={onMouseUp}
                  style={{
                    background: '#fafafa',
                    border: '1px solid #ddd',
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 13,
                    whiteSpace: 'pre-wrap',
                    userSelect: 'text',
                    lineHeight: 1.6,
                    maxHeight: 280,
                    overflow: 'auto',
                  }}
                >
                  {paragraph.text}
                </div>
                {selectedRange && (
                  <div style={{ marginTop: 8, padding: 6, background: '#e8f5e9', borderRadius: 3, fontSize: 12 }}>
                    選択範囲: {selectedRange.start}〜{selectedRange.end} 文字「{paragraph.text.slice(selectedRange.start, selectedRange.end).slice(0, 80)}」
                  </div>
                )}
              </section>
            </>
          )}
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <button className="ribbon-btn-small" onClick={onClose}>キャンセル</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ribbon-btn-small" style={{ color: '#c0392b' }} onClick={onDeleteRef}>
              リンクを削除
            </button>
            {paragraph && (
              <button className="ribbon-btn-small" onClick={onApplyWholeParagraph}>
                段落全体を参照に切替
              </button>
            )}
            <button
              className="ribbon-btn-primary"
              disabled={!selectedRange}
              onClick={onApplyRange}
            >
              選択範囲で再接続
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
