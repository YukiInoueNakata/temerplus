// ============================================================================
// ExportPreviewDialog - プレビュー付きの統合出力ダイアログ
// - 左カラム: 変換パラメータ / 用紙サイズ / フィット / 微調整 / プリセット / 出力設定
// - 右カラム: 変換後 doc をプレビュー（ExportPreviewCanvas）
// - 下: フォーマット別出力ボタン（PNG / SVG / PDF / PPTX）
// 元データは終始不変
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore } from '../store/store';
import {
  applyExportTransform,
  DEFAULT_EXPORT_TRANSFORM,
  type ExportTransform,
  type FitMode,
} from '../utils/exportTransform';
import { getPaperPx, getPaperSizeOptionsForLayout, type PaperSizeKey } from '../utils/paperSizes';
import { ExportPreviewCanvas } from './ExportPreviewCanvas';
import { CollapsibleSection } from './CollapsibleSection';
import type { ExportOptions } from '../utils/exportImage';
import { computePageBounds } from '../utils/pageSplit';
import { openPrintWindow } from '../utils/printWindow';
import { computeSmartPagesForDoc, pagesNeededForDoc } from '../utils/smartPages';
import {
  BUILTIN_PRESETS,
  deleteUserPreset,
  loadUserPresets,
  saveUserPreset,
  updateUserPreset,
  type ExportPreset,
  type ExportPresetOptions,
} from '../utils/exportPresets';
import {
  applyExportContent,
  choiceCautions,
  detectExportContent,
  missingChoices,
  type ExportContentChoices,
} from '../utils/exportContent';

type Format = 'png' | 'svg' | 'pdf' | 'pptx';
type OutputMethod = Format | 'print';

// 表示名は描画のときに t(labelKey) で引く
const OUTPUT_METHODS: { key: OutputMethod; labelKey: string }[] = [
  { key: 'png',   labelKey: 'method.png' },
  { key: 'svg',   labelKey: 'method.svg' },
  { key: 'pdf',   labelKey: 'method.pdf' },
  { key: 'pptx',  labelKey: 'method.pptx' },
  { key: 'print', labelKey: 'method.print' },
];

const PREVIEW_ID = 'export-preview-canvas';

export function ExportPreviewDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('exportPreviewDialog');
  const doc = useTEMStore((s) => s.doc);
  const [xf, setXf] = useState<ExportTransform>(DEFAULT_EXPORT_TRANSFORM);
  const [method, setMethod] = useState<OutputMethod>('png');
  const format: Format = method === 'print' ? 'png' : method;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 出力固有オプション
  const [background, setBackground] = useState<'white' | 'transparent'>('white');
  const [includeGrid, setIncludeGrid] = useState(false);
  const [includePaperGuides, setIncludePaperGuides] = useState(false);
  const [includeIds, setIncludeIds] = useState<{ any: boolean; box: boolean; sdsg: boolean; line: boolean }>(
    { any: false, box: false, sdsg: false, line: false },
  );
  const [pdfMargin, setPdfMargin] = useState(0.3);

  // 印刷モードタブ: 'single' = 単一印刷 / 'multi' = 複数印刷
  const [exportMode, setExportMode] = useState<'single' | 'multi'>('single');

  // プレビュー中のページ index（単一モードでは 0 固定）
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  // プリセット
  const [userPresets, setUserPresets] = useState<ExportPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  useEffect(() => {
    if (open) setUserPresets(loadUserPresets());
  }, [open]);

  const currentOptions = (): ExportPresetOptions => ({
    transform: { ...xf },
    output: {
      background,
      includeGrid,
      includePaperGuides,
      includeIds: { box: includeIds.box, sdsg: includeIds.sdsg, line: includeIds.line },
      pdfMargin,
    },
  });

  const applyPreset = (preset: ExportPreset) => {
    const { transform, output } = preset.options;
    setXf({ ...transform });
    setBackground(output.background);
    setIncludeGrid(output.includeGrid);
    setIncludePaperGuides(output.includePaperGuides);
    const anyId = output.includeIds.box || output.includeIds.sdsg || output.includeIds.line;
    setIncludeIds({ any: anyId, ...output.includeIds });
    setPdfMargin(output.pdfMargin);
    // pageCount > 1 なら multi モードに切替（switchMode を介さず直接、preset の値を尊重）
    setExportMode(transform.pageCount > 1 ? 'multi' : 'single');
    setPreviewPageIndex(0);
    setSelectedPresetId(preset.id);
  };

  const handlePresetSelect = (id: string) => {
    if (!id) {
      setSelectedPresetId('');
      return;
    }
    const builtin = BUILTIN_PRESETS.find((p) => p.id === id);
    const user = userPresets.find((p) => p.id === id);
    const preset = builtin ?? user;
    if (preset) applyPreset(preset);
  };

  const handleSavePreset = () => {
    const name = window.prompt(t('preset.prompt'));
    if (!name) return;
    try {
      const next = saveUserPreset(name, currentOptions());
      setUserPresets(next);
      setSelectedPresetId(next[next.length - 1].id);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleOverwritePreset = () => {
    const cur = userPresets.find((p) => p.id === selectedPresetId);
    if (!cur) return;
    if (!window.confirm(t('preset.confirmOverwrite', { name: cur.name }))) return;
    const next = updateUserPreset(cur.id, { options: currentOptions() });
    setUserPresets(next);
  };

  const handleDeletePreset = () => {
    const cur = userPresets.find((p) => p.id === selectedPresetId);
    if (!cur) return;
    if (!window.confirm(t('preset.confirmDelete', { name: cur.name }))) return;
    const next = deleteUserPreset(cur.id);
    setUserPresets(next);
    setSelectedPresetId('');
  };

  const isUserPresetSelected = !!userPresets.find((p) => p.id === selectedPresetId);

  // ダイアログ open 時の初期化:
  //  - 印刷モードは常に 'single' からスタート
  //  - paperGuides[0].pageCount は複数モード切替時の初期値として使う
  //  - layout に応じた既定用紙サイズ（縦型 = A4 縦 / 横型 = A4 横）を設定
  const paperGuidePageCount = doc.settings.paperGuides?.[0]?.pageCount ?? 1;
  const layoutDefaultPaperSize: PaperSizeKey = doc.settings.layout === 'vertical' ? 'A4-portrait' : 'A4-landscape';
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!open) { initializedRef.current = false; return; }
    if (initializedRef.current) return;
    initializedRef.current = true;
    setExportMode('single');
    setXf((cur) => ({
      ...cur,
      pageCount: 1,
      paperSize: layoutDefaultPaperSize,
      fitMode: 'fit-both',
      globalScale: 1,
      offsetX: 0,
      offsetY: 0,
    }));
    setPreviewPageIndex(0);
  }, [open, layoutDefaultPaperSize]);

  // 単一⇔複数 タブ切替時に pageCount と fitMode を同期
  const switchMode = (mode: 'single' | 'multi') => {
    setExportMode(mode);
    if (mode === 'single') {
      setXf((cur) => ({
        ...cur,
        pageCount: 1,
        fitMode: 'fit-both',
        globalScale: 1,
        offsetX: 0,
        offsetY: 0,
      }));
      setPreviewPageIndex(0);
    } else {
      // 複数モード初期値: paperGuides.pageCount、なければ 2。fitMode は短辺フィット
      const n = Math.max(2, paperGuidePageCount > 1 ? paperGuidePageCount : 2);
      setXf((cur) => ({
        ...cur,
        pageCount: n,
        fitMode: 'fit-short',
        globalScale: 1,
        offsetX: 0,
        offsetY: 0,
      }));
      setPreviewPageIndex(0);
    }
  };

  // ダイアログ位置
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, dlgX: 0, dlgY: 0 });

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

  // 出力に含める要素（メモ・記号・コメント・凡例・時期ラベル）。開くたびにすべて未選択から始める
  const [contentChoices, setContentChoices] = useState<ExportContentChoices>({});
  useEffect(() => {
    if (open) setContentChoices({});
  }, [open]);
  const contentReport = useMemo(
    () => detectExportContent(doc.sheets.find((s) => s.id === doc.activeSheetId)),
    [doc],
  );
  const contentMissing = missingChoices(contentReport, contentChoices);

  // 変換後 doc（プレビュー / エクスポート両方で使用）。含める要素の選択を先に当ててから、
  // 用紙に収める・中央に寄せる計算をする（逆の順だと、含めると選んだ凡例を見ずに収めてしまい、
  // 凡例が用紙の外に出ることがあった。除いたメモの分の余白も残った。レビュー #4）
  const transformed = useMemo(
    () => applyExportTransform(applyExportContent(doc, contentChoices), xf),
    [doc, xf, contentChoices],
  );

  // ページ境界を計算（プレビュー / 実出力で共用）
  // 複数ページは、図の始まりを 1 ページ目に合わせ、境目を Box どうしの間の空いた所に置く（2026-11-07「案 B」）。
  // SPEC 方式（duplicate）は従来の等間隔の分割のまま
  const pageBounds = useMemo(() => {
    const paper = getPaperPx(xf.paperSize);
    if (xf.pageCount > 1 && xf.pageSplitMode !== 'duplicate') {
      return computeSmartPagesForDoc(transformed.doc, {
        paperSize: xf.paperSize,
        pageCount: xf.pageCount,
        paperMarginRatio: xf.paperMarginRatio,
      });
    }
    return computePageBounds({
      paperWidth: paper.width,
      paperHeight: paper.height,
      layout: transformed.doc.settings.layout,
      pageCount: Math.max(1, xf.pageCount),
      overlapPx: xf.pageOverlapPx,
    });
  }, [xf.paperSize, xf.pageCount, xf.pageOverlapPx, xf.pageSplitMode, xf.paperMarginRatio, transformed.doc]);

  // 図を用紙の短辺に合わせたときに何ページ分あるか（ページ数を選ぶ目安）
  const pagesNeeded = useMemo(() => {
    if (exportMode !== 'multi') return null;
    const tr = applyExportTransform(applyExportContent(doc, contentChoices), { ...xf, fitMode: 'fit-short', pageCount: 1 });
    return pagesNeededForDoc(tr.doc, { paperSize: xf.paperSize, pageCount: 1, paperMarginRatio: xf.paperMarginRatio });
  }, [exportMode, doc, contentChoices, xf]);

  // layout に応じた用紙サイズ選択肢
  // 【重要】フックは早期 return より前に置くこと。open が false→true で
  // フック数が変わると React error #310 (Rendered more hooks than during
  // the previous render) になる。
  const paperOptions = useMemo(
    () => getPaperSizeOptionsForLayout(doc.settings.layout),
    [doc.settings.layout],
  );

  if (!open) return null;

  const update = (patch: Partial<ExportTransform>) => setXf((x) => ({ ...x, ...patch }));
  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-close')) return;
    const cur = pos ?? { x: window.innerWidth / 2 - 500, y: window.innerHeight / 2 - 320 };
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, dlgX: cur.x, dlgY: cur.y };
    setPos(cur);
    setDragging(true);
  };

  const modalStyle: React.CSSProperties = pos
    ? { width: 1000, maxWidth: '95vw', position: 'absolute', left: pos.x, top: pos.y, margin: 0 }
    : { width: 1000, maxWidth: '95vw' };

  const runExport = async () => {
    if (contentMissing.length > 0) return;
    setBusy(true);
    setNotice(null);
    const ac = new AbortController();
    abortRef.current = ac;
    setProgress({ current: 0, total: 1, label: t('progress.preparing') });
    const onProg = (p: { current: number; total: number; label: string }) => setProgress(p);
    try {
      const baseName = doc.metadata.title || 'TEMer';
      const imgOpts: ExportOptions = {
        includeGrid,
        includePaperGuides,
        includeRulers: false,
        background,
      };
      const multi = exportMode === 'multi' && xf.pageCount > 1 ? pageBounds : null;
      // 複数ページの画像（PNG・PDF）は、画面の凡例を写さず、各ページにそのページの凡例を重ねる
      const legendPerPage = !!multi && multi.some((p) => p.legendAt);
      imgOpts.excludeLegend = legendPerPage;
      const pagesWithLegend = async () => {
        if (!multi || !legendPerPage) return multi;
        const sheet = transformed.doc.sheets.find((s) => s.id === transformed.doc.activeSheetId);
        if (!sheet) return multi;
        const { attachLegendImages } = await import('../utils/exportSVGNative');
        return attachLegendImages(multi, sheet, transformed.doc.settings);
      };
      if (format === 'png') {
        if (multi) {
          const { exportToPNGPages } = await import('../utils/exportImage');
          await exportToPNGPages(PREVIEW_ID, baseName, (await pagesWithLegend())!, 'auto', imgOpts, onProg, ac.signal);
        } else {
          const { exportToPNG, captureRatio } = await import('../utils/exportImage');
          // 用紙の上で 300dpi になる倍率で写す（以前は 2 倍に固定で、解像度がプレビューの枠で決まっていた）
          const node = document.getElementById(PREVIEW_ID);
          const ratio = node ? captureRatio(node, getPaperPx(xf.paperSize).width) : 2;
          await exportToPNG(PREVIEW_ID, `${baseName}.png`, ratio, imgOpts);
        }
      } else if (format === 'svg') {
        const { exportToSVGNative } = await import('../utils/exportSVGNative');
        const sheet = transformed.doc.sheets.find((s) => s.id === transformed.doc.activeSheetId);
        if (!sheet) throw new Error(t('error.noSheet'));
        await exportToSVGNative({
          filename: `${baseName}.svg`,
          sheet,
          settings: transformed.doc.settings,
          paperSize: xf.paperSize,
          scale: false,
          offset: 0,
          pages: multi ?? undefined,
          background,
          includeIds: { box: includeIds.box, sdsg: includeIds.sdsg, line: includeIds.line },
          onProgress: onProg,
          signal: ac.signal,
        });
      } else if (format === 'pdf') {
        const { exportToPDF } = await import('../utils/exportPDF');
        await exportToPDF(PREVIEW_ID, `${baseName}.pdf`, {
          paperSize: xf.paperSize,
          margin: pdfMargin,
          background,
          includeGrid,
          includePaperGuides,
          includeRulers: false,
          excludeLegend: legendPerPage,
          pages: (await pagesWithLegend()) ?? undefined,
          onProgress: onProg,
          signal: ac.signal,
        });
      } else if (format === 'pptx') {
        const { exportToPPTX } = await import('../utils/exportPPT');
        const sheet = transformed.doc.sheets.find((s) => s.id === transformed.doc.activeSheetId);
        if (!sheet) throw new Error(t('error.noSheet'));
        await exportToPPTX({
          filename: `${baseName}.pptx`,
          sheet,
          settings: transformed.doc.settings,
          scale: false,
          offset: 0,
          paperSize: xf.paperSize,
          pages: multi ?? undefined,
          pageSplitMode: xf.pageSplitMode,
          showContinuationMarkers: xf.showContinuationMarkers,
          includeIds: { box: includeIds.box, sdsg: includeIds.sdsg, line: includeIds.line },
          onProgress: onProg,
          signal: ac.signal,
        });
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setNotice(t('notice.exportCanceled'));
      } else {
        console.error(e);
        alert(t('alert.exportFailed', { message: e instanceof Error ? e.message : String(e) }));
      }
    } finally {
      setBusy(false);
      setProgress(null);
      abortRef.current = null;
    }
  };

  const runPrint = async () => {
    if (contentMissing.length > 0) return;
    // 窓はクリックの直後に開く（await の後だと Safari がポップアップとして止める）
    const printWin = openPrintWindow();
    setBusy(true);
    setNotice(null);
    const ac = new AbortController();
    abortRef.current = ac;
    setProgress({ current: 0, total: 1, label: t('progress.preparing') });
    const onProg = (p: { current: number; total: number; label: string }) => setProgress(p);
    try {
      let multi = exportMode === 'multi' && xf.pageCount > 1 ? pageBounds : null;
      // 複数ページは画面の凡例を写さず、各ページにそのページの凡例を重ねる（PNG・PDF と同じ）
      const legendPerPage = !!multi && multi.some((p) => p.legendAt);
      const sheet = transformed.doc.sheets.find((s) => s.id === transformed.doc.activeSheetId);
      if (multi && legendPerPage && sheet) {
        const { attachLegendImages } = await import('../utils/exportSVGNative');
        multi = attachLegendImages(multi, sheet, transformed.doc.settings);
      }
      const { printDiagram } = await import('../utils/printing');
      await printDiagram(PREVIEW_ID, {
        paperSize: xf.paperSize,
        background,
        includeGrid,
        includePaperGuides,
        includeRulers: false,
        excludeLegend: legendPerPage,
        pages: multi ?? undefined,
        onProgress: onProg,
        signal: ac.signal,
        targetWindow: printWin,
      });
    } catch (e) {
      // 失敗・取り消しのときは、先に開いた準備中の窓を閉じる
      if (printWin && !printWin.closed) printWin.close();
      if (e instanceof DOMException && e.name === 'AbortError') {
        setNotice(t('notice.printCanceled'));
      } else {
        console.error(e);
        alert(t('alert.printFailed', { message: e instanceof Error ? e.message : String(e) }));
      }
    } finally {
      setBusy(false);
      setProgress(null);
      abortRef.current = null;
    }
  };

  const cancelExport = () => {
    abortRef.current?.abort();
  };

  const pct = progress && progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ ...modalStyle, position: modalStyle.position ?? 'relative' } as React.CSSProperties}
      >
        <div
          className="modal-header"
          onMouseDown={onHeaderMouseDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          title={t('drag')}
        >
          <h3>{t('title')}</h3>
          <button onClick={onClose} className="modal-close" disabled={busy}>×</button>
        </div>
        {busy && progress && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.85)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                minWidth: 320,
                maxWidth: 480,
                padding: '18px 22px',
                background: '#fff',
                border: '1px solid #c8d1e0',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.95em' }}>{t('progress.exporting')}</div>
              <div style={{ fontSize: '0.85em', color: '#333' }}>{progress.label}</div>
              <div style={{ fontSize: '0.8em', color: '#666' }}>
                {progress.current} / {progress.total} ({pct}%)
              </div>
              <div
                style={{
                  height: 10,
                  background: '#e6ebf2',
                  borderRadius: 5,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: '#3b82f6',
                    transition: 'width 0.15s linear',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="ribbon-btn-small"
                  onClick={cancelExport}
                >{t('cancel')}</button>
              </div>
            </div>
          </div>
        )}
        <div className="modal-body" style={{ padding: 0, display: 'flex', gap: 0, height: 560, overflow: 'hidden' }}>
          {/* 左: パラメータ */}
          <div style={{ width: 360, padding: '10px 14px', overflowY: 'auto', borderRight: '1px solid #e0e0e0' }}>
            {/* 出力方式プルダウン（最上部） */}
            <div
              className="setting-row"
              style={{
                margin: '0 -14px 10px',
                padding: '8px 14px 10px',
                background: '#f5f8ff',
                borderBottom: '1px solid #dde4f0',
              }}
            >
              <label style={{ fontWeight: 'bold' }}>{t('method')}</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as OutputMethod)}
                style={{ flex: 1, minWidth: 0 }}
              >
                {OUTPUT_METHODS.map((m) => (
                  <option key={m.key} value={m.key}>{t(m.labelKey)}</option>
                ))}
              </select>
            </div>

            {/* プリセット */}
            <CollapsibleSection title={t('preset.title')} sectionKey="export-preset" defaultOpen={true}>
              <div className="setting-row">
                <select
                  value={selectedPresetId}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  style={{ flex: 1, minWidth: 0 }}
                  title={t('preset.select.tooltip')}
                >
                  <option value="">{t('preset.select.placeholder')}</option>
                  <optgroup label={t('preset.builtin')}>
                    {BUILTIN_PRESETS.map((p) => (
                      <option key={p.id} value={p.id} title={p.description}>{p.name}</option>
                    ))}
                  </optgroup>
                  {userPresets.length > 0 && (
                    <optgroup label={t('preset.user')}>
                      {userPresets.map((p) => (
                        <option key={p.id} value={p.id} title={p.description}>{p.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 4, flexWrap: 'wrap' }}>
                <button className="ribbon-btn-small" onClick={handleSavePreset} title={t('preset.save.tooltip')}>
                  {t('preset.save')}
                </button>
                <button
                  className="ribbon-btn-small"
                  onClick={handleOverwritePreset}
                  disabled={!isUserPresetSelected}
                  title={isUserPresetSelected ? t('preset.overwrite.tooltip') : t('preset.selectUser')}
                >
                  {t('preset.overwrite')}
                </button>
                <button
                  className="ribbon-btn-small"
                  onClick={handleDeletePreset}
                  disabled={!isUserPresetSelected}
                  title={isUserPresetSelected ? t('preset.delete.tooltip') : t('preset.selectUser')}
                >
                  {t('preset.delete')}
                </button>
              </div>
              {selectedPresetId && (() => {
                const sel = BUILTIN_PRESETS.find((p) => p.id === selectedPresetId)
                  ?? userPresets.find((p) => p.id === selectedPresetId);
                return sel?.description ? (
                  <p className="hint" style={{ marginTop: 0, fontSize: '0.8em' }}>{sel.description}</p>
                ) : null;
              })()}
            </CollapsibleSection>

            {/* 印刷モードタブ */}
            <div className="settings-tabs" style={{ marginBottom: 10, padding: 0 }}>
              <button
                className={exportMode === 'single' ? 'settings-tab active' : 'settings-tab'}
                onClick={() => switchMode('single')}
              >{t('mode.single')}</button>
              <button
                className={exportMode === 'multi' ? 'settings-tab active' : 'settings-tab'}
                onClick={() => switchMode('multi')}
              >{t('mode.multi')}</button>
            </div>

            <CollapsibleSection title={t('paper.title')} sectionKey="export-paper-fit" defaultOpen={true}>
              <div className="setting-row">
                <label>{t('paper.size')}</label>
                <select
                  value={xf.paperSize}
                  onChange={(e) => update({ paperSize: e.target.value as PaperSizeKey })}
                  style={{ maxWidth: 200 }}
                >
                  {paperOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="setting-row">
                <label>{t('fit')}</label>
                <select
                  value={xf.fitMode}
                  onChange={(e) => update({ fitMode: e.target.value as FitMode })}
                >
                  <option value="manual">{t('fit.manual')}</option>
                  <option value="fit-both">{t('fit.both')}</option>
                  <option value="fit-width">{t('fit.width')}</option>
                  <option value="fit-height">{t('fit.height')}</option>
                  <option value="fit-short">{t('fit.short')}</option>
                </select>
              </div>
              {xf.fitMode === 'fit-short' && (
                <p className="hint" style={{ marginTop: 0 }}>
                  {doc.settings.layout === 'horizontal'
                    ? t('fit.short.hint.h')
                    : t('fit.short.hint.v')}
                </p>
              )}
              {xf.fitMode === 'manual' && (
                <div className="setting-row">
                  <label>{t('fit.globalScale')}</label>
                  <input
                    type="number"
                    step={0.05}
                    min={0.1}
                    max={10}
                    value={xf.globalScale}
                    onChange={(e) => update({ globalScale: Math.max(0.1, Number(e.target.value)) })}
                    style={{ width: 80 }}
                  />
                </div>
              )}
              <div className="setting-row">
                <label>{t('paper.margin')}</label>
                <input
                  type="number"
                  step={0.01}
                  min={0}
                  max={0.3}
                  value={xf.paperMarginRatio}
                  onChange={(e) => update({ paperMarginRatio: Math.max(0, Number(e.target.value)) })}
                  style={{ width: 80 }}
                />
              </div>
            </CollapsibleSection>

            {exportMode === 'multi' && (
              <CollapsibleSection title={t('split.title')} sectionKey="export-page-split" defaultOpen={true}>
                <p className="hint" style={{ marginTop: 0 }}>
                  {doc.settings.layout === 'horizontal'
                    ? t('split.hint.h')
                    : t('split.hint.v')}
                </p>
                <div className="setting-row">
                  <label>{t('split.count')}</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    step={1}
                    value={xf.pageCount}
                    onChange={(e) => {
                      const n = Math.max(2, Math.min(20, Math.floor(Number(e.target.value) || 2)));
                      update({ pageCount: n });
                      if (previewPageIndex >= n) setPreviewPageIndex(0);
                    }}
                    style={{ width: 80 }}
                  />
                </div>
                {pagesNeeded != null && (
                  <p className="hint" style={{ marginTop: 0 }}>
                    {doc.settings.layout === 'horizontal'
                      ? t('split.needed.h', { pages: pagesNeeded.toFixed(1) })
                      : t('split.needed.v', { pages: pagesNeeded.toFixed(1) })}
                    {Math.ceil(pagesNeeded) <= 1
                      ? t('split.needed.fitsOne')
                      : Math.ceil(pagesNeeded) < xf.pageCount ? t('split.needed.enough', { n: Math.ceil(pagesNeeded) }) : ''}
                    {pagesNeeded > xf.pageCount ? t('split.needed.shrink') : ''}
                  </p>
                )}
                <div className="setting-row">
                  <label>{t('split.method')}</label>
                  <select
                    value={xf.pageSplitMode}
                    onChange={(e) => update({ pageSplitMode: e.target.value as 'overlap' | 'duplicate' })}
                    style={{ maxWidth: 220 }}
                  >
                    <option value="overlap">{t('split.method.gap')}</option>
                    <option value="duplicate">{t('split.method.duplicate')}</option>
                  </select>
                </div>
                {xf.pageSplitMode === 'duplicate' && <div className="setting-row">
                  <label>{t('split.overlap')}</label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    step={5}
                    value={xf.pageOverlapPx}
                    onChange={(e) => update({ pageOverlapPx: Math.max(0, Number(e.target.value) || 0) })}
                    style={{ width: 80 }}
                  />
                </div>}
                {xf.pageSplitMode === 'duplicate' && (
                  <>
                    <div className="setting-row">
                      <label>{t('split.markers')}</label>
                      <input
                        type="checkbox"
                        checked={xf.showContinuationMarkers}
                        onChange={(e) => update({ showContinuationMarkers: e.target.checked })}
                      />
                    </div>
                    {format !== 'pptx' && (
                      <p className="hint" style={{ color: '#b36b00' }}>
                        {t('split.duplicate.note')}
                      </p>
                    )}
                  </>
                )}
                <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 6 }}>
                  <button
                    className="ribbon-btn-small"
                    onClick={() => setPreviewPageIndex((i) => Math.max(0, i - 1))}
                    disabled={previewPageIndex <= 0}
                  >◀</button>
                  <span style={{ fontSize: '0.85em' }}>
                    {t('split.previewPage', { page: previewPageIndex + 1, total: xf.pageCount })}
                  </span>
                  <button
                    className="ribbon-btn-small"
                    onClick={() => setPreviewPageIndex((i) => Math.min(xf.pageCount - 1, i + 1))}
                    disabled={previewPageIndex >= xf.pageCount - 1}
                  >▶</button>
                </div>
              </CollapsibleSection>
            )}

            <CollapsibleSection title={t('tune.title')} sectionKey="export-fine-tune" defaultOpen={false}>
              <div className="setting-row">
                <label>{t('tune.offsetX')}</label>
                <input
                  type="number"
                  step={10}
                  value={xf.offsetX}
                  onChange={(e) => update({ offsetX: Number(e.target.value) })}
                  style={{ width: 80 }}
                  title={t('tune.offsetX.tooltip')}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.offsetY')}</label>
                <input
                  type="number"
                  step={10}
                  value={xf.offsetY}
                  onChange={(e) => update({ offsetY: Number(e.target.value) })}
                  style={{ width: 80 }}
                  title={t('tune.offsetY.tooltip')}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.fontDelta')}</label>
                <input
                  type="number"
                  step={1}
                  value={xf.fontSizeDelta}
                  onChange={(e) => update({ fontSizeDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.fontScale')}</label>
                <input
                  type="number"
                  step={0.05}
                  min={0.1}
                  value={xf.fontSizeScale}
                  onChange={(e) => update({ fontSizeScale: Math.max(0.1, Number(e.target.value)) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.borderDelta')}</label>
                <input
                  type="number"
                  step={0.5}
                  value={xf.boxBorderWidthDelta}
                  onChange={(e) => update({ boxBorderWidthDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.lineDelta')}</label>
                <input
                  type="number"
                  step={0.5}
                  value={xf.lineStrokeWidthDelta}
                  onChange={(e) => update({ lineStrokeWidthDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.gapH')}</label>
                <input
                  type="number"
                  step={0.05}
                  min={0.1}
                  value={xf.boxGapScaleH}
                  onChange={(e) => update({ boxGapScaleH: Math.max(0.1, Number(e.target.value)), boxGapScale: undefined })}
                  style={{ width: 80 }}
                  title={t('tune.gapH.tooltip')}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.gapV')}</label>
                <input
                  type="number"
                  step={0.05}
                  min={0.1}
                  value={xf.boxGapScaleV}
                  onChange={(e) => update({ boxGapScaleV: Math.max(0.1, Number(e.target.value)), boxGapScale: undefined })}
                  style={{ width: 80 }}
                  title={t('tune.gapV.tooltip')}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.autoCenter')}</label>
                <input
                  type="checkbox"
                  checked={xf.autoCenterOnPaper !== false}
                  onChange={(e) => update({ autoCenterOnPaper: e.target.checked })}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.typeLabelDelta')}</label>
                <input
                  type="number"
                  step={1}
                  value={xf.typeLabelFontSizeDelta}
                  onChange={(e) => update({ typeLabelFontSizeDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.subLabelDelta')}</label>
                <input
                  type="number"
                  step={1}
                  value={xf.subLabelFontSizeDelta}
                  onChange={(e) => update({ subLabelFontSizeDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.timeArrowDelta')}</label>
                <input
                  type="number"
                  step={1}
                  value={xf.timeArrowFontSizeDelta}
                  onChange={(e) => update({ timeArrowFontSizeDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.legendDelta')}</label>
                <input
                  type="number"
                  step={1}
                  value={xf.legendFontSizeDelta}
                  onChange={(e) => update({ legendFontSizeDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.periodDelta')}</label>
                <input
                  type="number"
                  step={1}
                  value={xf.periodLabelFontSizeDelta}
                  onChange={(e) => update({ periodLabelFontSizeDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row">
                <label>{t('tune.periodStrokeDelta')}</label>
                <input
                  type="number"
                  step={0.5}
                  value={xf.periodLabelStrokeDelta}
                  onChange={(e) => update({ periodLabelStrokeDelta: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </div>
              <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 4 }}>
                <button
                  className="ribbon-btn-small"
                  onClick={() => setXf(DEFAULT_EXPORT_TRANSFORM)}
                >
                  {t('tune.reset')}
                </button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title={t('output.title')} sectionKey="export-output" defaultOpen={true}>
              <div className="setting-row">
                <label>{t('output.background')}</label>
                <select
                  value={background}
                  onChange={(e) => setBackground(e.target.value as 'white' | 'transparent')}
                >
                  <option value="white">{t('output.background.white')}</option>
                  <option value="transparent">{t('output.background.transparent')}</option>
                </select>
              </div>
              <div className="setting-row">
                <label>{t('output.grid')}</label>
                <input
                  type="checkbox"
                  checked={includeGrid}
                  onChange={(e) => setIncludeGrid(e.target.checked)}
                />
              </div>
              <div className="setting-row">
                <label>{t('output.paperGuides')}</label>
                <input
                  type="checkbox"
                  checked={includePaperGuides}
                  onChange={(e) => setIncludePaperGuides(e.target.checked)}
                />
              </div>
              <div className="setting-row">
                <label>{t('output.ids')}</label>
                <input
                  type="checkbox"
                  checked={includeIds.any}
                  ref={(el) => { if (el) el.indeterminate = includeIds.any && !(includeIds.box && includeIds.sdsg && includeIds.line); }}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setIncludeIds({ any: v, box: v, sdsg: v, line: v });
                  }}
                />
              </div>
              {includeIds.any && (
                <div style={{ marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: '0.85em' }}>
                    <input
                      type="checkbox"
                      checked={includeIds.box}
                      onChange={(e) => setIncludeIds((p) => ({ ...p, box: e.target.checked, any: e.target.checked || p.sdsg || p.line }))}
                    /> Box ID
                  </label>
                  <label style={{ fontSize: '0.85em' }}>
                    <input
                      type="checkbox"
                      checked={includeIds.sdsg}
                      onChange={(e) => setIncludeIds((p) => ({ ...p, sdsg: e.target.checked, any: p.box || e.target.checked || p.line }))}
                    /> SDSG ID
                  </label>
                  <label style={{ fontSize: '0.85em' }}>
                    <input
                      type="checkbox"
                      checked={includeIds.line}
                      onChange={(e) => setIncludeIds((p) => ({ ...p, line: e.target.checked, any: p.box || p.sdsg || e.target.checked }))}
                    /> Line ID
                  </label>
                </div>
              )}
              {format === 'pdf' && (
                <div className="setting-row">
                  <label>{t('output.pdfMargin')}</label>
                  <input
                    type="number"
                    min={0}
                    max={2}
                    step={0.05}
                    value={pdfMargin}
                    onChange={(e) => setPdfMargin(Math.max(0, Number(e.target.value)))}
                    style={{ width: 80 }}
                  />
                </div>
              )}
              <p className="hint">{t('output.pptxNote')}</p>
            </CollapsibleSection>
          </div>

          {/* 右: プレビュー */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '6px 10px', borderBottom: '1px solid #e0e0e0', fontSize: '0.85em', color: '#555' }}>
              {t('preview.header')}
            </div>
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <ExportPreviewCanvas
                doc={transformed.doc}
                elementId={PREVIEW_ID}
                paperSize={xf.paperSize}
                showPaperGuide={true}
                showGrid={includeGrid}
                background={background}
                pageBounds={exportMode === 'multi' ? pageBounds : undefined}
                highlightPageIndex={exportMode === 'multi' && xf.pageCount > 1 ? previewPageIndex : undefined}
                includeIds={{ box: includeIds.box, sdsg: includeIds.sdsg, line: includeIds.line }}
                onPanZoomChange={(delta) => {
                  // パン → offsetX/Y、ズーム → fitMode=manual + globalScale に反映
                  setXf((cur) => {
                    const next: ExportTransform = { ...cur };
                    if (delta.panDeltaWorldX !== 0 || delta.panDeltaWorldY !== 0) {
                      next.offsetX = cur.offsetX + delta.panDeltaWorldX;
                      next.offsetY = cur.offsetY + delta.panDeltaWorldY;
                    }
                    if (Math.abs(delta.zoomRatio - 1) > 0.001) {
                      next.fitMode = 'manual';
                      const base = cur.fitMode === 'manual' ? cur.globalScale : 1;
                      next.globalScale = Math.max(0.1, base * delta.zoomRatio);
                    }
                    return next;
                  });
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
        <ExportContentPanel
          report={contentReport}
          choices={contentChoices}
          onChange={(kind, v) => setContentChoices((c) => ({ ...c, [kind]: v }))}
          disabled={busy}
        />
        <div
          className="modal-footer"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}
        >
          <button
            className="ribbon-btn-small"
            onClick={onClose}
            disabled={busy}
          >
            {t('close')}
          </button>
          {notice && <span style={{ color: '#b36b00', fontSize: '0.82em' }}>{notice}</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="ribbon-btn-primary"
              onClick={method === 'print' ? runPrint : runExport}
              disabled={busy || contentMissing.length > 0}
              style={{ whiteSpace: 'nowrap', padding: '6px 16px' }}
              title={
                contentMissing.length > 0
                  ? t('run.chooseFirst', { items: contentMissing.join(t('list.separator')) })
                  : method === 'print'
                  ? t('run.print.tooltip')
                  : t('run.save.tooltip', { format: method.toUpperCase() })
              }
            >
              {busy
                ? t('progress.exporting')
                : method === 'print'
                  ? t('method.print')
                  : t('run.save', { format: method.toUpperCase() })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 出力に含める要素の確認（毎回すべて未選択から。選び終えるまで保存・印刷できない）
// ----------------------------------------------------------------------------

function ExportContentPanel({
  report,
  choices,
  onChange,
  disabled,
}: {
  report: ReturnType<typeof detectExportContent>;
  choices: ExportContentChoices;
  onChange: (kind: keyof ExportContentChoices, value: boolean) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation('exportPreviewDialog');
  const missing = missingChoices(report, choices);
  const cautions = [...report.cautions, ...choiceCautions(choices)];
  return (
    <div
      className="export-content-panel"
      style={{ borderTop: '1px solid #ddd', padding: '8px 14px', background: missing.length ? '#fff8e1' : '#f6f8fa', fontSize: '0.85em' }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {t('content.title')}{missing.length > 0 ? t('content.remaining', { n: missing.length }) : t('content.done')}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px' }}>
        {report.items.map((it) => (
          <div key={it.kind} style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={it.hint}>
            <span style={{ color: choices[it.kind] === undefined ? '#b36b00' : undefined }}>
              {it.label}{it.kind !== 'legend' ? t('content.count', { n: it.count }) : ''}
            </span>
            {!it.cannotDraw && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  type="radio"
                  name={`export-content-${it.kind}`}
                  checked={choices[it.kind] === true}
                  onChange={() => onChange(it.kind, true)}
                  disabled={disabled}
                />
                {t('content.include')}
              </label>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="radio"
                name={`export-content-${it.kind}`}
                checked={choices[it.kind] === false}
                onChange={() => onChange(it.kind, false)}
                disabled={disabled}
              />
              {it.cannotDraw ? t('content.excludeCannotDraw') : t('content.exclude')}
            </label>
          </div>
        ))}
      </div>
      {cautions.map((c) => (
        <div key={c} style={{ color: '#b36b00', marginTop: 4 }}>{t('content.caution', { text: c })}</div>
      ))}
    </div>
  );
}
