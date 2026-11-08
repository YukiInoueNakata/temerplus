// ============================================================================
// TranscriptImportDialog - インタビュー原文の取り込み
// ステップ:
//   1. ファイル選択（.txt / .csv / .tsv / .xlsx / .xls / .docx）
//   2. csv/xlsx の場合: シート選択 + ヘッダ ON/OFF + 列マッピング
//   3. タイトル / 協力者紐付け → 取り込み実行
// ============================================================================

import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore } from '../store/store';
import {
  importTranscriptFile,
  buildTranscriptFromTabular,
  buildTranscriptFromParagraphs,
  type ImportInitialResult,
  type ColumnMapping,
} from '../utils/transcriptImport';
import { buildAnonymizationMap, anonymizeTranscript } from '../utils/anonymize';

export function TranscriptImportDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported?: (transcriptId: string) => void;
}) {
  const { t } = useTranslation('transcriptImportDialog');
  const participants = useTEMStore((s) => s.doc.participants);
  const addTranscript = useTEMStore((s) => s.addTranscript);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [initial, setInitial] = useState<ImportInitialResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // タブラ用 (csv/xlsx)
  const [sheetIndex, setSheetIndex] = useState(0);
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState<ColumnMapping>({ textColumn: 0 });

  // メタ
  const [title, setTitle] = useState('');
  const [participantId, setParticipantId] = useState<string>('');
  const [sessionNumber, setSessionNumber] = useState<string>('');   // 文字列で保持、確定時に number へ
  const [anonymizeNames, setAnonymizeNames] = useState<string>(''); // コンマ区切りの匿名化対象
  const [anonymizePrefix, setAnonymizePrefix] = useState<string>('協力者'); // i18n-ok 匿名化の仮名の既定値（逐語録のデータに入る）

  const reset = () => {
    setInitial(null);
    setError(null);
    setBusy(false);
    setSheetIndex(0);
    setHasHeader(true);
    setMapping({ textColumn: 0 });
    setTitle('');
    setSessionNumber('');
    setAnonymizeNames('');
    setParticipantId('');
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const result = await importTranscriptFile(file);
      setInitial(result);
      // 初期タイトルはファイル名（拡張子除く）
      const base = file.name.replace(/\.[^.]+$/, '');
      setTitle(base);
      // タブラの場合は推測マッピングを反映
      if (result.tabular && result.tabular.sheets.length > 0) {
        const sh = result.tabular.sheets[0];
        setSheetIndex(0);
        setHasHeader(sh.hasHeader);
        setMapping(sh.suggestedMapping);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onSheetChange = (idx: number) => {
    setSheetIndex(idx);
    if (initial?.tabular) {
      const sh = initial.tabular.sheets[idx];
      setHasHeader(sh.hasHeader);
      setMapping(sh.suggestedMapping);
    }
  };

  const currentSheet = useMemo(() => {
    if (!initial?.tabular) return null;
    return initial.tabular.sheets[sheetIndex] ?? null;
  }, [initial, sheetIndex]);

  // プレビュー (タブラ): 列マッピング適用後の先頭 5 段落
  const tabularPreview = useMemo(() => {
    if (!currentSheet) return [];
    const dataRows = hasHeader ? currentSheet.rows.slice(1) : currentSheet.rows;
    return dataRows.slice(0, 5).map((row, i) => ({
      index: i + 1,
      speaker: mapping.speakerColumn !== undefined ? (row[mapping.speakerColumn] ?? '') : '',
      timestamp: mapping.timestampColumn !== undefined ? (row[mapping.timestampColumn] ?? '') : '',
      text: (row[mapping.textColumn] ?? '').slice(0, 120),
    }));
  }, [currentSheet, hasHeader, mapping]);

  // プレビュー (パラグラフ型): 先頭 5
  const paragraphsPreview = initial?.paragraphs?.slice(0, 5) ?? [];

  const doImport = () => {
    if (!initial) return;
    try {
      const sn = sessionNumber.trim() === '' ? undefined : Math.max(1, Math.floor(Number(sessionNumber)));
      let transcript;
      if (initial.tabular) {
        transcript = buildTranscriptFromTabular({
          initialResult: initial,
          sheetIndex,
          hasHeader,
          mapping,
          title: title.trim() || initial.filename,
          participantId: participantId || undefined,
          sessionNumber: sn,
        });
      } else if (initial.paragraphs) {
        transcript = buildTranscriptFromParagraphs({
          initialResult: initial,
          title: title.trim() || initial.filename,
          participantId: participantId || undefined,
          sessionNumber: sn,
        });
      } else {
        throw new Error(t('error.empty'));
      }
      if (transcript.paragraphs.length === 0) {
        throw new Error(t('error.zeroParagraphs'));
      }
      // 取り込み時匿名化
      if (anonymizeNames.trim()) {
        const map = buildAnonymizationMap(anonymizeNames, anonymizePrefix.trim() || '協力者'); // i18n-ok 匿名化の仮名の既定値（データ）
        transcript = anonymizeTranscript(transcript, map);
      }
      const id = addTranscript(transcript);
      onImported?.(id);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!open) return null;
  const prefixShown = anonymizePrefix || '協力者'; // i18n-ok 匿名化の仮名の既定値（データ）

  return (
    <div className="modal-backdrop" onClick={() => { reset(); onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 720, maxHeight: '85vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h3>{t('title')}</h3>
          <button onClick={() => { reset(); onClose(); }} className="modal-close">×</button>
        </div>

        <div className="modal-body" style={{ minHeight: 320 }}>
          {/* === Step 1: ファイル選択 === */}
          {!initial && (
            <section className="settings-section">
              <h4>{t('step1.heading')}</h4>
              <p className="hint">{t('step1.formats')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.tsv,.xlsx,.xls,.docx"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await handleFile(f);
                }}
                disabled={busy}
              />
              {busy && <p className="hint">{t('loading')}</p>}
            </section>
          )}

          {/* === Step 2: タブラ (csv/xlsx) の場合は列マッピング === */}
          {initial?.tabular && (
            <section className="settings-section">
              <h4>{t('step2.heading')}</h4>
              {initial.tabular.sheets.length > 1 && (
                <div className="setting-row">
                  <label>{t('step2.sheet')}</label>
                  <select value={sheetIndex} onChange={(e) => onSheetChange(Number(e.target.value))}>
                    {initial.tabular.sheets.map((s, i) => (
                      <option key={i} value={i}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="setting-row">
                <label>{t('step2.hasHeader')}</label>
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                />
              </div>
              {currentSheet && (
                <ColumnMappingEditor
                  rows={currentSheet.rows}
                  hasHeader={hasHeader}
                  mapping={mapping}
                  onChange={setMapping}
                />
              )}
              {tabularPreview.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('step2.previewRows')}</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={th}>#</th>
                        <th style={th}>{t('col.speaker')}</th>
                        <th style={th}>{t('col.time')}</th>
                        <th style={th}>{t('col.text')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabularPreview.map((p) => (
                        <tr key={p.index}>
                          <td style={td}>{p.index}</td>
                          <td style={td}>{p.speaker}</td>
                          <td style={td}>{p.timestamp}</td>
                          <td style={td}>{p.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* === Step 2 alt: パラグラフ型 (txt/docx) のプレビュー === */}
          {initial?.paragraphs && (
            <section className="settings-section">
              <h4>{t('step2.previewParagraphs')}</h4>
              <ul style={{ fontSize: 12, paddingLeft: 16 }}>
                {paragraphsPreview.map((p) => (
                  <li key={p.id} style={{ marginBottom: 4 }}>
                    {p.speaker && <strong>[{p.speaker}] </strong>}
                    {p.text.slice(0, 120)}{p.text.length > 120 ? '...' : ''}
                  </li>
                ))}
              </ul>
              <p className="hint">{t('step2.totalParagraphs', { count: initial.paragraphs.length })}</p>
            </section>
          )}

          {/* === Step 3: メタ === */}
          {initial && (
            <section className="settings-section">
              <h4>{t('step3.heading')}</h4>
              <div className="setting-row">
                <label>{t('step3.title')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: 320 }}
                  placeholder={t('step3.titlePlaceholder')}
                />
              </div>
              <div className="setting-row">
                <label>{t('step3.participant')}</label>
                <select value={participantId} onChange={(e) => setParticipantId(e.target.value)}>
                  <option value="">{t('step3.participantNone')}</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>{p.pseudonym ?? p.id}</option>
                  ))}
                </select>
              </div>
              <div className="setting-row">
                <label>{t('step3.session')}</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={sessionNumber}
                  onChange={(e) => setSessionNumber(e.target.value)}
                  placeholder={t('step3.sessionPlaceholder')}
                  style={{ width: 120 }}
                />
                <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                  {t('step3.sessionHint')}
                </span>
              </div>
              <div className="setting-row" style={{ alignItems: 'flex-start' }}>
                <label>{t('step3.anonymize')}</label>
                <div style={{ flex: 1 }}>
                  <textarea
                    value={anonymizeNames}
                    onChange={(e) => setAnonymizeNames(e.target.value)}
                    placeholder={t('step3.anonymizePlaceholder')}
                    style={{ width: '100%', minHeight: 50, fontSize: 12, fontFamily: 'inherit', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <label style={{ fontSize: 11, color: '#666' }}>{t('step3.prefix')}</label>
                    <input
                      type="text"
                      value={anonymizePrefix}
                      onChange={(e) => setAnonymizePrefix(e.target.value)}
                      style={{ width: 100, fontSize: 12 }}
                      placeholder="協力者" // i18n-ok 匿名化の仮名の既定値（データ）
                    />
                    <span style={{ fontSize: 11, color: '#666' }}>
                      → [{prefixShown}A], [{prefixShown}B], ...
                    </span>
                  </div>
                  <p className="hint" style={{ marginTop: 4 }}>
                    {t('step3.anonymizeHint')}
                  </p>
                </div>
              </div>
            </section>
          )}

          {error && (
            <p style={{ color: '#c0392b', marginTop: 8, whiteSpace: 'pre-wrap' }}>{error}</p>
          )}
        </div>

        <div className="modal-footer">
          {initial && (
            <button className="ribbon-btn-small" onClick={reset} disabled={busy}>{t('chooseAgain')}</button>
          )}
          <button
            className="ribbon-btn-primary"
            onClick={doImport}
            disabled={!initial || busy}
          >
            {t('import')}
          </button>
          <button className="ribbon-btn-small" onClick={() => { reset(); onClose(); }} disabled={busy}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  borderBottom: '1px solid #ccc',
  textAlign: 'left',
  padding: '4px 6px',
  background: '#f5f5f5',
};
const td: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '4px 6px',
  verticalAlign: 'top',
};

// ----------------------------------------------------------------------------
// 列マッピング編集
// ----------------------------------------------------------------------------

function ColumnMappingEditor({
  rows,
  hasHeader,
  mapping,
  onChange,
}: {
  rows: string[][];
  hasHeader: boolean;
  mapping: ColumnMapping;
  onChange: (m: ColumnMapping) => void;
}) {
  const { t } = useTranslation('transcriptImportDialog');
  const colCount = rows.length > 0 ? Math.max(...rows.map((r) => r.length)) : 0;
  const header = hasHeader && rows.length > 0 ? rows[0] : null;
  const cols = Array.from({ length: colCount }, (_, i) => ({
    index: i,
    name: header ? (header[i] ?? t('column', { n: i + 1 })) : t('column', { n: i + 1 }),
  }));

  return (
    <>
      <div className="setting-row">
        <label>{t('map.text')}</label>
        <select
          value={mapping.textColumn}
          onChange={(e) => onChange({ ...mapping, textColumn: Number(e.target.value) })}
        >
          {cols.map((c) => (
            <option key={c.index} value={c.index}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="setting-row">
        <label>{t('map.speaker')}</label>
        <select
          value={mapping.speakerColumn ?? -1}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({ ...mapping, speakerColumn: v < 0 ? undefined : v });
          }}
        >
          <option value={-1}>{t('map.none')}</option>
          {cols.map((c) => (
            <option key={c.index} value={c.index}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="setting-row">
        <label>{t('map.timestamp')}</label>
        <select
          value={mapping.timestampColumn ?? -1}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({ ...mapping, timestampColumn: v < 0 ? undefined : v });
          }}
        >
          <option value={-1}>{t('map.none')}</option>
          {cols.map((c) => (
            <option key={c.index} value={c.index}>{c.name}</option>
          ))}
        </select>
      </div>
    </>
  );
}
