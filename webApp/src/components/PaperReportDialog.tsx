// ============================================================================
// PaperReportDialog - 論文用レポート出力ダイアログ
// 記号体系 / 協力者情報 / インタビュー / 表記方針 / 備考 を編集し、
// docx として出力する。出力の前に確認画面を出す（論文 04_report_format.md 4 節）:
// 入力状況（済／未／一部）、図にあるメモ・記号・コメントを載せるか（毎回未選択から）、未入力の扱い
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { useTEMStore } from '../store/store';
import {
  CONVENTION_MEANINGS,
  CONVENTION_MEANING_LABELS,
  VISUAL_CONVENTION_ITEMS,
  resolveConventionMeaning,
  setConventionMeaning,
  type VisualConventionKey,
} from '../utils/visualConventions';
import { produce } from 'immer';
import {
  computeReportStatus,
  missingReportChoices,
  reportContentCounts,
  usedSymbols,
  REPORT_STATE_LABEL,
  type ReportContentChoices,
  type ReportItemState,
  type ReportTab,
} from '../utils/reportStatus';
import type {
  NotationSystem,
  ParticipantsInfo,
  InterviewInfo,
  VisualConventions,
  VisualConventionEntry,
} from '../types';

type Tab = ReportTab;

const TABS: { key: Tab; label: string }[] = [
  { key: 'general', label: '概要' },
  { key: 'notation', label: '記号体系' },
  { key: 'participants', label: '協力者' },
  { key: 'interview', label: 'インタビュー' },
  { key: 'visual', label: '表記方針' },
  { key: 'export', label: '出力' },
];

export function PaperReportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('general');
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, dlgX: 0, dlgY: 0 });
  const [busy, setBusy] = useState(false);
  const [includeDiagram, setIncludeDiagram] = useState(true);
  const [includeSourceRefs, setIncludeSourceRefs] = useState(true);
  const [sourceRefStyle, setSourceRefStyle] = useState<'bracket' | 'apa'>('bracket');
  // 出力前の確認画面
  const [confirming, setConfirming] = useState(false);
  const [omitMissing, setOmitMissing] = useState(true);
  const [content, setContent] = useState<ReportContentChoices>({});
  const doc = useTEMStore((s) => s.doc);

  // 開くたびに確認画面を閉じ、メモ・記号・コメントの選択と未入力の扱いを最初に戻す
  // （以前は確認画面のまま閉じて開き直すと前回の選択が残り、そのまま出力できた。レビュー #2）
  useEffect(() => {
    if (!open) return;
    setConfirming(false);
    setContent({});
    setOmitMissing(true);
  }, [open]);

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

  if (!open) return null;

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-close')) return;
    const cur = pos ?? { x: window.innerWidth / 2 - 320, y: window.innerHeight / 2 - 240 };
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, dlgX: cur.x, dlgY: cur.y };
    setPos(cur);
    setDragging(true);
  };

  const modalStyle: React.CSSProperties = pos
    ? { width: 640, position: 'absolute', left: pos.x, top: pos.y, margin: 0 }
    : { width: 640 };

  const updateMeta = (fn: (m: typeof doc.metadata) => void) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => {
        fn(d.metadata);
      }),
      dirty: true,
    }));
  };

  // 「レポートを生成」→ 確認画面。メモ・記号・コメントの選択は毎回未選択から
  const openConfirm = () => {
    setContent({});
    setConfirming(true);
  };

  const runExport = async () => {
    if (missingReportChoices(doc, content).length > 0) return;
    setBusy(true);
    try {
      const { exportPaperReport } = await import('../utils/exportReport');
      const base = doc.metadata.title || 'TEMer_report';
      await exportPaperReport(doc, {
        filename: `${base}.docx`,
        diagramElementId: 'diagram-canvas',
        includeDiagram,
        includeSourceRefs,
        sourceRefStyle,
        omitMissing,
        content,
      });
      setConfirming(false);
    } catch (e) {
      console.error(e);
      alert(`レポート出力に失敗しました: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <div
          className="modal-header"
          onMouseDown={onHeaderMouseDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          title="ドラッグで移動"
        >
          <h3>論文用レポート</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="settings-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={tab === t.key && !confirming ? 'settings-tab active' : 'settings-tab'}
              onClick={() => { setTab(t.key); setConfirming(false); }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="modal-body" style={{ minHeight: 380 }}>
          {confirming && (
            <ReportConfirm
              omitMissing={omitMissing}
              setOmitMissing={setOmitMissing}
              content={content}
              setContent={setContent}
              busy={busy}
              onExport={runExport}
              onContinue={(t) => { setConfirming(false); if (t) setTab(t); }}
            />
          )}
          {!confirming && tab === 'general' && <GeneralSection updateMeta={updateMeta} />}
          {!confirming && tab === 'notation' && <NotationSection updateMeta={updateMeta} />}
          {!confirming && tab === 'participants' && <ParticipantsSection updateMeta={updateMeta} />}
          {!confirming && tab === 'interview' && <InterviewSection updateMeta={updateMeta} />}
          {!confirming && tab === 'visual' && <VisualSection updateMeta={updateMeta} />}
          {!confirming && tab === 'export' && (
            <section className="settings-section">
              <h4>出力設定</h4>
              <div className="setting-row">
                <label>現在のキャンバスを図として含める</label>
                <input
                  type="checkbox"
                  checked={includeDiagram}
                  onChange={(e) => setIncludeDiagram(e.target.checked)}
                />
              </div>
              <div className="setting-row">
                <label>原文引用 (sourceRefs) を結果セクションに含める</label>
                <input
                  type="checkbox"
                  checked={includeSourceRefs}
                  onChange={(e) => setIncludeSourceRefs(e.target.checked)}
                />
              </div>
              {includeSourceRefs && (
                <div className="setting-row">
                  <label>引用表記スタイル</label>
                  <select
                    value={sourceRefStyle}
                    onChange={(e) => setSourceRefStyle(e.target.value as 'bracket' | 'apa')}
                  >
                    <option value="bracket">[原文 T1 §4]「…」 (角括弧)</option>
                    <option value="apa">（A, 第1回, §4）「…」 (APA 風)</option>
                  </select>
                </div>
              )}
              <p className="hint">
                .docx（Word 形式）として出力します。レポートには以下が含まれます:
                <br />
                ・記号体系 / 協力者 / インタビュー / 表記方針（方法相当）
                <br />
                ・TEM 図（任意・PNG 埋込）
                <br />
                ・<b>結果</b>: 時期区分・OPP・BFP・EFP・P-EFP・2nd EFP・P-2nd EFP・通常 Box・注釈・径路（実線/点線）・SD・SG を漏れなくリスト化
                <br />
                ・用語凡例
                <br />
                各要素の「説明」フィールド（PropertyPanel から編集可）が記入されていればそのまま挿入されます。
                出力の前に確認画面で、入力状況・図にあるメモや記号を載せるか・未入力の項目の扱いを選びます。
              </p>
              <div className="setting-row" style={{ justifyContent: 'flex-start' }}>
                <button
                  className="ribbon-btn-primary"
                  onClick={openConfirm}
                  disabled={busy}
                >
                  レポートを生成...
                </button>
              </div>
            </section>
          )}
        </div>
        <div className="modal-footer">
          <button className="ribbon-btn-small" onClick={onClose} disabled={busy}>閉じる</button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sections
// ----------------------------------------------------------------------------

type UpdateMeta = (fn: (m: ReturnType<typeof useTEMStore.getState>['doc']['metadata']) => void) => void;

function GeneralSection({ updateMeta }: { updateMeta: UpdateMeta }) {
  const doc = useTEMStore((s) => s.doc);
  return (
    <section className="settings-section">
      <h4>概要</h4>
      <div className="setting-row">
        <label>タイトル</label>
        <input
          type="text"
          value={doc.metadata.title ?? ''}
          onChange={(e) => updateMeta((m) => { m.title = e.target.value; })}
          style={{ width: 320 }}
        />
      </div>
      <div className="setting-row">
        <label>著者</label>
        <input
          type="text"
          value={doc.metadata.author ?? ''}
          onChange={(e) => updateMeta((m) => { m.author = e.target.value; })}
          style={{ width: 220 }}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>備考（レポート末尾）</label>
        <textarea
          value={doc.metadata.reportNotes ?? ''}
          onChange={(e) => updateMeta((m) => { m.reportNotes = e.target.value; })}
          style={{ width: 320, height: 80, resize: 'vertical' }}
        />
      </div>
    </section>
  );
}

function NotationSection({ updateMeta }: { updateMeta: UpdateMeta }) {
  const ns = useTEMStore((s) => s.doc.metadata.notationSystem);
  const doc = useTEMStore((s) => s.doc);
  const symbols = usedSymbols(doc);
  const meanings = doc.metadata.symbolMeanings ?? {};
  const update = (patch: Partial<NotationSystem>) => {
    updateMeta((m) => {
      m.notationSystem = { ...(m.notationSystem ?? { base: 'Arakawa2012' }), ...patch };
    });
  };
  return (
    <section className="settings-section">
      <h4>記号体系</h4>
      <p className="hint">
        この図で各記号が何を意味するかを宣言します。既定の表記は荒川・安田・サトウ（2012）を参照したもので、
        「標準」ではなく出発点です。変えた点があれば補足説明に書きます。
      </p>
      <div className="setting-row">
        <label>基準</label>
        <select
          value={ns?.base ?? 'Arakawa2012'}
          onChange={(e) => update({ base: e.target.value as NotationSystem['base'] })}
        >
          <option value="Arakawa2012">荒川・安田・サトウ 2012（既定）</option>
          <option value="custom">独自</option>
          <option value="other">その他</option>
        </select>
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>補足説明</label>
        <textarea
          value={ns?.customDescription ?? ''}
          onChange={(e) => update({ customDescription: e.target.value })}
          style={{ width: 320, height: 80, resize: 'vertical' }}
          placeholder="独自/その他を選択した場合、具体的な記号体系を説明"
        />
      </div>
      {symbols.length > 0 && (
        <>
          <h4 style={{ marginTop: 16 }}>図中の記号の意味</h4>
          <p className="hint">図に置いた記号（★・〇 など）の意味です。確認画面で「載せる」を選ぶと、記号体系の宣言に書き出します。</p>
          {symbols.map((sym) => (
            <div className="setting-row" key={sym}>
              <label>{sym}</label>
              <input
                type="text"
                value={meanings[sym] ?? ''}
                onChange={(e) => updateMeta((m) => { m.symbolMeanings = { ...(m.symbolMeanings ?? {}), [sym]: e.target.value }; })}
                style={{ width: 320 }}
                placeholder="例: 語りの中で本人が強調した転機"
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

function ParticipantsSection({ updateMeta }: { updateMeta: UpdateMeta }) {
  const pi = useTEMStore((s) => s.doc.metadata.participantsInfo);
  const update = (patch: Partial<ParticipantsInfo>) => {
    updateMeta((m) => {
      m.participantsInfo = {
        ...(m.participantsInfo ?? { count: 0, description: '', hsiDescription: '' }),
        ...patch,
      };
    });
  };
  return (
    <section className="settings-section">
      <h4>協力者情報</h4>
      <div className="setting-row">
        <label>協力者数</label>
        <input
          type="number"
          min={0}
          value={pi?.count ?? 0}
          onChange={(e) => update({ count: Math.max(0, Number(e.target.value)) })}
          style={{ width: 80 }}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>記述（属性など）</label>
        <textarea
          value={pi?.description ?? ''}
          onChange={(e) => update({ description: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>HSI 水準の説明</label>
        <textarea
          value={pi?.hsiDescription ?? ''}
          onChange={(e) => update({ hsiDescription: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
          placeholder="歴史的構造化招待（HSI）の水準の説明"
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>仮名（カンマ区切り）</label>
        <input
          type="text"
          value={(pi?.pseudonyms ?? []).join(', ')}
          onChange={(e) => update({ pseudonyms: e.target.value.split(/,\s*/).filter(Boolean) })}
          style={{ width: 320 }}
          placeholder="例: A, B, C"
        />
      </div>
    </section>
  );
}

function InterviewSection({ updateMeta }: { updateMeta: UpdateMeta }) {
  const iv = useTEMStore((s) => s.doc.metadata.interview);
  const update = (patch: Partial<InterviewInfo>) => {
    updateMeta((m) => {
      m.interview = {
        ...(m.interview ?? { method: '', durationDescription: '', timesCount: 0 }),
        ...patch,
      };
    });
  };
  return (
    <section className="settings-section">
      <h4>インタビュー方法</h4>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>方法</label>
        <textarea
          value={iv?.method ?? ''}
          onChange={(e) => update({ method: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
          placeholder="半構造化面接 など"
        />
      </div>
      <div className="setting-row">
        <label>所要時間/期間</label>
        <input
          type="text"
          value={iv?.durationDescription ?? ''}
          onChange={(e) => update({ durationDescription: e.target.value })}
          style={{ width: 280 }}
          placeholder="例: 1回あたり約60分、計3回"
        />
      </div>
      <div className="setting-row">
        <label>回数</label>
        <input
          type="number"
          min={0}
          value={iv?.timesCount ?? 0}
          onChange={(e) => update({ timesCount: Math.max(0, Number(e.target.value)) })}
          style={{ width: 80 }}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>分析の組合せ</label>
        <textarea
          value={iv?.analysisCombination ?? ''}
          onChange={(e) => update({ analysisCombination: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
          placeholder="例: TEM + M-GTA"
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>備考</label>
        <textarea
          value={iv?.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
        />
      </div>
    </section>
  );
}

function VisualSection({ updateMeta }: { updateMeta: UpdateMeta }) {
  const vc = useTEMStore((s) => s.doc.metadata.visualConventions);
  const update = (key: keyof VisualConventions, val: VisualConventionEntry | undefined) => {
    updateMeta((m) => {
      m.visualConventions = { ...(m.visualConventions ?? {}), [key]: val };
    });
  };

  const Entry = (props: { name: string; keyName: VisualConventionKey; hint?: string }) => {
    const cur = vc?.[props.keyName];
    // 未選択（一度も選んでいない）ときはどれにも印を付けない（確認画面の「未」と一致させる）
    const meaning = cur ? resolveConventionMeaning(cur) : undefined;
    return (
      <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 8, marginBottom: 8, background: '#fafafa' }}>
        <div className="setting-row">
          <label>{props.name}</label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {CONVENTION_MEANINGS.map((m) => (
              <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'normal' }}>
                <input
                  type="radio"
                  name={`vc-${props.keyName}`}
                  checked={meaning === m}
                  onChange={() => update(props.keyName, setConventionMeaning(cur, m))}
                />
                {CONVENTION_MEANING_LABELS[m]}
              </label>
            ))}
          </div>
        </div>
        {(meaning === 'yes' || meaning === 'loose') && (
          <div className="setting-row" style={{ alignItems: 'flex-start' }}>
            <label>説明</label>
            <textarea
              value={cur?.description ?? ''}
              onChange={(e) => update(props.keyName, {
                ...setConventionMeaning(cur, meaning),
                description: e.target.value,
              })}
              style={{ width: 300, height: 40, resize: 'vertical' }}
              placeholder={props.hint}
            />
          </div>
        )}
        {props.hint && !meaning && (
          <p className="hint" style={{ margin: '2px 0 0' }}>{props.hint}</p>
        )}
      </div>
    );
  };

  return (
    <section className="settings-section">
      <h4>表記方針</h4>
      <p className="hint">図中で意味を持たせた表記について明文化します（学会での透明性向上）。各項目は「意味あり / 緩やかに意味あり / 意味なし」から選びます。</p>
      {VISUAL_CONVENTION_ITEMS.map((it) => (
        <Entry key={it.key} name={it.label} keyName={it.key} hint={it.hint} />
      ))}
    </section>
  );
}

// ----------------------------------------------------------------------------
// 出力前の確認画面
// ----------------------------------------------------------------------------

const STATE_COLOR: Record<ReportItemState, string> = { done: '#1a7f37', partial: '#9a6700', missing: '#cf222e' };

function ReportConfirm({
  omitMissing,
  setOmitMissing,
  content,
  setContent,
  busy,
  onExport,
  onContinue,
}: {
  omitMissing: boolean;
  setOmitMissing: (v: boolean) => void;
  content: ReportContentChoices;
  setContent: (fn: (c: ReportContentChoices) => ReportContentChoices) => void;
  busy: boolean;
  onExport: () => void;
  onContinue: (tab?: ReportTab) => void;
}) {
  const doc = useTEMStore((s) => s.doc);
  const status = computeReportStatus(doc, content);
  const counts = reportContentCounts(doc);
  const missingChoices = missingReportChoices(doc, content);
  const firstTodo = status.find((s) => s.state !== 'done' && s.tab)?.tab;
  const radio = (name: string, checked: boolean, onChange: () => void, label: string) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'normal' }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} disabled={busy} />
      {label}
    </label>
  );
  const choiceBox = (title: string, children: React.ReactNode, unset: boolean) => (
    <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: '6px 8px', marginBottom: 6, background: unset ? '#fff8e1' : '#fafafa' }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}{unset && <span style={{ color: '#b36b00', marginLeft: 6 }}>（選んでください）</span>}</div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );

  return (
    <section className="settings-section">
      <h4>論文用レポート出力前の確認</h4>
      <p className="hint">入力は強制しません。「記入しない」まま出力することもできます。</p>

      <div style={{ fontWeight: 600, margin: '8px 0 4px' }}>入力状況</div>
      <table style={{ borderCollapse: 'collapse', fontSize: '0.92em', width: '100%' }}>
        <tbody>
          {status.map((it) => (
            <tr key={it.key} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ width: 44, color: STATE_COLOR[it.state], fontWeight: 700 }}>{REPORT_STATE_LABEL[it.state]}</td>
              <td>{it.label}{it.detail ? `（${it.detail}）` : ''}</td>
              <td style={{ textAlign: 'right' }}>
                {it.state !== 'done' && (it.tab
                  ? <button className="ribbon-btn-small" onClick={() => onContinue(it.tab)} disabled={busy}>入力する</button>
                  : <span className="hint">各要素のプロパティで書けます</span>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(counts.notes > 0 || counts.symbols > 0 || counts.comments > 0) && (
        <div style={{ fontWeight: 600, margin: '12px 0 4px' }}>図にある要素を載せるか</div>
      )}
      {counts.notes > 0 && choiceBox(`メモ（${counts.notes} 件。うちメモのプロパティで「論文レポートに載せる」にしたもの ${counts.flaggedNotes} 件）`, <>
        {radio('rc-notes', content.notes === 'all', () => setContent((c) => ({ ...c, notes: 'all' })), 'すべて注記に載せる')}
        {radio('rc-notes', content.notes === 'flagged', () => setContent((c) => ({ ...c, notes: 'flagged' })), `「載せる」にしたものだけ（${counts.flaggedNotes} 件）`)}
        {radio('rc-notes', content.notes === 'none', () => setContent((c) => ({ ...c, notes: 'none' })), '載せない（図からも除く）')}
      </>, !content.notes)}
      {counts.symbols > 0 && choiceBox(`記号（★・〇 など ${counts.symbols} 件）`, <>
        {radio('rc-symbols', content.symbols === true, () => setContent((c) => ({ ...c, symbols: true })), '載せる（図に残し、意味を記号体系の宣言に書く）')}
        {radio('rc-symbols', content.symbols === false, () => setContent((c) => ({ ...c, symbols: false })), '載せない（図からも除く）')}
      </>, content.symbols === undefined)}
      {counts.comments > 0 && choiceBox(`コメント（${counts.comments} 件）`, <>
        {radio('rc-comments', content.comments === true, () => setContent((c) => ({ ...c, comments: true })), '結果の「コメント」に載せる')}
        {radio('rc-comments', content.comments === false, () => setContent((c) => ({ ...c, comments: false })), '載せない')}
      </>, content.comments === undefined)}

      <div style={{ fontWeight: 600, margin: '12px 0 4px' }}>未入力の項目</div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {radio('rc-omit', omitMissing, () => setOmitMissing(true), '出力に含めない')}
        {radio('rc-omit', !omitMissing, () => setOmitMissing(false), '「（未入力）」と書いて含める（Word で抜けが分かる）')}
      </div>

      <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 8, marginTop: 14 }}>
        <button className="ribbon-btn-small" onClick={() => onContinue(firstTodo)} disabled={busy}>記入を続ける</button>
        <button
          className="ribbon-btn-primary"
          onClick={onExport}
          disabled={busy || missingChoices.length > 0}
          title={missingChoices.length > 0 ? `載せるかを選んでください: ${missingChoices.join('、')}` : undefined}
        >
          {busy ? '生成中...' : 'このまま出力する'}
        </button>
      </div>
    </section>
  );
}
