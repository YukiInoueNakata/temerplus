// ============================================================================
// PaperReportDialog - 論文用レポート出力ダイアログ
// 記号体系 / 協力者情報 / インタビュー / 表記方針 / 備考 を編集し、
// docx として出力する。出力の前に確認画面を出す（論文 04_report_format.md 4 節）:
// 入力状況（済／未／一部）、図にあるメモ・記号・コメントを載せるか（毎回未選択から）、未入力の扱い
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import i18n from '../i18n';
import { Trans, useTranslation } from 'react-i18next';
import { sentenceGap } from '../utils/sentenceGap';
import { useTEMStore } from '../store/store';
import {
  CONVENTION_MEANINGS,
  VISUAL_CONVENTION_ITEMS,
  conventionItemHint,
  conventionItemLabel,
  conventionMeaningLabel,
  resolveConventionMeaning,
  setConventionMeaning,
  type VisualConventionKey,
} from '../utils/visualConventions';
import { produce } from 'immer';
import { LABEL_BRACKETS, type LabelBracket, type LabelOrder } from '../utils/labelStyle';
import {
  computeReportStatus,
  missingReportChoices,
  reportContentCounts,
  usedSymbols,
  reportStateLabel,
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

// 表示名は描画のときに t(labelKey) で引く
const TABS: { key: Tab; labelKey: string }[] = [
  { key: 'general', labelKey: 'tab.general' },
  { key: 'notation', labelKey: 'tab.notation' },
  { key: 'participants', labelKey: 'tab.participants' },
  { key: 'interview', labelKey: 'tab.interview' },
  { key: 'visual', labelKey: 'tab.visual' },
  { key: 'export', labelKey: 'tab.export' },
];

// TEM 論文 68 本で、記号の付いた要素を主に括っていた括弧の論文の数（docs/surveys/2026-11-10_box-notation。
// 「」以外で 10 回以上使った括弧のうちいちばん多いもの。「」は記号つきで使った論文と「」だけの論文の合計）
const BRACKET_SURVEY: Partial<Record<LabelBracket, number>> = { '【】': 25, '〈〉': 17, '「」': 17, '［］': 3, '“”': 3, '『』': 2, '《》': 1, '＜＞': 0 };

function bracketOption(b: LabelBracket): string {
  if (b === 'auto') return i18n.t('paperReportDialog:export.labelBracket.auto');
  const n = BRACKET_SURVEY[b];
  return `${b[0]}…${b[1]}` + (n !== undefined ? i18n.t('paperReportDialog:export.labelBracket.count', { n }) : '');
}

function exampleLabel(b: LabelBracket, order: LabelOrder): string {
  const [o, c] = b === 'auto' ? ['【', '】'] : [b[0], b[1]];
  return order === 'id-first' ? `BFP1${o}…${c}` : `${o}…${c}（BFP1）`;
}

export function PaperReportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('paperReportDialog');
  const [tab, setTab] = useState<Tab>('general');
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, dlgX: 0, dlgY: 0 });
  const [busy, setBusy] = useState(false);
  // 出力タブの設定は図のファイル（metadata.reportOptions）に残す（2026-11-10。以前は画面を閉じると元に戻った）
  const ro = useTEMStore((s) => s.doc.metadata.reportOptions) ?? {};
  const includeDiagram = ro.includeDiagram !== false;
  const includeSourceRefs = ro.includeSourceRefs !== false;
  const sourceRefStyle = ro.sourceRefStyle ?? 'bracket';
  // 結果の節でラベルを括る括弧と書く順（TEM 論文 68 本の調べで主に使われていたものを選べる）
  const labelBox: LabelBracket = ro.labelStyle?.box ?? 'auto';
  const labelSdsg: LabelBracket = ro.labelStyle?.sdsg ?? 'auto';
  const labelOrder: LabelOrder = ro.labelStyle?.order ?? 'id-first';
  const setReportOption = (patch: Partial<NonNullable<typeof ro>>) => {
    useTEMStore.setState((state) => ({
      doc: produce(state.doc, (d) => { d.metadata.reportOptions = { ...(d.metadata.reportOptions ?? {}), ...patch }; }),
      dirty: true,
    }));
  };
  const setIncludeDiagram = (v: boolean) => setReportOption({ includeDiagram: v });
  const setIncludeSourceRefs = (v: boolean) => setReportOption({ includeSourceRefs: v });
  const setSourceRefStyle = (v: 'bracket' | 'apa') => setReportOption({ sourceRefStyle: v });
  const setLabelBox = (v: LabelBracket) => setReportOption({ labelStyle: { ...(ro.labelStyle ?? {}), box: v } });
  const setLabelSdsg = (v: LabelBracket) => setReportOption({ labelStyle: { ...(ro.labelStyle ?? {}), sdsg: v } });
  const setLabelOrder = (v: LabelOrder) => setReportOption({ labelStyle: { ...(ro.labelStyle ?? {}), order: v } });
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
        labelStyle: { box: labelBox, sdsg: labelSdsg, order: labelOrder },
        omitMissing,
        content,
      });
      setConfirming(false);
    } catch (e) {
      console.error(e);
      alert(t('alert.failed', { message: e instanceof Error ? e.message : String(e) }));
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
          title={t('drag')}
        >
          <h3>{t('title')}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="settings-tabs">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              className={tab === tb.key && !confirming ? 'settings-tab active' : 'settings-tab'}
              onClick={() => { setTab(tb.key); setConfirming(false); }}
            >
              {t(tb.labelKey)}
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
              onContinue={(next) => { setConfirming(false); if (next) setTab(next); }}
            />
          )}
          {!confirming && tab === 'general' && <GeneralSection updateMeta={updateMeta} />}
          {!confirming && tab === 'notation' && <NotationSection updateMeta={updateMeta} />}
          {!confirming && tab === 'participants' && <ParticipantsSection updateMeta={updateMeta} />}
          {!confirming && tab === 'interview' && <InterviewSection updateMeta={updateMeta} />}
          {!confirming && tab === 'visual' && <VisualSection updateMeta={updateMeta} />}
          {!confirming && tab === 'export' && (
            <section className="settings-section">
              <h4>{t('export.title')}</h4>
              <div className="setting-row">
                <label>{t('export.includeDiagram')}</label>
                <input
                  type="checkbox"
                  checked={includeDiagram}
                  onChange={(e) => setIncludeDiagram(e.target.checked)}
                />
              </div>
              <div className="setting-row">
                <label>{t('export.includeSourceRefs')}</label>
                <input
                  type="checkbox"
                  checked={includeSourceRefs}
                  onChange={(e) => setIncludeSourceRefs(e.target.checked)}
                />
              </div>
              {/* 結果の節のラベルの括弧と書く順 */}
              <div className="setting-row">
                <label title={t('export.labelBracket.title')}>{t('export.labelBracket.box')}</label>
                <select value={labelBox} onChange={(e) => setLabelBox(e.target.value as LabelBracket)}>
                  {LABEL_BRACKETS.map((b) => <option key={b} value={b}>{bracketOption(b)}</option>)}
                </select>
              </div>
              <div className="setting-row">
                <label title={t('export.labelBracket.title')}>{t('export.labelBracket.sdsg')}</label>
                <select value={labelSdsg} onChange={(e) => setLabelSdsg(e.target.value as LabelBracket)}>
                  {LABEL_BRACKETS.map((b) => <option key={b} value={b}>{bracketOption(b)}</option>)}
                </select>
              </div>
              <div className="setting-row">
                <label>{t('export.labelOrder')}</label>
                <select value={labelOrder} onChange={(e) => setLabelOrder(e.target.value as LabelOrder)}>
                  <option value="id-first">{t('export.labelOrder.idFirst', { example: exampleLabel(labelBox, 'id-first') })}</option>
                  <option value="label-first">{t('export.labelOrder.labelFirst', { example: exampleLabel(labelBox, 'label-first') })}</option>
                </select>
              </div>
              <p className="hint" style={{ marginTop: 0 }}>{t('export.labelBracket.survey')}</p>
              {includeSourceRefs && (
                <div className="setting-row">
                  <label>{t('export.sourceRefStyle')}</label>
                  <select
                    value={sourceRefStyle}
                    onChange={(e) => setSourceRefStyle(e.target.value as 'bracket' | 'apa')}
                  >
                    <option value="bracket">{t('export.style.bracket')}</option>
                    <option value="apa">{t('export.style.apa')}</option>
                  </select>
                </div>
              )}
              <p className="hint">
                {t('export.hint.intro')}
                <br />
                {t('export.hint.methods')}
                <br />
                {t('export.hint.diagram')}
                <br />
                <Trans t={t} i18nKey="export.hint.results" components={{ b: <b /> }} />
                <br />
                {t('export.hint.glossary')}
                <br />
                {t('export.hint.description')}{sentenceGap()}
                {t('export.hint.confirm')}
              </p>
              <div className="setting-row" style={{ justifyContent: 'flex-start' }}>
                <button
                  className="ribbon-btn-primary"
                  onClick={openConfirm}
                  disabled={busy}
                >
                  {t('export.generate')}
                </button>
              </div>
            </section>
          )}
        </div>
        <div className="modal-footer">
          <button className="ribbon-btn-small" onClick={onClose} disabled={busy}>{t('close')}</button>
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
  const { t } = useTranslation('paperReportDialog');
  const doc = useTEMStore((s) => s.doc);
  return (
    <section className="settings-section">
      <h4>{t('general.title')}</h4>
      <div className="setting-row">
        <label>{t('general.docTitle')}</label>
        <input
          type="text"
          value={doc.metadata.title ?? ''}
          onChange={(e) => updateMeta((m) => { m.title = e.target.value; })}
          style={{ width: 320 }}
        />
      </div>
      <div className="setting-row">
        <label>{t('general.author')}</label>
        <input
          type="text"
          value={doc.metadata.author ?? ''}
          onChange={(e) => updateMeta((m) => { m.author = e.target.value; })}
          style={{ width: 220 }}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>{t('general.notes')}</label>
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
  const { t } = useTranslation('paperReportDialog');
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
      <h4>{t('notation.title')}</h4>
      <p className="hint">
        {t('notation.hint')}
      </p>
      <div className="setting-row">
        <label>{t('notation.base')}</label>
        <select
          value={ns?.base ?? 'Arakawa2012'}
          onChange={(e) => update({ base: e.target.value as NotationSystem['base'] })}
        >
          <option value="Arakawa2012">{t('notation.base.arakawa')}</option>
          <option value="custom">{t('notation.base.custom')}</option>
          <option value="other">{t('notation.base.other')}</option>
        </select>
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>{t('notation.description')}</label>
        <textarea
          value={ns?.customDescription ?? ''}
          onChange={(e) => update({ customDescription: e.target.value })}
          style={{ width: 320, height: 80, resize: 'vertical' }}
          placeholder={t('notation.description.placeholder')}
        />
      </div>
      {symbols.length > 0 && (
        <>
          <h4 style={{ marginTop: 16 }}>{t('notation.symbols.title')}</h4>
          <p className="hint">{t('notation.symbols.hint')}</p>
          {symbols.map((sym) => (
            <div className="setting-row" key={sym}>
              <label>{sym}</label>
              <input
                type="text"
                value={meanings[sym] ?? ''}
                onChange={(e) => updateMeta((m) => { m.symbolMeanings = { ...(m.symbolMeanings ?? {}), [sym]: e.target.value }; })}
                style={{ width: 320 }}
                placeholder={t('notation.symbols.placeholder')}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

function ParticipantsSection({ updateMeta }: { updateMeta: UpdateMeta }) {
  const { t } = useTranslation('paperReportDialog');
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
      <h4>{t('participants.title')}</h4>
      <div className="setting-row">
        <label>{t('participants.count')}</label>
        <input
          type="number"
          min={0}
          value={pi?.count ?? 0}
          onChange={(e) => update({ count: Math.max(0, Number(e.target.value)) })}
          style={{ width: 80 }}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>{t('participants.description')}</label>
        <textarea
          value={pi?.description ?? ''}
          onChange={(e) => update({ description: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>{t('participants.hsi')}</label>
        <textarea
          value={pi?.hsiDescription ?? ''}
          onChange={(e) => update({ hsiDescription: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
          placeholder={t('participants.hsi.placeholder')}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>{t('participants.pseudonyms')}</label>
        <input
          type="text"
          value={(pi?.pseudonyms ?? []).join(', ')}
          onChange={(e) => update({ pseudonyms: e.target.value.split(/,\s*/).filter(Boolean) })}
          style={{ width: 320 }}
          placeholder={t('participants.pseudonyms.placeholder')}
        />
      </div>
    </section>
  );
}

function InterviewSection({ updateMeta }: { updateMeta: UpdateMeta }) {
  const { t } = useTranslation('paperReportDialog');
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
      <h4>{t('interview.title')}</h4>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>{t('interview.method')}</label>
        <textarea
          value={iv?.method ?? ''}
          onChange={(e) => update({ method: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
          placeholder={t('interview.method.placeholder')}
        />
      </div>
      <div className="setting-row">
        <label>{t('interview.duration')}</label>
        <input
          type="text"
          value={iv?.durationDescription ?? ''}
          onChange={(e) => update({ durationDescription: e.target.value })}
          style={{ width: 280 }}
          placeholder={t('interview.duration.placeholder')}
        />
      </div>
      <div className="setting-row">
        <label>{t('interview.times')}</label>
        <input
          type="number"
          min={0}
          value={iv?.timesCount ?? 0}
          onChange={(e) => update({ timesCount: Math.max(0, Number(e.target.value)) })}
          style={{ width: 80 }}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>{t('interview.analysis')}</label>
        <textarea
          value={iv?.analysisCombination ?? ''}
          onChange={(e) => update({ analysisCombination: e.target.value })}
          style={{ width: 320, height: 60, resize: 'vertical' }}
          placeholder={t('interview.analysis.placeholder')}
        />
      </div>
      <div className="setting-row" style={{ alignItems: 'flex-start' }}>
        <label>{t('interview.notes')}</label>
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
  const { t } = useTranslation('paperReportDialog');
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
                {conventionMeaningLabel(m)}
              </label>
            ))}
          </div>
        </div>
        {(meaning === 'yes' || meaning === 'loose') && (
          <div className="setting-row" style={{ alignItems: 'flex-start' }}>
            <label>{t('visual.description')}</label>
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
      <h4>{t('visual.title')}</h4>
      <p className="hint">{t('visual.hint')}</p>
      {VISUAL_CONVENTION_ITEMS.map((it) => (
        <Entry key={it.key} name={conventionItemLabel(it.key)} keyName={it.key} hint={conventionItemHint(it.key)} />
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
  const { t } = useTranslation('paperReportDialog');
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
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}{unset && <span style={{ color: '#b36b00', marginLeft: 6 }}>{t('confirm.choose')}</span>}</div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );

  return (
    <section className="settings-section">
      <h4>{t('confirm.title')}</h4>
      <p className="hint">{t('confirm.hint')}</p>

      <div style={{ fontWeight: 600, margin: '8px 0 4px' }}>{t('confirm.status')}</div>
      <table style={{ borderCollapse: 'collapse', fontSize: '0.92em', width: '100%' }}>
        <tbody>
          {status.map((it) => (
            <tr key={it.key} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ width: 44, color: STATE_COLOR[it.state], fontWeight: 700 }}>{reportStateLabel(it.state)}</td>
              <td>{it.label}{it.detail ? t('confirm.status.detail', { detail: it.detail }) : ''}</td>
              <td style={{ textAlign: 'right' }}>
                {it.state !== 'done' && (it.tab
                  ? <button className="ribbon-btn-small" onClick={() => onContinue(it.tab)} disabled={busy}>{t('confirm.fillIn')}</button>
                  : <span className="hint">{t('confirm.inProperties')}</span>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(counts.notes > 0 || counts.symbols > 0 || counts.comments > 0) && (
        <div style={{ fontWeight: 600, margin: '12px 0 4px' }}>{t('confirm.content')}</div>
      )}
      {counts.notes > 0 && choiceBox(t('confirm.notes.title', { n: counts.notes, flagged: counts.flaggedNotes }), <>
        {radio('rc-notes', content.notes === 'all', () => setContent((c) => ({ ...c, notes: 'all' })), t('confirm.notes.all'))}
        {radio('rc-notes', content.notes === 'flagged', () => setContent((c) => ({ ...c, notes: 'flagged' })), t('confirm.notes.flagged', { flagged: counts.flaggedNotes }))}
        {radio('rc-notes', content.notes === 'none', () => setContent((c) => ({ ...c, notes: 'none' })), t('confirm.excludeAndRemove'))}
      </>, !content.notes)}
      {counts.symbols > 0 && choiceBox(t('confirm.symbols.title', { n: counts.symbols }), <>
        {radio('rc-symbols', content.symbols === true, () => setContent((c) => ({ ...c, symbols: true })), t('confirm.symbols.include'))}
        {radio('rc-symbols', content.symbols === false, () => setContent((c) => ({ ...c, symbols: false })), t('confirm.excludeAndRemove'))}
      </>, content.symbols === undefined)}
      {counts.comments > 0 && choiceBox(t('confirm.comments.title', { n: counts.comments }), <>
        {radio('rc-comments', content.comments === true, () => setContent((c) => ({ ...c, comments: true })), t('confirm.comments.include'))}
        {radio('rc-comments', content.comments === false, () => setContent((c) => ({ ...c, comments: false })), t('confirm.exclude'))}
      </>, content.comments === undefined)}

      <div style={{ fontWeight: 600, margin: '12px 0 4px' }}>{t('confirm.missing')}</div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {radio('rc-omit', omitMissing, () => setOmitMissing(true), t('confirm.missing.omit'))}
        {radio('rc-omit', !omitMissing, () => setOmitMissing(false), t('confirm.missing.mark'))}
      </div>

      <div className="setting-row" style={{ justifyContent: 'flex-start', gap: 8, marginTop: 14 }}>
        <button className="ribbon-btn-small" onClick={() => onContinue(firstTodo)} disabled={busy}>{t('confirm.continue')}</button>
        <button
          className="ribbon-btn-primary"
          onClick={onExport}
          disabled={busy || missingChoices.length > 0}
          title={missingChoices.length > 0 ? t('confirm.chooseFirst', { items: missingChoices.join(t('list.separator')) }) : undefined}
        >
          {busy ? t('confirm.generating') : t('confirm.export')}
        </button>
      </div>
    </section>
  );
}
