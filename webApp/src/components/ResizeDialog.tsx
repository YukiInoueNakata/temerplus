// ============================================================================
// ResizeDialog - メインキャンバスの実データをリサイズするダイアログ
// - 用紙サイズ基準: A4/A3/PPT 16:9/4:3 に「縦のみ / 横のみ / 両方」fit
// - パーセント指定: 任意倍率
// - 文字サイズ連動の ON/OFF
// - 適用ボタンで実データを更新（Undo 可能）
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import { computeContentBounds } from '../utils/fitBounds';
import { shortcutLabel } from '../utils/platform';
import {
  PAPER_SIZE_OPTIONS,
  getPaperPx,
  type PaperSizeKey,
} from '../utils/paperSizes';

type Mode = 'percent' | 'paper';
type FitMode = 'width' | 'height' | 'both';

export function ResizeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('resizeDialog');
  const sheet = useActiveSheet();
  const doc = useTEMStore((s) => s.doc);
  const resize = useTEMStore((s) => s.resizeActiveSheet);

  const [mode, setMode] = useState<Mode>('percent');
  const [percent, setPercent] = useState(100);
  // 独立倍率（Box サイズ維持モード用）
  const [independentAxes, setIndependentAxes] = useState(false);
  const [xPercent, setXPercent] = useState(100);
  const [yPercent, setYPercent] = useState(100);
  const [paperSize, setPaperSize] = useState<Exclude<PaperSizeKey, 'custom'>>('A4-landscape');
  const [fitMode, setFitMode] = useState<FitMode>('both');
  const [margin, setMargin] = useState(0.05);
  const [includeFontSize, setIncludeFontSize] = useState(true);
  type ScaleMode = 'full' | 'preserve-size' | 'size-only';
  const [scaleMode, setScaleMode] = useState<ScaleMode>('full');

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

  // 現在の bbox
  const bbox = useMemo(() => {
    if (!sheet) return null;
    return computeContentBounds(sheet, doc.settings.layout, doc.settings);
  }, [sheet, doc.settings]);

  // 計算される倍率（x/y 独立 or 同一）
  const computed = useMemo<{ xScale: number; yScale: number }>(() => {
    if (mode === 'percent') {
      if (independentAxes) {
        return { xScale: xPercent / 100, yScale: yPercent / 100 };
      }
      const s = percent / 100;
      return { xScale: s, yScale: s };
    }
    if (!bbox) return { xScale: 1, yScale: 1 };
    const paper = getPaperPx(paperSize);
    const innerW = Math.max(1, paper.width * (1 - margin * 2));
    const innerH = Math.max(1, paper.height * (1 - margin * 2));
    const sx = innerW / Math.max(1, bbox.width);
    const sy = innerH / Math.max(1, bbox.height);
    if (fitMode === 'width') return { xScale: sx, yScale: sx };
    if (fitMode === 'height') return { xScale: sy, yScale: sy };
    // both: preserve-size なら x/y 独立（用紙にぴったりフィット）、そうでなければ均等
    if (scaleMode === 'preserve-size') return { xScale: sx, yScale: sy };
    const s = Math.min(sx, sy);
    return { xScale: s, yScale: s };
  }, [mode, percent, independentAxes, xPercent, yPercent, bbox, paperSize, fitMode, margin, scaleMode]);

  if (!open) return null;

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-close')) return;
    const cur = pos ?? { x: window.innerWidth / 2 - 240, y: window.innerHeight / 2 - 200 };
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, dlgX: cur.x, dlgY: cur.y };
    setPos(cur);
    setDragging(true);
  };
  const modalStyle: React.CSSProperties = pos
    ? { width: 480, position: 'absolute', left: pos.x, top: pos.y, margin: 0 }
    : { width: 480 };

  const applyResize = () => {
    const { xScale, yScale } = computed;
    if (!isFinite(xScale) || !isFinite(yScale) || xScale <= 0 || yScale <= 0) {
      alert(t('alert.invalid'));
      return;
    }
    if (xScale === 1 && yScale === 1) {
      alert(t('alert.noChange'));
      return;
    }
    const xp = (xScale * 100).toFixed(1);
    const yp = (yScale * 100).toFixed(1);
    const msg = xScale === yScale
      ? t('confirm.uniform', { p: xp })
      : t('confirm.xy', { x: xp, y: yp });
    const modeLabel = scaleMode === 'preserve-size'
      ? '\n' + t('confirm.preserveSize')
      : scaleMode === 'size-only'
        ? '\n' + t('confirm.sizeOnly')
        : '';
    if (!confirm(`${msg}${modeLabel}\n${t('confirm.undo', { key: shortcutLabel('Ctrl+Z') })}`)) return;
    resize({ xScale, yScale }, { includeFontSize, mode: scaleMode });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <div
          className="modal-header"
          onMouseDown={onHeaderMouseDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          title={t('drag')}
        >
          <h3>{t('title')}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ minHeight: 300 }}>
          <p className="hint" style={{ marginTop: 0 }}>
            {t('hint.what')}
            <br />
            {t('hint.undo', { key: shortcutLabel('Ctrl+Z') })}
          </p>
          <section className="settings-section">
            <div className="setting-row">
              <label>{t('mode')}</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                <option value="percent">{t('mode.percent')}</option>
                <option value="paper">{t('mode.paper')}</option>
              </select>
            </div>
            {mode === 'percent' && (
              <>
                <div className="setting-row">
                  <label>{t('independent')}</label>
                  <input
                    type="checkbox"
                    checked={independentAxes}
                    onChange={(e) => setIndependentAxes(e.target.checked)}
                  />
                </div>
                {!independentAxes && (
                  <div className="setting-row">
                    <label>{t('scale')}</label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      step={1}
                      value={percent}
                      onChange={(e) => setPercent(Math.max(1, Number(e.target.value)))}
                      style={{ width: 90 }}
                    />
                  </div>
                )}
                {independentAxes && (
                  <>
                    <div className="setting-row">
                      <label>{t('scale.x')}</label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        step={1}
                        value={xPercent}
                        onChange={(e) => setXPercent(Math.max(1, Number(e.target.value)))}
                        style={{ width: 90 }}
                      />
                    </div>
                    <div className="setting-row">
                      <label>{t('scale.y')}</label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        step={1}
                        value={yPercent}
                        onChange={(e) => setYPercent(Math.max(1, Number(e.target.value)))}
                        style={{ width: 90 }}
                      />
                    </div>
                  </>
                )}
              </>
            )}
            {mode === 'paper' && (
              <>
                <div className="setting-row">
                  <label>{t('paperSize')}</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as typeof paperSize)}
                    style={{ maxWidth: 260 }}
                  >
                    {PAPER_SIZE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="setting-row">
                  <label>{t('fit')}</label>
                  <select value={fitMode} onChange={(e) => setFitMode(e.target.value as FitMode)}>
                    <option value="both">{t('fit.both')}</option>
                    <option value="width">{t('fit.width')}</option>
                    <option value="height">{t('fit.height')}</option>
                  </select>
                </div>
                <div className="setting-row">
                  <label>{t('margin')}</label>
                  <input
                    type="number"
                    min={0}
                    max={0.3}
                    step={0.01}
                    value={margin}
                    onChange={(e) => setMargin(Math.max(0, Number(e.target.value)))}
                    style={{ width: 80 }}
                  />
                </div>
              </>
            )}
          </section>

          <section className="settings-section">
            <h4 style={{ margin: '0 0 4px' }}>{t('scaleMode')}</h4>
            <div className="setting-row">
              <label>
                <input
                  type="radio"
                  name="scaleMode"
                  checked={scaleMode === 'full'}
                  onChange={() => setScaleMode('full')}
                /> {t('scaleMode.full')}
              </label>
            </div>
            <div className="setting-row">
              <label>
                <input
                  type="radio"
                  name="scaleMode"
                  checked={scaleMode === 'preserve-size'}
                  onChange={() => setScaleMode('preserve-size')}
                /> {t('scaleMode.preserveSize')}
              </label>
            </div>
            <div className="setting-row">
              <label>
                <input
                  type="radio"
                  name="scaleMode"
                  checked={scaleMode === 'size-only'}
                  onChange={() => setScaleMode('size-only')}
                /> {t('scaleMode.sizeOnly')}
              </label>
            </div>
            <p className="hint" style={{ marginTop: 4 }}>
              {scaleMode === 'full'
                ? t('scaleMode.full.hint')
                : scaleMode === 'preserve-size'
                  ? t('scaleMode.preserveSize.hint')
                  : t('scaleMode.sizeOnly.hint')}
            </p>
            {scaleMode === 'full' && (
              <div className="setting-row">
                <label>{t('includeFontSize')}</label>
                <input
                  type="checkbox"
                  checked={includeFontSize}
                  onChange={(e) => setIncludeFontSize(e.target.checked)}
                />
              </div>
            )}
          </section>

          <section className="settings-section" style={{ background: '#f6f9fc', padding: 8, borderRadius: 4, border: '1px solid #e0e8f0' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('preview')}</div>
            {!bbox ? (
              <p className="hint" style={{ margin: 0 }}>{t('preview.empty')}</p>
            ) : (
              <>
                <div className="setting-row">
                  <span>{t('preview.current')}</span>
                  <span>{Math.round(bbox.width)} × {Math.round(bbox.height)} px</span>
                </div>
                <div className="setting-row">
                  <span>{t('preview.after')}</span>
                  <span style={{ fontWeight: 600, color: '#2684ff' }}>
                    {Math.round(bbox.width * computed.xScale)} × {Math.round(bbox.height * computed.yScale)} px
                  </span>
                </div>
                <div className="setting-row">
                  <span>{t('preview.scale')}</span>
                  <span style={{ fontWeight: 600 }}>
                    {computed.xScale === computed.yScale
                      ? `${(computed.xScale * 100).toFixed(1)} %`
                      : t('preview.xy', { x: (computed.xScale * 100).toFixed(1), y: (computed.yScale * 100).toFixed(1) })}
                  </span>
                </div>
                {scaleMode === 'preserve-size' && (
                  <p className="hint" style={{ margin: '4px 0 0', color: '#059' }}>
                    {t('preview.note.preserveSize')}
                  </p>
                )}
                {scaleMode === 'size-only' && (
                  <p className="hint" style={{ margin: '4px 0 0', color: '#059' }}>
                    {t('preview.note.sizeOnly')}
                  </p>
                )}
              </>
            )}
          </section>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="ribbon-btn-small" onClick={onClose}>{t('cancel')}</button>
          <button className="ribbon-btn-primary" onClick={applyResize}>
            {t('apply')}
          </button>
        </div>
      </div>
    </div>
  );
}
