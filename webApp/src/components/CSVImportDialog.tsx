// ============================================================================
// CSVImportDialog - CSV インポート（Box / Line / SDSG / 時期ラベル）
// - エンティティ種別を切替えて取り込み
// - ファイル読込 → プレビュー → 列マッピング → インポート
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import {
  buildBoxesFromRows,
  buildLinesFromRows,
  buildSDSGsFromRows,
  buildPeriodLabelsFromRows,
  guessFieldKind,
  guessLineFieldKind,
  guessSDSGFieldKind,
  guessPeriodLabelFieldKind,
  parseCsvFile,
  type CsvFieldKind,
  type LineCsvFieldKind,
  type SDSGCsvFieldKind,
  type PeriodLabelCsvFieldKind,
  type ParsedCsv,
} from '../utils/csvImport';
import type { BoxType } from '../types';
import { BOX_TYPE_LABELS, LEVEL_PX } from '../store/defaults';

type EntityKind = 'box' | 'line' | 'sdsg' | 'period';

const BOX_FIELD_OPTIONS: CsvFieldKind[] = [
  'ignore', 'label', 'type', 'timeLevel', 'itemLevel', 'id', 'subLabel', 'description', 'width', 'height',
];
const LINE_FIELD_OPTIONS: LineCsvFieldKind[] = [
  'ignore', 'id', 'from', 'to', 'type', 'shape', 'label', 'description',
];
const SDSG_FIELD_OPTIONS: SDSGCsvFieldKind[] = [
  'ignore', 'id', 'type', 'label', 'attachedTo', 'attachedTo2', 'anchorMode', 'spaceMode', 'subLabel', 'description',
];
const PERIOD_FIELD_OPTIONS: PeriodLabelCsvFieldKind[] = ['ignore', 'id', 'position', 'label'];

/** 取り込む対象の表示名のキー（locales/csvImportDialog.csv） */
const ENTITY_LABEL_KEYS: Record<EntityKind, string> = {
  box: 'entity.box',
  line: 'entity.line',
  sdsg: 'entity.sdsg',
  period: 'entity.period',
};

type InsertMode = 'append' | 'new-sheet' | 'between';

export function CSVImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation('csvImportDialog');
  /** Box の種類の表示名（日本語は従来の表示名、ほかの言語は TEM の用語の表） */
  const boxTypeLabel = (bt: string) => (i18n.language === 'ja' ? BOX_TYPE_LABELS[bt].ja : t(`terms:boxType.${bt}`));
  const doc = useTEMStore((s) => s.doc);
  const sheet = useActiveSheet();
  const importBoxes = useTEMStore((s) => s.importBoxes);
  const importLines = useTEMStore((s) => s.importLines);
  const importSDSGs = useTEMStore((s) => s.importSDSGs);
  const importPeriodLabels = useTEMStore((s) => s.importPeriodLabels);
  const addSheet = useTEMStore((s) => s.addSheet);
  const switchSheet = useTEMStore((s) => s.setActiveSheet);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [entityKind, setEntityKind] = useState<EntityKind>('box');
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<string[]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [defaultType, setDefaultType] = useState<BoxType>('normal');
  const [insertMode, setInsertMode] = useState<InsertMode>('append');
  const [afterBoxId, setAfterBoxId] = useState<string>('');
  const [beforeBoxId, setBeforeBoxId] = useState<string>('');
  const [gap, setGap] = useState(20);
  const [autoConnect, setAutoConnect] = useState(false);
  const [lineType, setLineType] = useState<'RLine' | 'XLine'>('RLine');
  const [error, setError] = useState<string | null>(null);

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

  const previewRows = useMemo(() => {
    if (!parsed) return [] as string[][];
    const rows = hasHeader ? parsed.rows.slice(1) : parsed.rows;
    return rows.slice(0, 5);
  }, [parsed, hasHeader]);

  const existingIds = useMemo(() => {
    const s = new Set<string>();
    doc.sheets.forEach((sh) => {
      sh.boxes.forEach((b) => s.add(b.id));
      sh.lines.forEach((l) => s.add(l.id));
      sh.sdsg.forEach((sg) => s.add(sg.id));
      sh.periodLabels.forEach((p) => s.add(p.id));
    });
    return s;
  }, [doc]);

  const validBoxIds = useMemo(() => new Set(sheet?.boxes.map((b) => b.id) ?? []), [sheet]);
  const validLineIds = useMemo(() => new Set(sheet?.lines.map((l) => l.id) ?? []), [sheet]);

  if (!open) return null;

  // エンティティ別 helper
  const fieldOptionsFor = (kind: EntityKind): { value: string; label: string }[] => {
    switch (kind) {
      case 'box': return BOX_FIELD_OPTIONS.map((f) => ({ value: f, label: t(`field.box.${f}`) }));
      case 'line': return LINE_FIELD_OPTIONS.map((f) => ({ value: f, label: t(`field.line.${f}`) }));
      case 'sdsg': return SDSG_FIELD_OPTIONS.map((f) => ({ value: f, label: t(`field.sdsg.${f}`) }));
      case 'period': return PERIOD_FIELD_OPTIONS.map((f) => ({ value: f, label: t(`field.period.${f}`) }));
    }
  };

  const guessFor = (header: string, kind: EntityKind): string => {
    switch (kind) {
      case 'box': return guessFieldKind(header);
      case 'line': return guessLineFieldKind(header);
      case 'sdsg': return guessSDSGFieldKind(header);
      case 'period': return guessPeriodLabelFieldKind(header);
    }
  };

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-close')) return;
    const cur = pos ?? { x: window.innerWidth / 2 - 360, y: window.innerHeight / 2 - 280 };
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, dlgX: cur.x, dlgY: cur.y };
    setPos(cur);
    setDragging(true);
  };

  const modalStyle: React.CSSProperties = pos
    ? { width: 720, maxWidth: '95vw', position: 'absolute', left: pos.x, top: pos.y, margin: 0 }
    : { width: 720, maxWidth: '95vw' };

  // mapping を再算出（ファイル読込後 / エンティティ種別変更時）
  const recomputeMapping = (p: ParsedCsv, kind: EntityKind) => {
    const cols = p.rows[0]?.length ?? 0;
    const map: string[] = [];
    if (p.probableHeader && p.rows.length > 0) {
      for (let i = 0; i < cols; i++) {
        map.push(guessFor(p.rows[0][i] ?? '', kind));
      }
    } else {
      // ヘッダなし: Box は 1 列目を label に、それ以外は ignore のまま（必須列はユーザが指定）
      for (let i = 0; i < cols; i++) {
        map.push(kind === 'box' && i === 0 ? 'label' : 'ignore');
      }
    }
    setMapping(map);
  };

  const handleFile = async (f: File) => {
    setError(null);
    try {
      const p = await parseCsvFile(f);
      setParsed(p);
      setHasHeader(p.probableHeader);
      recomputeMapping(p, entityKind);
    } catch (e) {
      setError(t('error.parse', { message: e instanceof Error ? e.message : String(e) }));
    }
  };

  const onChangeEntity = (kind: EntityKind) => {
    setEntityKind(kind);
    if (parsed) recomputeMapping(parsed, kind);
  };

  const runImport = () => {
    if (!parsed) return;
    setError(null);

    if (entityKind === 'box') {
      let startTime = 0;
      const baseItem = 0;
      if (insertMode === 'append' && sheet && sheet.boxes.length > 0) {
        const isH = doc.settings.layout === 'horizontal';
        const maxT = Math.max(...sheet.boxes.map((b) => (isH ? b.x + b.width : b.y + b.height)));
        startTime = Math.ceil(maxT / LEVEL_PX) + 1;
      }
      const result = buildBoxesFromRows(parsed.rows, {
        mapping: mapping as CsvFieldKind[],
        hasHeader,
        defaultType,
        defaultWidth: doc.settings.defaultBoxSize.width,
        defaultHeight: doc.settings.defaultBoxSize.height,
        defaultFontSize: doc.settings.defaultFontSize,
        defaultTextOrientation: doc.settings.layout === 'horizontal' ? 'vertical' : 'horizontal',
        startTimeLevel: startTime,
        baseItemLevel: baseItem,
        autoConnect,
        connectLineType: lineType,
        existingIds,
        levelPx: LEVEL_PX,
      });
      if (result.boxes.length === 0) {
        setError(t('error.noBoxes'));
        return;
      }
      if (insertMode === 'new-sheet') {
        const newId = addSheet(t('sheet.defaultName', { lng: doc.settings.locale ?? 'ja' })); // 新しいシートの名前は図の言語
        switchSheet(newId);
        setTimeout(() => {
          importBoxes(result.boxes, result.lines);
          finishImport(t('done.boxes', { boxes: result.boxes.length, lines: result.lines.length }), result.errors);
        }, 0);
        return;
      }
      if (insertMode === 'between') {
        importBoxes(result.boxes, result.lines, {
          insertAfterBoxId: afterBoxId || undefined,
          insertBeforeBoxId: !afterBoxId && beforeBoxId ? beforeBoxId : undefined,
          gap,
        });
      } else {
        importBoxes(result.boxes, result.lines);
      }
      finishImport(t('done.boxes', { boxes: result.boxes.length, lines: result.lines.length }), result.errors);
      return;
    }

    if (entityKind === 'line') {
      const result = buildLinesFromRows(parsed.rows, {
        mapping: mapping as LineCsvFieldKind[],
        hasHeader,
        defaultType: lineType,
        defaultShape: 'straight',
        existingIds,
        validBoxIds,
      });
      if (result.lines.length === 0) {
        setError(t('error.noLines'));
        return;
      }
      importLines(result.lines);
      finishImport(t('done.lines', { count: result.lines.length }), result.errors);
      return;
    }

    if (entityKind === 'sdsg') {
      const result = buildSDSGsFromRows(parsed.rows, {
        mapping: mapping as SDSGCsvFieldKind[],
        hasHeader,
        existingIds,
        validBoxIds,
        validLineIds,
      });
      if (result.sdsgs.length === 0) {
        setError(t('error.noSdsg'));
        return;
      }
      importSDSGs(result.sdsgs);
      finishImport(t('done.sdsg', { count: result.sdsgs.length }), result.errors);
      return;
    }

    // period
    const result = buildPeriodLabelsFromRows(parsed.rows, {
      mapping: mapping as PeriodLabelCsvFieldKind[],
      hasHeader,
      existingIds,
    });
    if (result.periodLabels.length === 0) {
      setError(t('error.noPeriods'));
      return;
    }
    importPeriodLabels(result.periodLabels);
    finishImport(t('done.periods', { count: result.periodLabels.length }), result.errors);
  };

  const finishImport = (successMsg: string, errors: string[]) => {
    if (errors.length > 0) {
      alert(`${t('done.withWarnings', { count: errors.length })}\n\n${errors.join('\n')}`);
    } else {
      alert(successMsg);
    }
    onClose();
  };

  const fieldOptions = fieldOptionsFor(entityKind);
  const showBoxOptions = entityKind === 'box';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <div
          className="modal-header"
          onMouseDown={onHeaderMouseDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          title={t('dragToMove')}
        >
          <h3>{t('title')}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ minHeight: 420 }}>
          <section className="settings-section">
            <div className="setting-row">
              <label>{t('target')}</label>
              <select value={entityKind} onChange={(e) => onChangeEntity(e.target.value as EntityKind)}>
                {(Object.keys(ENTITY_LABEL_KEYS) as EntityKind[]).map((k) => (
                  <option key={k} value={k}>{t(ENTITY_LABEL_KEYS[k])}</option>
                ))}
              </select>
            </div>
          </section>

          {!parsed && (
            <section className="settings-section">
              <p className="hint" style={{ marginTop: 0 }}>
                {t('chooseFile')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {error && <p style={{ color: '#c33', fontSize: '0.88em' }}>{error}</p>}
              <div style={{ marginTop: 16, fontSize: '0.85em', color: '#666' }}>
                <strong>{t('spec.heading', { target: t(ENTITY_LABEL_KEYS[entityKind]) })}</strong>
                <ul style={{ marginTop: 4 }}>
                  {entityKind === 'box' && (
                    <>
                      <li>{t('spec.box.required')}</li>
                      <li>{t('spec.box.optional')}</li>
                      <li>{t('spec.box.types')}</li>
                    </>
                  )}
                  {entityKind === 'line' && (
                    <>
                      <li>{t('spec.line.required')}</li>
                      <li>{t('spec.line.optional')}</li>
                      <li>{t('spec.line.before')}<strong>{t('spec.line.currentSheet')}</strong>{t('spec.line.after')}</li>
                    </>
                  )}
                  {entityKind === 'sdsg' && (
                    <>
                      <li>{t('spec.sdsg.required')}</li>
                      <li>{t('spec.sdsg.optional')}</li>
                      <li>{t('spec.sdsg.between')}</li>
                    </>
                  )}
                  {entityKind === 'period' && (
                    <>
                      <li>{t('spec.period.required')}</li>
                      <li>{t('spec.period.optional')}</li>
                    </>
                  )}
                </ul>
              </div>
            </section>
          )}

          {parsed && (
            <>
              <section className="settings-section">
                <div className="setting-row">
                  <label>{t('hasHeader')}</label>
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                  />
                </div>
                <div className="setting-row">
                  <label>{t('delimiter')}</label>
                  <span style={{ fontFamily: 'monospace' }}>{JSON.stringify(parsed.delimiter)}</span>
                </div>
                <div className="setting-row">
                  <label>{t('rowCount')}</label>
                  <span>{t('rowCountValue', { total: parsed.rows.length, data: hasHeader ? parsed.rows.length - 1 : parsed.rows.length })}</span>
                </div>
                <div className="setting-row">
                  <button
                    className="ribbon-btn-small"
                    onClick={() => { setParsed(null); setMapping([]); }}
                  >
                    {t('chooseAnother')}
                  </button>
                </div>
              </section>

              <section className="settings-section">
                <h4>{t('mapping.heading')}</h4>
                <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: '0.85em' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #ddd', padding: '4px 6px', background: '#f5f5f5' }}>{t('mapping.column')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '4px 6px', background: '#f5f5f5' }}>{t('mapping.header')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '4px 6px', background: '#f5f5f5' }}>{t('mapping.assign')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mapping.map((kind, i) => (
                        <tr key={i}>
                          <td style={{ border: '1px solid #ddd', padding: '2px 6px', color: '#666' }}>{i + 1}</td>
                          <td style={{ border: '1px solid #ddd', padding: '2px 6px', fontFamily: 'monospace' }}>
                            {parsed.rows[0]?.[i] ?? ''}
                            {!hasHeader && parsed.rows[1] && (
                              <span style={{ color: '#999' }}> / {parsed.rows[1][i]}</span>
                            )}
                          </td>
                          <td style={{ border: '1px solid #ddd', padding: '2px 6px' }}>
                            <select
                              value={kind}
                              onChange={(e) => {
                                const v = e.target.value;
                                setMapping((m) => m.map((x, j) => (j === i ? v : x)));
                              }}
                            >
                              {fieldOptions.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {showBoxOptions && (
                <section className="settings-section">
                  <h4>{t('options.heading')}</h4>
                  <div className="setting-row">
                    <label>{t('options.defaultType')}</label>
                    <select value={defaultType} onChange={(e) => setDefaultType(e.target.value as BoxType)}>
                      {Object.keys(BOX_TYPE_LABELS).map((k) => (
                        <option key={k} value={k}>{boxTypeLabel(k)} ({k})</option>
                      ))}
                    </select>
                  </div>
                  <div className="setting-row">
                    <label>{t('options.insertMode')}</label>
                    <select value={insertMode} onChange={(e) => setInsertMode(e.target.value as InsertMode)}>
                      <option value="append">{t('options.append')}</option>
                      <option value="between">{t('options.between')}</option>
                      <option value="new-sheet">{t('options.newSheet')}</option>
                    </select>
                  </div>
                  {insertMode === 'between' && sheet && (
                    <>
                      <div className="setting-row">
                        <label>{t('options.after')}</label>
                        <select value={afterBoxId} onChange={(e) => { setAfterBoxId(e.target.value); setBeforeBoxId(''); }}>
                          <option value="">{t('options.none')}</option>
                          {sheet.boxes.map((b) => (
                            <option key={b.id} value={b.id}>{b.id}: {b.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="setting-row">
                        <label>{t('options.before')}</label>
                        <select
                          value={beforeBoxId}
                          onChange={(e) => { setBeforeBoxId(e.target.value); setAfterBoxId(''); }}
                          disabled={!!afterBoxId}
                        >
                          <option value="">{t('options.none')}</option>
                          {sheet.boxes.map((b) => (
                            <option key={b.id} value={b.id}>{b.id}: {b.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="setting-row">
                        <label>{t('options.gap')}</label>
                        <input
                          type="number"
                          min={0}
                          value={gap}
                          onChange={(e) => setGap(Math.max(0, Number(e.target.value)))}
                          style={{ width: 80 }}
                        />
                      </div>
                    </>
                  )}
                  <div className="setting-row">
                    <label>{t('options.autoConnect')}</label>
                    <input
                      type="checkbox"
                      checked={autoConnect}
                      onChange={(e) => setAutoConnect(e.target.checked)}
                    />
                  </div>
                  {autoConnect && (
                    <div className="setting-row">
                      <label>{t('options.lineType')}</label>
                      <select value={lineType} onChange={(e) => setLineType(e.target.value as 'RLine' | 'XLine')}>
                        <option value="RLine">{t('options.RLine')}</option>
                        <option value="XLine">{t('options.XLine')}</option>
                      </select>
                    </div>
                  )}
                </section>
              )}

              {entityKind === 'line' && (
                <section className="settings-section">
                  <h4>{t('options.heading')}</h4>
                  <div className="setting-row">
                    <label>{t('options.defaultLineType')}</label>
                    <select value={lineType} onChange={(e) => setLineType(e.target.value as 'RLine' | 'XLine')}>
                      <option value="RLine">{t('options.RLineCode')}</option>
                      <option value="XLine">{t('options.XLineCode')}</option>
                    </select>
                  </div>
                </section>
              )}

              <section className="settings-section">
                <h4>{t('preview')}</h4>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.82em' }}>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {row.map((c, j) => (
                          <td key={j} style={{ border: '1px solid #eee', padding: '2px 6px', color: mapping[j] === 'ignore' ? '#aaa' : '#222' }}>
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {error && <p style={{ color: '#c33', fontSize: '0.88em' }}>{error}</p>}
            </>
          )}
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="ribbon-btn-small" onClick={onClose}>{t('cancel')}</button>
          {parsed && (
            <button className="ribbon-btn-primary" onClick={runImport}>
              {t('import')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
