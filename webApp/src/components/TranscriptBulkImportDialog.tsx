// ============================================================================
// TranscriptBulkImportDialog
//
// 複数ファイル選択 (またはフォルダ選択) で大量の原文をまとめて取り込む。
// ファイル名から協力者 + セッション番号を自動推測し、ユーザが確認/編集後に
// 一括取り込み。新規協力者は自動で Participant に追加可能。
//
// 注意:
//   - csv/xlsx は列マッピングが必要なため、ここでは「先頭行をヘッダ扱い・
//     最長平均列を text とする」既定推測のまま取り込む (単体ダイアログで
//     カスタマイズしたい場合は通常の取り込みを使う)
//   - パース失敗ファイルはエラーとして表示するが他のファイルは取り込み続行
// ============================================================================

import { useMemo, useRef, useState } from 'react';
import { useTEMStore } from '../store/store';
import { produce } from 'immer';
import {
  importTranscriptFile,
  buildTranscriptFromParagraphs,
  buildTranscriptFromTabular,
  type ImportInitialResult,
} from '../utils/transcriptImport';
import { parseFilenameHints, stripExtension } from '../utils/transcriptImport/filenameParser';
import { buildAnonymizationMap, anonymizeTranscript } from '../utils/anonymize';
import { genParticipantId } from '../store/defaults';

interface FileRow {
  file: File;
  filenameNoExt: string;
  initial?: ImportInitialResult;
  parseError?: string;
  participantHint?: string;          // 解析推測 (raw、新規 or 既存に解決前)
  sessionHint?: number;
  // ユーザ編集後の確定値
  participantId: string | null;       // null = 未割当、空文字列を新規候補に
  newParticipantName: string;          // participantId === null && この値があれば新規作成
  sessionNumber: string;               // 入力 (空欄=未指定)
  title: string;
  enabled: boolean;
}

export function TranscriptBulkImportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const participants = useTEMStore((s) => s.doc.participants);
  const addTranscript = useTEMStore((s) => s.addTranscript);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<FileRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [globalAnonymize, setGlobalAnonymize] = useState('');
  const [anonymizePrefix, setAnonymizePrefix] = useState('協力者');

  const reset = () => {
    setRows([]);
    setBusy(false);
    setProgress(null);
    setErrors([]);
    setGlobalAnonymize('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // 既存 participant pseudonym から id をルックアップする util
  const findParticipantByPseudonym = (name: string): string | null => {
    const found = participants.find(
      (p) => (p.pseudonym ?? '').trim().toLowerCase() === name.trim().toLowerCase(),
    );
    return found?.id ?? null;
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setBusy(true);
    setErrors([]);
    const arr = Array.from(fileList);
    const next: FileRow[] = [];
    for (const f of arr) {
      const filenameNoExt = stripExtension(f.name);
      const hints = parseFilenameHints(filenameNoExt);
      // 推測した participant hint を既存 participant にマップ
      let participantId: string | null = null;
      let newParticipantName = '';
      if (hints.participantHint) {
        const existing = findParticipantByPseudonym(hints.participantHint);
        if (existing) participantId = existing;
        else newParticipantName = hints.participantHint;
      }
      const titleParts: string[] = [];
      if (hints.participantHint) titleParts.push(hints.participantHint);
      if (hints.sessionHint !== undefined) titleParts.push(`第${hints.sessionHint}回`);
      const title = titleParts.length > 0 ? titleParts.join(' ') : filenameNoExt;

      let initial: ImportInitialResult | undefined;
      let parseError: string | undefined;
      try {
        initial = await importTranscriptFile(f);
      } catch (e) {
        parseError = e instanceof Error ? e.message : String(e);
      }

      next.push({
        file: f,
        filenameNoExt,
        initial,
        parseError,
        participantHint: hints.participantHint,
        sessionHint: hints.sessionHint,
        participantId,
        newParticipantName,
        sessionNumber: hints.sessionHint !== undefined ? String(hints.sessionHint) : '',
        title,
        enabled: !parseError,
      });
    }
    // 安定ソート: participant → session
    next.sort((a, b) => {
      const pa = a.participantHint ?? 'zzz';
      const pb = b.participantHint ?? 'zzz';
      if (pa !== pb) return pa.localeCompare(pb);
      const sa = a.sessionHint ?? Number.POSITIVE_INFINITY;
      const sb = b.sessionHint ?? Number.POSITIVE_INFINITY;
      return sa - sb;
    });
    setRows(next);
    setBusy(false);
  };

  const updateRow = (idx: number, patch: Partial<FileRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const doImport = async () => {
    setBusy(true);
    const errs: string[] = [];
    let done = 0;
    const enabledRows = rows.filter((r) => r.enabled && r.initial);
    setProgress({ done: 0, total: enabledRows.length });

    // 取り込み前: 新規 participants を一括追加 (重複名はスキップ、既存にマップ)
    // 同セッション内で同じ name が複数行に出る場合も 1 人として扱う
    const nameToId = new Map<string, string>();   // pseudonym(lower) -> id
    for (const p of participants) {
      if (p.pseudonym) nameToId.set(p.pseudonym.trim().toLowerCase(), p.id);
    }
    const newParticipants: Array<{ id: string; pseudonym: string }> = [];
    for (const r of enabledRows) {
      if (r.participantId) continue;
      const name = r.newParticipantName.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (nameToId.has(key)) continue;
      const newId = genParticipantId();
      nameToId.set(key, newId);
      newParticipants.push({ id: newId, pseudonym: name });
    }
    if (newParticipants.length > 0) {
      useTEMStore.setState((state) => ({
        doc: produce(state.doc, (d) => {
          d.participants.push(...newParticipants);
        }),
        dirty: true,
      }));
    }

    // 各 Transcript を追加
    const anonMap = globalAnonymize.trim()
      ? buildAnonymizationMap(globalAnonymize, anonymizePrefix.trim() || '協力者')
      : null;

    for (const r of enabledRows) {
      try {
        // participantId を解決
        let pid = r.participantId;
        if (!pid && r.newParticipantName.trim()) {
          pid = nameToId.get(r.newParticipantName.trim().toLowerCase()) ?? null;
        }
        const sn = r.sessionNumber.trim() === '' ? undefined : Math.max(1, Math.floor(Number(r.sessionNumber)));
        let transcript;
        if (!r.initial) {
          errs.push(`${r.file.name}: パース失敗`);
          done++;
          setProgress({ done, total: enabledRows.length });
          continue;
        }
        if (r.initial.tabular) {
          // 列マッピングは推測のみ (先頭シート + 自動推測 + ヘッダあり推測)
          const sheet = r.initial.tabular.sheets[0];
          transcript = buildTranscriptFromTabular({
            initialResult: r.initial,
            sheetIndex: 0,
            hasHeader: sheet.hasHeader,
            mapping: sheet.suggestedMapping,
            title: r.title.trim() || r.filenameNoExt,
            participantId: pid ?? undefined,
            sessionNumber: sn,
          });
        } else if (r.initial.paragraphs) {
          transcript = buildTranscriptFromParagraphs({
            initialResult: r.initial,
            title: r.title.trim() || r.filenameNoExt,
            participantId: pid ?? undefined,
            sessionNumber: sn,
          });
        } else {
          errs.push(`${r.file.name}: 段落が抽出できませんでした`);
          done++;
          setProgress({ done, total: enabledRows.length });
          continue;
        }
        if (transcript.paragraphs.length === 0) {
          errs.push(`${r.file.name}: 段落が 0 件 (列推測が外れている可能性があります)`);
          done++;
          setProgress({ done, total: enabledRows.length });
          continue;
        }
        if (anonMap) {
          transcript = anonymizeTranscript(transcript, anonMap);
        }
        addTranscript(transcript);
        done++;
        setProgress({ done, total: enabledRows.length });
      } catch (e) {
        errs.push(`${r.file.name}: ${e instanceof Error ? e.message : String(e)}`);
        done++;
        setProgress({ done, total: enabledRows.length });
      }
    }

    setErrors(errs);
    setBusy(false);
    if (errs.length === 0) {
      // 全成功なら閉じる
      reset();
      onClose();
    }
  };

  const enabledCount = useMemo(() => rows.filter((r) => r.enabled).length, [rows]);
  const hasParseErrors = rows.some((r) => r.parseError);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={() => { reset(); onClose(); }} style={{ zIndex: 1050 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 900, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3>原文を一括取り込み</h3>
          <button onClick={() => { reset(); onClose(); }} className="modal-close">×</button>
        </div>
        <div className="modal-body" style={{ flex: 1, overflow: 'auto' }}>
          <section className="settings-section">
            <h4>1. ファイル選択 (複数ファイル or フォルダ)</h4>
            <p className="hint" style={{ marginTop: 0 }}>
              対応形式: .txt / .md / .csv / .tsv / .xlsx / .xls / .docx<br />
              ファイル名から協力者・回数を自動推測します (例: <code>A_第1回.docx</code>, <code>Yamada_v3.txt</code>, <code>interview_C_3.csv</code>)。
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".txt,.md,.csv,.tsv,.xlsx,.xls,.docx"
              multiple
              // @ts-expect-error - webkitdirectory は React の型に含まれない
              webkitdirectory=""
              directory=""
              onChange={async (e) => { await handleFiles(e.target.files); }}
              disabled={busy}
            />
            <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
              ※ フォルダ選択 (上の input) / または以下から複数ファイル選択:
            </span>
            <br />
            <input
              type="file"
              accept=".txt,.md,.csv,.tsv,.xlsx,.xls,.docx"
              multiple
              onChange={async (e) => { await handleFiles(e.target.files); }}
              disabled={busy}
              style={{ marginTop: 4 }}
            />
          </section>

          {rows.length > 0 && (
            <>
              <section className="settings-section">
                <h4>2. 取り込み内容を確認 ({enabledCount} / {rows.length} 件選択)</h4>
                {hasParseErrors && (
                  <p style={{ color: '#c0392b', fontSize: 12 }}>
                    ⚠ いくつかのファイルでパースに失敗しています (灰色行)。チェックを外すと除外できます。
                  </p>
                )}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={th}></th>
                        <th style={th}>ファイル名</th>
                        <th style={th}>協力者</th>
                        <th style={th}>第N回</th>
                        <th style={th}>タイトル</th>
                        <th style={th}>備考</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={r.file.name + i} style={{ background: r.parseError ? '#fff5f5' : 'transparent', opacity: r.enabled ? 1 : 0.5 }}>
                          <td style={td}>
                            <input
                              type="checkbox"
                              checked={r.enabled}
                              onChange={(e) => updateRow(i, { enabled: e.target.checked })}
                              disabled={!!r.parseError}
                            />
                          </td>
                          <td style={td}>
                            <div style={{ fontWeight: 600 }}>{r.file.name}</div>
                            {r.initial?.paragraphs && (
                              <div style={{ color: '#666', fontSize: 11 }}>{r.initial.paragraphs.length} 段落 / {r.initial.format}</div>
                            )}
                            {r.initial?.tabular && (
                              <div style={{ color: '#666', fontSize: 11 }}>
                                {r.initial.tabular.sheets[0].rows.length} 行 / {r.initial.format} (列マッピングは推測値)
                              </div>
                            )}
                          </td>
                          <td style={td}>
                            <select
                              value={r.participantId ?? '__new__'}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === '__new__') {
                                  updateRow(i, { participantId: null });
                                } else if (v === '__none__') {
                                  updateRow(i, { participantId: null, newParticipantName: '' });
                                } else {
                                  updateRow(i, { participantId: v });
                                }
                              }}
                              style={{ width: 120, fontSize: 11 }}
                            >
                              <option value="__new__">新規作成</option>
                              <option value="__none__">未割当</option>
                              {participants.map((p) => (
                                <option key={p.id} value={p.id}>{p.pseudonym ?? p.id}</option>
                              ))}
                            </select>
                            {r.participantId === null && (
                              <input
                                type="text"
                                value={r.newParticipantName}
                                onChange={(e) => updateRow(i, { newParticipantName: e.target.value })}
                                placeholder="新規名"
                                style={{ width: 100, fontSize: 11, marginTop: 2, display: 'block' }}
                              />
                            )}
                          </td>
                          <td style={td}>
                            <input
                              type="number"
                              min={1}
                              value={r.sessionNumber}
                              onChange={(e) => updateRow(i, { sessionNumber: e.target.value })}
                              style={{ width: 50, fontSize: 11 }}
                            />
                          </td>
                          <td style={td}>
                            <input
                              type="text"
                              value={r.title}
                              onChange={(e) => updateRow(i, { title: e.target.value })}
                              style={{ width: 200, fontSize: 11 }}
                            />
                          </td>
                          <td style={td}>
                            {r.parseError && (
                              <span style={{ color: '#c0392b', fontSize: 11 }} title={r.parseError}>
                                ⚠ {r.parseError.slice(0, 50)}
                              </span>
                            )}
                            {!r.parseError && r.participantHint && (
                              <span style={{ color: '#888', fontSize: 11 }}>
                                推測: {r.participantHint}{r.sessionHint !== undefined ? ` / 第${r.sessionHint}回` : ''}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="settings-section">
                <h4>3. 一括匿名化 (任意)</h4>
                <div className="setting-row" style={{ alignItems: 'flex-start' }}>
                  <label>氏名・組織名</label>
                  <textarea
                    value={globalAnonymize}
                    onChange={(e) => setGlobalAnonymize(e.target.value)}
                    placeholder="コンマ区切り (例: 山田太郎, X 大学, 田中)"
                    style={{ flex: 1, minHeight: 50, fontSize: 12, fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
                <div className="setting-row">
                  <label>仮名 prefix</label>
                  <input
                    type="text"
                    value={anonymizePrefix}
                    onChange={(e) => setAnonymizePrefix(e.target.value)}
                    style={{ width: 100 }}
                  />
                </div>
                <p className="hint">
                  全ファイル共通で適用します。各 Transcript の metadata.anonymizationMap に記録されます。
                </p>
              </section>
            </>
          )}

          {progress && (
            <p style={{ fontSize: 12, color: '#1e6091' }}>
              取り込み中... {progress.done} / {progress.total}
            </p>
          )}
          {errors.length > 0 && (
            <div style={{ marginTop: 12, padding: 8, background: '#fef3c7', borderLeft: '3px solid #f59e0b', fontSize: 12 }}>
              <strong>取り込み完了 (一部エラー):</strong>
              <ul style={{ paddingLeft: 16, margin: '4px 0' }}>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="ribbon-btn-small" onClick={() => { reset(); onClose(); }} disabled={busy}>
            {errors.length > 0 ? '閉じる' : 'キャンセル'}
          </button>
          <button
            className="ribbon-btn-primary"
            disabled={busy || enabledCount === 0}
            onClick={doImport}
          >
            {busy ? '取り込み中...' : `${enabledCount} 件を一括取り込み`}
          </button>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  borderBottom: '1px solid #ccc',
  textAlign: 'left',
  padding: '4px 6px',
  fontSize: 12,
};
const td: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '4px 6px',
  verticalAlign: 'top',
};
