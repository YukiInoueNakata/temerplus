// ============================================================================
// ImportWizardDialog - 表（CSV / Excel）からの取り込みウィザード
//
// 1. ファイル  : .csv / .tsv / .xlsx / .xls を読む。シート選択・ヘッダ有無・プレビュー
// 2. 取り込み先: Box / Line / SD・SG / 時期ラベル / 逐語録 / MAXQDA コード付きセグメント
// 3. 列の割当  : 列ごとに役割を選ぶ（ヘッダから自動推測、手で直せる）
// 4. (MAXQDA)  : セグメントに集約したうえで、コードごとに Box / SD / SG / 時期 / タグを選ぶ
// 5. 確認      : 件数と警告を見て実行
//
// 既存の CSV 取り込み（CSVImportDialog）を列指定つきで置き換える入口。
// Box などの組み立ては utils/csvImport の関数をそのまま使い、MAXQDA は utils/maxqdaImport。
// ============================================================================

import { useMemo, useRef, useState } from 'react';
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
  CODE_ACTION_LABELS, type MaxqdaRole, type CodeAction, type CodePlan, type DedupeKeyMode,
} from '../utils/maxqdaImport';
import { SELECTABLE_BOX_TYPES } from '../utils/typeDisplay';
import type { BoxType, Transcript } from '../types';

type Mode = 'box' | 'line' | 'sdsg' | 'period' | 'transcript' | 'maxqda';

const MODE_LABELS: Record<Mode, { label: string; desc: string }> = {
  box: { label: 'Box（出来事の一覧）', desc: '1 行 = 1 Box。ラベル列だけあれば取り込める' },
  line: { label: 'Line（矢印）', desc: 'from / to の Box ID で径路を引く' },
  sdsg: { label: 'SD / SG', desc: '紐付け先の Box ID と種別' },
  period: { label: '時期ラベル', desc: '位置（Time Level）とラベル' },
  transcript: { label: '逐語録', desc: '1 行 = 1 段落。話者・時刻の列は任意' },
  maxqda: { label: 'MAXQDA コード付きセグメント', desc: '同じセグメントの行を集約し、コードを Box / SD・SG / 時期 / タグに振り分ける' },
};

type TranscriptRole = 'ignore' | 'text' | 'speaker' | 'timestamp';
const TRANSCRIPT_ROLE_LABELS: Record<TranscriptRole, string> = {
  ignore: '（無視）', text: '本文', speaker: '話者', timestamp: '時刻',
};
function guessTranscriptRole(header: string): TranscriptRole {
  const h = header.trim().toLowerCase();
  if (/speaker|話者|発言者|人物|name/.test(h)) return 'speaker';
  if (/timestamp|time|時刻|時間/.test(h)) return 'timestamp';
  if (/text|utterance|transcript|body|発言|本文|テキスト|内容|セグメント|segment/.test(h)) return 'text';
  return 'ignore';
}

type RoleLabels = Record<string, string>;
function labelsFor(mode: Mode): RoleLabels {
  switch (mode) {
    case 'box': return FIELD_LABELS;
    case 'line': return LINE_FIELD_LABELS;
    case 'sdsg': return SDSG_FIELD_LABELS;
    case 'period': return PERIOD_LABEL_FIELD_LABELS;
    case 'transcript': return TRANSCRIPT_ROLE_LABELS;
    case 'maxqda': return MAXQDA_ROLE_LABELS;
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

  const rows = file?.sheets[sheetIdx]?.rows ?? [];
  const header = useMemo(() => (hasHeader && rows.length > 0 ? rows[0] : rows[0]?.map((_, i) => `列${i + 1}`) ?? []), [rows, hasHeader]);
  const preview = useMemo(() => rows.slice(0, 6), [rows]);

  const recomputeMapping = (m: Mode, hdr: string[], useHeader: boolean) => {
    setMapping(hdr.map((h, i) => (useHeader ? guessFor(m, h) : (m === 'box' && i === 0 ? 'label' : 'ignore'))));
  };

  const reset = () => {
    setStep(1); setFile(null); setSheetIdx(0); setMapping([]); setError(null); setPlans({});
  };

  const handleFile = async (f: File) => {
    setError(null);
    try {
      const parsed = await parseTabularFile(f);
      if (parsed.sheets.length === 0 || parsed.sheets.every((s) => s.rows.length === 0)) {
        setError('読める行がありませんでした');
        return;
      }
      const firstNonEmpty = parsed.sheets.findIndex((s) => s.rows.length > 0);
      const r = parsed.sheets[firstNonEmpty].rows;
      const hdr = looksLikeHeader(r);
      const m = hdr ? guessMode(r[0]) : 'box';
      setFile(parsed); setSheetIdx(firstNonEmpty); setHasHeader(hdr); setMode(m);
      recomputeMapping(m, hdr ? r[0] : r[0].map((_, i) => `列${i + 1}`), hdr);
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
    alert(warnings.length > 0 ? `${msg}\n\n警告 ${warnings.length} 件:\n${warnings.join('\n')}` : msg);
    reset();
    onClose();
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
        if (result.boxes.length === 0) { setError('Box を作れませんでした。「ラベル」を割り当てた列はありますか？'); return; }
        const doImport = () => importBoxes(result.boxes, result.lines);
        if (toNewSheet) { const id = addSheet(file.filename.replace(/\.[^.]+$/, '')); setActiveSheet(id); setTimeout(doImport, 0); }
        else doImport();
        finish(`${result.boxes.length} 件の Box、${result.lines.length} 件の Line を取り込みました`, result.errors);
        return;
      }
      if (mode === 'line') {
        const result = buildLinesFromRows(rows, {
          mapping: mapping as LineCsvFieldKind[], hasHeader, defaultType: 'RLine', defaultShape: 'straight',
          existingIds: existingLineIds, validBoxIds: existingBoxIds,
        });
        if (result.lines.length === 0) { setError('Line を作れませんでした。from / to の列と、存在する Box ID を確認してください'); return; }
        importLines(result.lines);
        finish(`${result.lines.length} 件の Line を取り込みました`, result.errors);
        return;
      }
      if (mode === 'sdsg') {
        const result = buildSDSGsFromRows(rows, {
          mapping: mapping as SDSGCsvFieldKind[], hasHeader,
          existingIds: existingSdsgIds, validBoxIds: existingBoxIds, validLineIds: existingLineIds,
        });
        if (result.sdsgs.length === 0) { setError('SD/SG を作れませんでした。紐付け先の Box ID を確認してください'); return; }
        importSDSGs(result.sdsgs);
        finish(`${result.sdsgs.length} 件の SD/SG を取り込みました`, result.errors);
        return;
      }
      if (mode === 'period') {
        const result = buildPeriodLabelsFromRows(rows, {
          mapping: mapping as PeriodLabelCsvFieldKind[], hasHeader,
          existingIds: new Set(sheet?.periodLabels.map((p) => p.id) ?? []),
        });
        if (result.periodLabels.length === 0) { setError('時期ラベルを作れませんでした。位置とラベルの列を確認してください'); return; }
        importPeriodLabels(result.periodLabels);
        finish(`${result.periodLabels.length} 件の時期ラベルを取り込みました`, result.errors);
        return;
      }
      if (mode === 'transcript') {
        const textColumn = mapping.indexOf('text');
        if (textColumn < 0) { setError('「本文」の列を割り当ててください'); return; }
        const speakerColumn = mapping.indexOf('speaker');
        const timestampColumn = mapping.indexOf('timestamp');
        const data = hasHeader ? rows.slice(1) : rows;
        const paragraphs = buildParagraphsFromRows(data, {
          textColumn,
          speakerColumn: speakerColumn >= 0 ? speakerColumn : undefined,
          timestampColumn: timestampColumn >= 0 ? timestampColumn : undefined,
        });
        if (paragraphs.length === 0) { setError('段落を作れませんでした（本文が空）'); return; }
        const t: Transcript = {
          id: genTranscriptId(), title: transcriptTitle || file.filename,
          source: file.format, importedAt: new Date().toISOString(), paragraphs,
        };
        addTranscript(t);
        finish(`逐語録「${t.title}」（${paragraphs.length} 段落）を取り込みました`, []);
        return;
      }
      if (mode === 'maxqda' && maxqda) {
        const result = buildFromSegments(maxqda.dedupe, {
          plans: effectivePlans,
          levelPx: LEVEL_PX,
          defaultWidth: doc.settings.defaultBoxSize.width, defaultHeight: doc.settings.defaultBoxSize.height,
          stackDocuments: stackDocs,
          existingBoxIds: toNewSheet ? new Set() : existingBoxIds,
          existingSdsgIds: toNewSheet ? new Set() : existingSdsgIds,
        });
        const apply = () => {
          result.transcripts.forEach((t) => addTranscript(t));
          if (result.boxes.length > 0) importBoxes(result.boxes, []);
          if (result.sdsg.length > 0) importSDSGs(result.sdsg);
          if (result.periodLabels.length > 0) importPeriodLabels(result.periodLabels);
          result.sourceRefs.forEach((r) => addSourceRef(r.target, r.ref));
        };
        if (toNewSheet) { const id = addSheet(file.filename.replace(/\.[^.]+$/, '')); setActiveSheet(id); setTimeout(apply, 0); }
        else apply();
        finish(
          `逐語録 ${result.transcripts.length} 本（${maxqda.dedupe.segments.length} 段落）、Box ${result.boxes.length}、SD/SG ${result.sdsg.length}、時期ラベル ${result.periodLabels.length} を取り込みました`,
          result.warnings,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!open) return null;

  const roleLabels = labelsFor(mode);
  const requiredHint: Record<Mode, string> = {
    box: '必須: ラベル', line: '必須: from / to', sdsg: '必須: 紐付け先', period: '必須: 位置・ラベル',
    transcript: '必須: 本文', maxqda: '必須: 文書名・コード・セグメント本文（開始・終了があると集約が正確）',
  };
  const canNext2 = file !== null;
  const canRun = mode === 'maxqda' ? !!maxqda && maxqda.dedupe.segments.length > 0 : mapping.some((m) => m !== 'ignore');
  const lastStep = mode === 'maxqda' ? 4 : 3;

  return (
    <div className="modal-backdrop" onClick={() => { reset(); onClose(); }} style={{ zIndex: 1250 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 860, maxWidth: '95vw' }}>
        <div className="modal-header">
          <h3>表から取り込み（{step} / {lastStep}）</h3>
          <button className="modal-close" onClick={() => { reset(); onClose(); }}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          {error && <p style={{ color: '#c0392b', whiteSpace: 'pre-wrap' }}>{error}</p>}

          {/* ---------------- 1. ファイル ---------------- */}
          {step === 1 && (
            <section className="settings-section">
              <h4>1. ファイルを選ぶ</h4>
              <p className="hint">CSV / TSV / Excel（.xlsx / .xls）。Excel は最初の非空シートを読み、あとで切り替えられます。</p>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed #b0b8c8', borderRadius: 6, padding: 28, textAlign: 'center', cursor: 'pointer', background: '#fafcff' }}
              >
                ここにファイルをドロップ、またはクリックして選択
                <input ref={fileInputRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,.xlsm" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ''; }} />
              </div>
            </section>
          )}

          {/* ---------------- 2. 取り込み先とシート ---------------- */}
          {step === 2 && file && (
            <section className="settings-section">
              <h4>2. 取り込み先を選ぶ</h4>
              <p className="hint">{file.filename}（{rows.length} 行）。列名から「{MODE_LABELS[mode].label}」と推測しました。違えば変えてください。</p>
              {file.sheets.length > 1 && (
                <div className="setting-row">
                  <label>シート</label>
                  <select value={sheetIdx} onChange={(e) => { const i = Number(e.target.value); setSheetIdx(i); const r = file.sheets[i].rows; const h = looksLikeHeader(r); setHasHeader(h); recomputeMapping(mode, h ? r[0] : r[0].map((_, k) => `列${k + 1}`), h); }}>
                    {file.sheets.map((s, i) => <option key={s.name} value={i}>{s.name}（{s.rows.length} 行）</option>)}
                  </select>
                </div>
              )}
              <div className="setting-row">
                <label>1 行目は見出し</label>
                <input type="checkbox" checked={hasHeader} onChange={(e) => { setHasHeader(e.target.checked); recomputeMapping(mode, e.target.checked ? rows[0] : rows[0].map((_, k) => `列${k + 1}`), e.target.checked); }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                  <label key={m} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, border: `1px solid ${mode === m ? '#2684ff' : '#ddd'}`, borderRadius: 6, background: mode === m ? '#eef5ff' : '#fff', cursor: 'pointer', fontWeight: 'normal' }}>
                    <input type="radio" name="import-mode" checked={mode === m} onChange={() => { setMode(m); recomputeMapping(m, header, hasHeader); }} />
                    <span><strong>{MODE_LABELS[m].label}</strong><br /><span style={{ fontSize: '0.85em', color: '#666' }}>{MODE_LABELS[m].desc}</span></span>
                  </label>
                ))}
              </div>
              <h5 style={{ margin: '14px 0 4px' }}>プレビュー（先頭 {preview.length} 行）</h5>
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
              <h4>3. 列の役割を決める</h4>
              <p className="hint">{requiredHint[mode]}。見出しから推測した値が入っています。</p>
              <table className="data-table" style={{ fontSize: '0.88em' }}>
                <thead><tr><th style={{ width: 40 }}>#</th><th>列（見出し）</th><th>例</th><th style={{ width: 220 }}>役割</th></tr></thead>
                <tbody>
                  {header.map((h, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{h}</td>
                      <td style={{ color: '#666', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(hasHeader ? rows[1] : rows[0])?.[i] ?? ''}</td>
                      <td>
                        <select value={mapping[i] ?? 'ignore'} onChange={(e) => setMapping((prev) => { const next = [...prev]; next[i] = e.target.value; return next; })} style={{ width: '100%' }}>
                          {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {mode === 'box' && (
                <>
                  <div className="setting-row" style={{ marginTop: 10 }}>
                    <label>種別列が無いときの種別</label>
                    <select value={defaultType} onChange={(e) => setDefaultType(e.target.value as BoxType)}>
                      {SELECTABLE_BOX_TYPES.map((t) => <option key={t} value={t}>{BOX_TYPE_LABELS[t].ja}</option>)}
                    </select>
                  </div>
                  <div className="setting-row"><label>順番に矢印でつなぐ</label><input type="checkbox" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} /></div>
                  <div className="setting-row"><label>新しいシートに取り込む</label><input type="checkbox" checked={toNewSheet} onChange={(e) => setToNewSheet(e.target.checked)} /></div>
                </>
              )}
              {mode === 'transcript' && (
                <div className="setting-row" style={{ marginTop: 10 }}>
                  <label>逐語録のタイトル</label>
                  <input value={transcriptTitle} onChange={(e) => setTranscriptTitle(e.target.value)} style={{ width: 280 }} />
                </div>
              )}
              {mode === 'maxqda' && (
                <div className="setting-row" style={{ marginTop: 10 }}>
                  <label>セグメントの集約キー</label>
                  <select value={keyMode} onChange={(e) => setKeyMode(e.target.value as DedupeKeyMode)}>
                    <option value="range">文書グループ・文書名・開始・終了の完全一致（既定）</option>
                    <option value="text">文書グループ・文書名・本文の一致</option>
                  </select>
                </div>
              )}
            </section>
          )}

          {/* ---------------- 4. MAXQDA: コードの振り分け ---------------- */}
          {step === 4 && mode === 'maxqda' && maxqda && (
            <section className="settings-section">
              <h4>4. コードをどう扱うか</h4>
              <p className="hint">
                {maxqda.dedupe.docNames.length} 文書・{maxqda.dedupe.segments.length} セグメント（元 {hasHeader ? rows.length - 1 : rows.length} 行）に集約しました。
                すべてのコードは段落のタグとして残ります。Box などにするものを選んでください。
              </p>
              {maxqda.dedupe.warnings.length > 0 && (
                <p className="hint" style={{ color: '#b45309' }}>{maxqda.dedupe.warnings.join(' / ')}</p>
              )}
              <div className="setting-row"><label>文書ごとに Item 軸を分ける</label><input type="checkbox" checked={stackDocs} onChange={(e) => setStackDocs(e.target.checked)} /></div>
              <div className="setting-row"><label>新しいシートに取り込む</label><input type="checkbox" checked={toNewSheet} onChange={(e) => setToNewSheet(e.target.checked)} /></div>
              <table className="data-table" style={{ fontSize: '0.88em', marginTop: 8 }}>
                <thead><tr><th>コード</th><th style={{ width: 60 }}>件数</th><th style={{ width: 60 }}>文書</th><th style={{ width: 160 }}>扱い</th><th style={{ width: 150 }}>Box の種別</th></tr></thead>
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
                            {(Object.keys(CODE_ACTION_LABELS) as CodeAction[]).map((a) => <option key={a} value={a}>{CODE_ACTION_LABELS[a]}</option>)}
                          </select>
                        </td>
                        <td>
                          {plan.action === 'box' && (
                            <select value={plan.boxType ?? 'normal'} onChange={(e) => setPlan(c.code, { boxType: e.target.value as BoxType })} style={{ width: '100%' }}>
                              {SELECTABLE_BOX_TYPES.map((t) => <option key={t} value={t}>{BOX_TYPE_LABELS[t].ja}</option>)}
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
            {step > 1 && <button className="ribbon-btn-small" onClick={() => setStep(step - 1)}>← 戻る</button>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step === 1 && <button className="ribbon-btn-small" onClick={() => { reset(); onClose(); }}>キャンセル</button>}
            {step === 2 && <button className="ribbon-btn-primary" disabled={!canNext2} onClick={() => setStep(3)}>次へ →</button>}
            {step === 3 && mode === 'maxqda' && <button className="ribbon-btn-primary" disabled={!maxqda || maxqda.dedupe.segments.length === 0} onClick={() => setStep(4)}>次へ →</button>}
            {step === lastStep && step >= 3 && <button className="ribbon-btn-primary" disabled={!canRun} onClick={runImport}>取り込む</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
