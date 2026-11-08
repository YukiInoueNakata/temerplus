// ============================================================================
// ImportWizardDialog - 表（CSV / Excel）からの取り込みウィザード
//
// 1. ファイル  : .csv / .tsv / .xlsx / .xls を読む。シート選択・ヘッダ有無・プレビュー
// 2. 取り込み先: Box / Line / SD・SG / 時期ラベル / 逐語録 / MAXQDA コード付きセグメント
// 3. 列の割当  : 列ごとに役割を選ぶ（ヘッダから自動推測、手で直せる）
// 4. (MAXQDA)  : セグメントに集約したうえで、コードごとに Box / SD / SG / 時期 / タグを選ぶ
// 5. 確認      : 件数と警告を見て実行
// .pptx を渡されたら PptxImportDialog（PowerPoint の TEM 図の取り込み）へ切り替える。
//
// 既存の CSV 取り込み（CSVImportDialog）を列指定つきで置き換える入口。
// Box などの組み立ては utils/csvImport の関数をそのまま使い、MAXQDA は utils/maxqdaImport。
// ============================================================================

import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import { LEVEL_PX, BOX_TYPE_LABELS } from '../store/defaults';
import { parseTabularFile, looksLikeHeader, type TabularFile } from '../utils/tabularFile';
import {
  FIELD_LABELS, guessFieldKind, buildBoxesFromRows, type CsvFieldKind,
  LINE_FIELD_LABELS, guessLineFieldKind, buildLinesFromRows, type LineCsvFieldKind,
  SDSG_FIELD_LABELS, guessSDSGFieldKind, buildSDSGsFromRows, type SDSGCsvFieldKind,
  PERIOD_LABEL_FIELD_LABELS, guessPeriodLabelFieldKind, buildPeriodLabelsFromRows, type PeriodLabelCsvFieldKind,
} from '../utils/csvImport';
import { buildParagraphsFromRows } from '../utils/transcriptImport/csv';
import { genTranscriptId } from '../store/defaults';
import {
  MAXQDA_ROLE_LABELS, guessMaxqdaRole, dedupeSegments, summarizeCodes, buildFromSegments,
  CODE_ACTION_LABELS, MULTI_BOX_MODE_LABELS,
  type MaxqdaRole, type CodeAction, type CodePlan, type DedupeKeyMode, type MultiBoxMode,
} from '../utils/maxqdaImport';
import { SELECTABLE_BOX_TYPES } from '../utils/typeDisplay';
import { PptxImportDialog } from './PptxImportDialog';
import type { BoxType, Transcript } from '../types';

type Mode = 'box' | 'line' | 'sdsg' | 'period' | 'transcript' | 'maxqda';

/** 取り込み先の並び。表示名と説明は locales/importWizardDialog.csv の mode.<取り込み先>.label / .desc */
const MODES: Mode[] = ['box', 'line', 'sdsg', 'period', 'transcript', 'maxqda'];

type TranscriptRole = 'ignore' | 'text' | 'speaker' | 'timestamp';
const TRANSCRIPT_ROLES: TranscriptRole[] = ['ignore', 'text', 'speaker', 'timestamp'];
function guessTranscriptRole(header: string): TranscriptRole {
  const h = header.trim().toLowerCase();
  if (/speaker|話者|発言者|人物|name/.test(h)) return 'speaker'; // i18n-ok 利用者のファイルの見出しと照合する語
  if (/timestamp|time|時刻|時間/.test(h)) return 'timestamp'; // i18n-ok 利用者のファイルの見出しと照合する語
  if (/text|utterance|transcript|body|発言|本文|テキスト|内容|セグメント|segment/.test(h)) return 'text'; // i18n-ok 利用者のファイルの見出しと照合する語
  return 'ignore';
}

/** 取り込み先ごとの列の役割の並び。表示名は locales/importWizardDialog.csv の role.<取り込み先>.<役割> */
function rolesFor(mode: Mode): string[] {
  switch (mode) {
    case 'box': return Object.keys(FIELD_LABELS);
    case 'line': return Object.keys(LINE_FIELD_LABELS);
    case 'sdsg': return Object.keys(SDSG_FIELD_LABELS);
    case 'period': return Object.keys(PERIOD_LABEL_FIELD_LABELS);
    case 'transcript': return TRANSCRIPT_ROLES;
    case 'maxqda': return Object.keys(MAXQDA_ROLE_LABELS);
  }
}
function guessFor(mode: Mode, header: string): string {
  switch (mode) {
    case 'box': return guessFieldKind(header);
    case 'line': return guessLineFieldKind(header);
    case 'sdsg': return guessSDSGFieldKind(header);
    case 'period': return guessPeriodLabelFieldKind(header);
    case 'transcript': return guessTranscriptRole(header);
    case 'maxqda': return guessMaxqdaRole(header);
  }
}

/** モードを推測: MAXQDA の列が揃っていれば maxqda、本文列だけなら transcript、それ以外は box */
function guessMode(header: string[]): Mode {
  const roles = header.map(guessMaxqdaRole);
  if (roles.includes('code') && roles.includes('docName')) return 'maxqda';
  const t = header.map(guessTranscriptRole);
  if (t.includes('text') && (t.includes('speaker') || t.includes('timestamp'))) return 'transcript';
  return 'box';
}

export function ImportWizardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation('importWizardDialog');
  /** Box の種類の表示名（日本語は従来の表示名、ほかの言語は TEM の用語の表） */
  const boxTypeLabel = (bt: string) => (i18n.language === 'ja' ? BOX_TYPE_LABELS[bt].ja : t(`terms:boxType.${bt}`));
  /** 見出しの無い列の名前 */
  const colName = (i: number) => t('column', { n: i + 1 });
  const doc = useTEMStore((s) => s.doc);
  const sheet = useActiveSheet();
  const importBoxes = useTEMStore((s) => s.importBoxes);
  const importLines = useTEMStore((s) => s.importLines);
  const importSDSGs = useTEMStore((s) => s.importSDSGs);
  const importPeriodLabels = useTEMStore((s) => s.importPeriodLabels);
  const addTranscript = useTEMStore((s) => s.addTranscript);
  const addSourceRef = useTEMStore((s) => s.addSourceRef);
  const addSheet = useTEMStore((s) => s.addSheet);
  const setActiveSheet = useTEMStore((s) => s.setActiveSheet);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<TabularFile | null>(null);
  const [sheetIdx, setSheetIdx] = useState(0);
  const [hasHeader, setHasHeader] = useState(true);
  const [mode, setMode] = useState<Mode>('box');
  const [mapping, setMapping] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Box モードの追加設定
  const [defaultType, setDefaultType] = useState<BoxType>('normal');
  const [toNewSheet, setToNewSheet] = useState(false);
  const [autoConnect, setAutoConnect] = useState(false);
  // 逐語録
  const [transcriptTitle, setTranscriptTitle] = useState('');
  // MAXQDA
  const [keyMode, setKeyMode] = useState<DedupeKeyMode>('range');
  const [plans, setPlans] = useState<Record<string, CodePlan>>({});
  const [stackDocs, setStackDocs] = useState(true);
  const [multiBoxMode, setMultiBoxMode] = useState<MultiBoxMode>('stack');
  // PowerPoint（.pptx）は図形の取り込みなので別ダイアログ
  const [pptxFile, setPptxFile] = useState<File | null>(null);

  const rows = file?.sheets[sheetIdx]?.rows ?? [];
  const header = useMemo(() => (hasHeader && rows.length > 0 ? rows[0] : rows[0]?.map((_, i) => t('column', { n: i + 1 })) ?? []), [rows, hasHeader, t]);
  const preview = useMemo(() => rows.slice(0, 6), [rows]);

  const recomputeMapping = (m: Mode, hdr: string[], useHeader: boolean) => {
    setMapping(hdr.map((h, i) => (useHeader ? guessFor(m, h) : (m === 'box' && i === 0 ? 'label' : 'ignore'))));
  };

  const reset = () => {
    setStep(1); setFile(null); setSheetIdx(0); setMapping([]); setError(null); setPlans({});
  };

  const handleFile = async (f: File) => {
    setError(null);
    if (/.pptx$/i.test(f.name)) { setPptxFile(f); return; }
    try {
      const parsed = await parseTabularFile(f);
      if (parsed.sheets.length === 0 || parsed.sheets.every((s) => s.rows.length === 0)) {
        setError(t('error.noRows'));
        return;
      }
      const firstNonEmpty = parsed.sheets.findIndex((s) => s.rows.length > 0);
      const r = parsed.sheets[firstNonEmpty].rows;
      const hdr = looksLikeHeader(r);
      const m = hdr ? guessMode(r[0]) : 'box';
      setFile(parsed); setSheetIdx(firstNonEmpty); setHasHeader(hdr); setMode(m);
      recomputeMapping(m, hdr ? r[0] : r[0].map((_, i) => colName(i)), hdr);
      setTranscriptTitle(f.name.replace(/\.[^.]+$/, ''));
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  // --- MAXQDA: 集約と集計（列割当が変わるたびに再計算） ---
  const maxqda = useMemo(() => {
    if (mode !== 'maxqda' || rows.length === 0) return null;
    const dedupe = dedupeSegments(rows, { mapping: mapping as MaxqdaRole[], hasHeader, keyMode });
    const codes = summarizeCodes(dedupe.segments);
    return { dedupe, codes };
  }, [mode, rows, mapping, hasHeader, keyMode]);

  const effectivePlans: CodePlan[] = useMemo(() => {
    if (!maxqda) return [];
    return maxqda.codes.map((c) => plans[c.code] ?? { code: c.code, action: c.suggestedAction, boxType: c.suggestedType ?? 'normal' });
  }, [maxqda, plans]);

  const setPlan = (code: string, patch: Partial<CodePlan>) => {
    setPlans((prev) => {
      const base = prev[code] ?? effectivePlans.find((p) => p.code === code) ?? { code, action: 'tag' as CodeAction };
      return { ...prev, [code]: { ...base, ...patch } };
    });
  };

  const existingBoxIds = new Set(sheet?.boxes.map((b) => b.id) ?? []);
  const existingLineIds = new Set(sheet?.lines.map((l) => l.id) ?? []);
  const existingSdsgIds = new Set(sheet?.sdsg.map((s) => s.id) ?? []);

  const finish = (msg: string, warnings: string[]) => {
    alert(warnings.length > 0 ? `${msg}\n\n${t('done.warnings', { count: warnings.length })}\n${warnings.join('\n')}` : msg);
    reset();
    onClose();
  };

  /**
   * 反映してから結果を出す。新しいシートへ取り込むときはシートの切り替えを待って（setTimeout）反映し、
   * 反映が終わってから成功を知らせる（先に「取り込みました」と出して失敗を隠さない）
   */
  const applyThenFinish = (apply: () => void, msg: string, warnings: string[]) => {
    const done = () => {
      try {
        apply();
      } catch (e) {
        setError(t('error.importFailed', { message: e instanceof Error ? e.message : String(e) }));
        return;
      }
      finish(msg, warnings);
    };
    if (toNewSheet && file) {
      const id = addSheet(file.filename.replace(/\.[^.]+$/, ''));
      setActiveSheet(id);
      setTimeout(done, 0);
    } else {
      done();
    }
  };

  const runImport = () => {
    if (!file) return;
    setError(null);
    const isH = doc.settings.layout === 'horizontal';
    try {
      if (mode === 'box') {
        let startTime = 0;
        if (!toNewSheet && sheet && sheet.boxes.length > 0) {
          const maxT = Math.max(...sheet.boxes.map((b) => (isH ? b.x + b.width : b.y + b.height)));
          startTime = Math.ceil(maxT / LEVEL_PX) + 1;
        }
        const result = buildBoxesFromRows(rows, {
          mapping: mapping as CsvFieldKind[], hasHeader, defaultType,
          defaultWidth: doc.settings.defaultBoxSize.width, defaultHeight: doc.settings.defaultBoxSize.height,
          defaultFontSize: doc.settings.defaultFontSize,
          defaultTextOrientation: isH ? 'vertical' : 'horizontal',
          startTimeLevel: startTime, baseItemLevel: 0,
          autoConnect, connectLineType: 'RLine',
          existingIds: toNewSheet ? new Set() : existingBoxIds, levelPx: LEVEL_PX,
        });
        if (result.boxes.length === 0) { setError(t('error.noBoxes')); return; }
        applyThenFinish(() => importBoxes(result.boxes, result.lines),
          t('done.boxes', { boxes: result.boxes.length, lines: result.lines.length }), result.errors);
        return;
      }
      if (mode === 'line') {
        const result = buildLinesFromRows(rows, {
          mapping: mapping as LineCsvFieldKind[], hasHeader, defaultType: 'RLine', defaultShape: 'straight',
          existingIds: existingLineIds, validBoxIds: existingBoxIds,
        });
        if (result.lines.length === 0) { setError(t('error.noLines')); return; }
        importLines(result.lines);
        finish(t('done.lines', { count: result.lines.length }), result.errors);
        return;
      }
      if (mode === 'sdsg') {
        const result = buildSDSGsFromRows(rows, {
          mapping: mapping as SDSGCsvFieldKind[], hasHeader,
          existingIds: existingSdsgIds, validBoxIds: existingBoxIds, validLineIds: existingLineIds,
        });
        if (result.sdsgs.length === 0) { setError(t('error.noSdsg')); return; }
        importSDSGs(result.sdsgs);
        finish(t('done.sdsg', { count: result.sdsgs.length }), result.errors);
        return;
      }
      if (mode === 'period') {
        const result = buildPeriodLabelsFromRows(rows, {
          mapping: mapping as PeriodLabelCsvFieldKind[], hasHeader,
          existingIds: new Set(sheet?.periodLabels.map((p) => p.id) ?? []),
        });
        if (result.periodLabels.length === 0) { setError(t('error.noPeriods')); return; }
        importPeriodLabels(result.periodLabels);
        finish(t('done.periods', { count: result.periodLabels.length }), result.errors);
        return;
      }
      if (mode === 'transcript') {
        const textColumn = mapping.indexOf('text');
        if (textColumn < 0) { setError(t('error.noTextColumn')); return; }
        const speakerColumn = mapping.indexOf('speaker');
        const timestampColumn = mapping.indexOf('timestamp');
        const data = hasHeader ? rows.slice(1) : rows;
        const paragraphs = buildParagraphsFromRows(data, {
          textColumn,
          speakerColumn: speakerColumn >= 0 ? speakerColumn : undefined,
          timestampColumn: timestampColumn >= 0 ? timestampColumn : undefined,
        });
        if (paragraphs.length === 0) { setError(t('error.noParagraphs')); return; }
        const tr: Transcript = {
          id: genTranscriptId(), title: transcriptTitle || file.filename,
          source: file.format, importedAt: new Date().toISOString(), paragraphs,
        };
        addTranscript(tr);
        finish(t('done.transcript', { title: tr.title, count: paragraphs.length }), []);
        return;
      }
      if (mode === 'maxqda' && maxqda) {
        const result = buildFromSegments(maxqda.dedupe, {
          plans: effectivePlans,
          levelPx: LEVEL_PX,
          defaultWidth: doc.settings.defaultBoxSize.width, defaultHeight: doc.settings.defaultBoxSize.height,
          stackDocuments: stackDocs,
          multiBoxMode,
          existingBoxIds: toNewSheet ? new Set() : existingBoxIds,
          existingSdsgIds: toNewSheet ? new Set() : existingSdsgIds,
        });
        const apply = () => {
          result.transcripts.forEach((tr) => addTranscript(tr));
          if (result.boxes.length > 0) importBoxes(result.boxes, []);
          if (result.sdsg.length > 0) importSDSGs(result.sdsg);
          if (result.periodLabels.length > 0) importPeriodLabels(result.periodLabels);
          result.sourceRefs.forEach((r) => addSourceRef(r.target, r.ref));
        };
        applyThenFinish(
          apply,
          t('done.maxqda', { transcripts: result.transcripts.length, paragraphs: maxqda.dedupe.segments.length, boxes: result.boxes.length, sdsg: result.sdsg.length, periods: result.periodLabels.length }),
          result.warnings,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!open) return null;
  if (pptxFile) {
    return <PptxImportDialog open initialFile={pptxFile} onClose={() => { setPptxFile(null); reset(); onClose(); }} />;
  }

  const roles = rolesFor(mode);
  const canNext2 = file !== null;
  const canRun = mode === 'maxqda' ? !!maxqda && maxqda.dedupe.segments.length > 0 : mapping.some((m) => m !== 'ignore');
  const lastStep = mode === 'maxqda' ? 4 : 3;

  return (
    <div className="modal-backdrop" onClick={() => { reset(); onClose(); }} style={{ zIndex: 1250 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 860, maxWidth: '95vw' }}>
        <div className="modal-header">
          <h3>{t('title', { step, lastStep })}</h3>
          <button className="modal-close" onClick={() => { reset(); onClose(); }}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          {error && <p style={{ color: '#c0392b', whiteSpace: 'pre-wrap' }}>{error}</p>}

          {/* ---------------- 1. ファイル ---------------- */}
          {step === 1 && (
            <section className="settings-section">
              <h4>{t('step1.heading')}</h4>
              <p className="hint">{t('step1.hint')}</p>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed #b0b8c8', borderRadius: 6, padding: 28, textAlign: 'center', cursor: 'pointer', background: '#fafcff' }}
              >
                {t('step1.drop')}
                <input ref={fileInputRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,.xlsm,.pptx" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ''; }} />
              </div>
            </section>
          )}

          {/* ---------------- 2. 取り込み先とシート ---------------- */}
          {step === 2 && file && (
            <section className="settings-section">
              <h4>{t('step2.heading')}</h4>
              <p className="hint">{t('step2.hint', { filename: file.filename, rows: rows.length, mode: t(`mode.${mode}.label`) })}</p>
              {file.sheets.length > 1 && (
                <div className="setting-row">
                  <label>{t('step2.sheet')}</label>
                  <select value={sheetIdx} onChange={(e) => { const i = Number(e.target.value); setSheetIdx(i); const r = file.sheets[i].rows; const h = looksLikeHeader(r); setHasHeader(h); recomputeMapping(mode, h ? r[0] : r[0].map((_, k) => colName(k)), h); }}>
                    {file.sheets.map((s, i) => <option key={s.name} value={i}>{t('step2.sheetOption', { name: s.name, rows: s.rows.length })}</option>)}
                  </select>
                </div>
              )}
              <div className="setting-row">
                <label>{t('step2.hasHeader')}</label>
                <input type="checkbox" checked={hasHeader} onChange={(e) => { setHasHeader(e.target.checked); recomputeMapping(mode, e.target.checked ? rows[0] : rows[0].map((_, k) => colName(k)), e.target.checked); }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {MODES.map((m) => (
                  <label key={m} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, border: `1px solid ${mode === m ? '#2684ff' : '#ddd'}`, borderRadius: 6, background: mode === m ? '#eef5ff' : '#fff', cursor: 'pointer', fontWeight: 'normal' }}>
                    <input type="radio" name="import-mode" checked={mode === m} onChange={() => { setMode(m); recomputeMapping(m, header, hasHeader); }} />
                    <span><strong>{t(`mode.${m}.label`)}</strong><br /><span style={{ fontSize: '0.85em', color: '#666' }}>{t(`mode.${m}.desc`)}</span></span>
                  </label>
                ))}
              </div>
              <h5 style={{ margin: '14px 0 4px' }}>{t('step2.preview', { count: preview.length })}</h5>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.8em' }}>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} style={i === 0 && hasHeader ? { fontWeight: 'bold', background: '#f4f6fa' } : undefined}>
                        {r.map((c, j) => <td key={j} style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ---------------- 3. 列の割当 ---------------- */}
          {step === 3 && file && (
            <section className="settings-section">
              <h4>{t('step3.heading')}</h4>
              <p className="hint">{t('step3.hint', { required: t(`required.${mode}`) })}</p>
              <table className="data-table" style={{ fontSize: '0.88em' }}>
                <thead><tr><th style={{ width: 40 }}>#</th><th>{t('step3.col.header')}</th><th>{t('step3.col.example')}</th><th style={{ width: 220 }}>{t('step3.col.role')}</th></tr></thead>
                <tbody>
                  {header.map((h, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{h}</td>
                      <td style={{ color: '#666', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(hasHeader ? rows[1] : rows[0])?.[i] ?? ''}</td>
                      <td>
                        <select value={mapping[i] ?? 'ignore'} onChange={(e) => setMapping((prev) => { const next = [...prev]; next[i] = e.target.value; return next; })} style={{ width: '100%' }}>
                          {roles.map((k) => <option key={k} value={k}>{t(`role.${mode}.${k}`)}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {mode === 'box' && (
                <>
                  <div className="setting-row" style={{ marginTop: 10 }}>
                    <label>{t('step3.defaultType')}</label>
                    <select value={defaultType} onChange={(e) => setDefaultType(e.target.value as BoxType)}>
                      {SELECTABLE_BOX_TYPES.map((bt) => <option key={bt} value={bt}>{boxTypeLabel(bt)}</option>)}
                    </select>
                  </div>
                  <div className="setting-row"><label>{t('step3.autoConnect')}</label><input type="checkbox" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} /></div>
                  <div className="setting-row"><label>{t('toNewSheet')}</label><input type="checkbox" checked={toNewSheet} onChange={(e) => setToNewSheet(e.target.checked)} /></div>
                </>
              )}
              {mode === 'transcript' && (
                <div className="setting-row" style={{ marginTop: 10 }}>
                  <label>{t('step3.transcriptTitle')}</label>
                  <input value={transcriptTitle} onChange={(e) => setTranscriptTitle(e.target.value)} style={{ width: 280 }} />
                </div>
              )}
              {mode === 'maxqda' && (
                <div className="setting-row" style={{ marginTop: 10 }}>
                  <label>{t('step3.keyMode')}</label>
                  <select value={keyMode} onChange={(e) => setKeyMode(e.target.value as DedupeKeyMode)}>
                    <option value="range">{t('step3.keyMode.range')}</option>
                    <option value="text">{t('step3.keyMode.text')}</option>
                  </select>
                </div>
              )}
            </section>
          )}

          {/* ---------------- 4. MAXQDA: コードの振り分け ---------------- */}
          {step === 4 && mode === 'maxqda' && maxqda && (
            <section className="settings-section">
              <h4>{t('step4.heading')}</h4>
              <p className="hint">
                {t('step4.hint', { docs: maxqda.dedupe.docNames.length, segments: maxqda.dedupe.segments.length, rows: hasHeader ? rows.length - 1 : rows.length })}
              </p>
              {maxqda.dedupe.warnings.length > 0 && (
                <p className="hint" style={{ color: '#b45309' }}>{maxqda.dedupe.warnings.join(' / ')}</p>
              )}
              <div className="setting-row"><label>{t('step4.stackDocs')}</label><input type="checkbox" checked={stackDocs} onChange={(e) => setStackDocs(e.target.checked)} /></div>
              <div className="setting-row">
                <label title={t('step4.multiBox.tip')}>{t('step4.multiBox')}</label>
                <select value={multiBoxMode} onChange={(e) => setMultiBoxMode(e.target.value as MultiBoxMode)}>
                  {(Object.keys(MULTI_BOX_MODE_LABELS) as MultiBoxMode[]).map((m) => <option key={m} value={m}>{t(`multiBox.${m}`)}</option>)}
                </select>
              </div>
              <div className="setting-row"><label>{t('toNewSheet')}</label><input type="checkbox" checked={toNewSheet} onChange={(e) => setToNewSheet(e.target.checked)} /></div>
              <table className="data-table" style={{ fontSize: '0.88em', marginTop: 8 }}>
                <thead><tr><th>{t('step4.col.code')}</th><th style={{ width: 60 }}>{t('step4.col.count')}</th><th style={{ width: 60 }}>{t('step4.col.docs')}</th><th style={{ width: 160 }}>{t('step4.col.action')}</th><th style={{ width: 150 }}>{t('step4.col.boxType')}</th></tr></thead>
                <tbody>
                  {maxqda.codes.map((c) => {
                    const plan = effectivePlans.find((p) => p.code === c.code)!;
                    return (
                      <tr key={c.code}>
                        <td title={c.code}>{c.parents.length > 0 && <span style={{ color: '#888' }}>{c.parents.join(' › ')} › </span>}{c.leaf}</td>
                        <td>{c.count}</td>
                        <td>{c.docCount}</td>
                        <td>
                          <select value={plan.action} onChange={(e) => setPlan(c.code, { action: e.target.value as CodeAction })} style={{ width: '100%' }}>
                            {(Object.keys(CODE_ACTION_LABELS) as CodeAction[]).map((a) => <option key={a} value={a}>{t(`action.${a}`)}</option>)}
                          </select>
                        </td>
                        <td>
                          {plan.action === 'box' && (
                            <select value={plan.boxType ?? 'normal'} onChange={(e) => setPlan(c.code, { boxType: e.target.value as BoxType })} style={{ width: '100%' }}>
                              {SELECTABLE_BOX_TYPES.map((bt) => <option key={bt} value={bt}>{boxTypeLabel(bt)}</option>)}
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {step > 1 && <button className="ribbon-btn-small" onClick={() => setStep(step - 1)}>← {t('back')}</button>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step === 1 && <button className="ribbon-btn-small" onClick={() => { reset(); onClose(); }}>{t('cancel')}</button>}
            {step === 2 && <button className="ribbon-btn-primary" disabled={!canNext2} onClick={() => setStep(3)}>{t('next')} →</button>}
            {step === 3 && mode === 'maxqda' && <button className="ribbon-btn-primary" disabled={!maxqda || maxqda.dedupe.segments.length === 0} onClick={() => setStep(4)}>{t('next')} →</button>}
            {step === lastStep && step >= 3 && <button className="ribbon-btn-primary" disabled={!canRun} onClick={runImport}>{t('import')}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
