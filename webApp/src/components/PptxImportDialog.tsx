// ============================================================================
// PptxImportDialog - PowerPoint（.pptx）で描いた TEM 図の取り込み
//
// 1. ファイル  : .pptx を読む（ImportWizardDialog から .pptx を渡されたときはここを飛ばす）
// 2. 図形の役割: スライドの縮図と図形の一覧を並べ、図形ごとに Box / SD / SG / Line /
//                時期 / メモ / 無視 を選ぶ（見た目から推測した値が入っている）
// 3. 確認      : 位置関係から推定した結果（Line の両端・SD/SG の紐付け先）の件数と警告
//
// 解析と組み立ては utils/pptxImport の純関数。ここは選択 UI と store への反映だけ。
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTEMStore, useActiveSheet } from '../store/store';
import { LEVEL_PX, BOX_TYPE_LABELS } from '../store/defaults';
import {
  parsePptx, classifyShapes, buildFromPptx, lineEndpoints, DEFAULT_PPTX_BUILD_OPTIONS,
  type PptxFile, type PptxRole, type ShapePlan, type PptxShape,
} from '../utils/pptxImport';
import { SELECTABLE_BOX_TYPES } from '../utils/typeDisplay';
import type { BoxType, LineType } from '../types';

const ROLE_COLORS: Record<PptxRole, string> = {
  box: '#2684ff',
  sd: '#d64545',
  sg: '#2f9e44',
  sdsgLabel: '#e8890c',
  subLabel: '#b5651d',
  line: '#7048e8',
  period: '#0c8599',
  note: '#868e96',
  timeArrow: '#adb5bd',
  ignore: '#ced4da',
};

/** 図形の役割の表示名のキー（locales/pptxImportDialog.csv。日本語は utils/pptxImport の PPTX_ROLE_LABELS と同じ） */
const ROLE_LABEL_KEYS: Record<PptxRole, string> = {
  box: 'role.box',
  sd: 'role.sd',
  sg: 'role.sg',
  sdsgLabel: 'role.sdsgLabel',
  subLabel: 'role.subLabel',
  line: 'role.line',
  period: 'role.period',
  note: 'role.note',
  timeArrow: 'role.timeArrow',
  ignore: 'role.ignore',
};

const ROLE_ORDER: PptxRole[] = ['box', 'sd', 'sg', 'sdsgLabel', 'subLabel', 'line', 'period', 'note', 'timeArrow', 'ignore'];

const short = (t: string, n = 28) => {
  const one = t.replace(/\s+/g, ' ').trim();
  return one.length > n ? `${one.slice(0, n)}…` : one;
};

export function PptxImportDialog({ open, initialFile, onClose }: { open: boolean; initialFile?: File | null; onClose: () => void }) {
  const { t, i18n } = useTranslation('pptxImportDialog');
  /** Box の種類の表示名（日本語は従来の表示名、ほかの言語は TEM の用語の表） */
  const boxTypeLabel = (bt: string) => (i18n.language === 'ja' ? BOX_TYPE_LABELS[bt].ja : t(`terms:boxType.${bt}`));
  const doc = useTEMStore((s) => s.doc);
  const sheet = useActiveSheet();
  const importBoxes = useTEMStore((s) => s.importBoxes);
  const importSDSGs = useTEMStore((s) => s.importSDSGs);
  const importPeriodLabels = useTEMStore((s) => s.importPeriodLabels);
  const addNote = useTEMStore((s) => s.addNote);
  const addSheet = useTEMStore((s) => s.addSheet);
  const setActiveSheet = useTEMStore((s) => s.setActiveSheet);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<PptxFile | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [plans, setPlans] = useState<ShapePlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [showIgnored, setShowIgnored] = useState(false);
  // 組み立ての設定
  const [scale, setScale] = useState(DEFAULT_PPTX_BUILD_OPTIONS.scale);
  const [smallToDescription, setSmallToDescription] = useState(true);
  const [keepFontSize, setKeepFontSize] = useState(true);
  const [toNewSheet, setToNewSheet] = useState(false);

  const slide = file?.slides[slideIdx] ?? null;

  const reset = () => {
    setStep(1); setFile(null); setSlideIdx(0); setPlans([]); setError(null); setHoverKey(null);
  };
  const close = () => { reset(); onClose(); };

  const loadSlide = (f: PptxFile, idx: number) => {
    setSlideIdx(idx);
    setPlans(classifyShapes(f.slides[idx], { widthPt: f.widthPt }));
  };

  const handleFile = async (f: File) => {
    setError(null);
    try {
      const parsed = await parsePptx(new Uint8Array(await f.arrayBuffer()), f.name);
      if (parsed.slides.length === 0) { setError(t('error.noSlides')); return; }
      // 図形がいちばん多いスライドを既定に
      let best = 0;
      parsed.slides.forEach((s, i) => { if (s.shapes.length > parsed.slides[best].shapes.length) best = i; });
      setFile(parsed);
      loadSlide(parsed, best);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  // ウィザードから .pptx を渡されたら、そのまま読む
  useEffect(() => {
    if (open && initialFile) void handleFile(initialFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialFile]);

  const planBy = useMemo(() => new Map(plans.map((p) => [p.key, p])), [plans]);
  const setPlan = (key: string, patch: Partial<ShapePlan>) => {
    setPlans((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch, reason: t('reason.manual') } : p)));
  };
  const sdsgKeys = plans.filter((p) => p.role === 'sd' || p.role === 'sg').map((p) => p.key);
  const ownerKeys = plans.filter((p) => p.role === 'box' || p.role === 'sd' || p.role === 'sg').map((p) => p.key);

  const isH = doc.settings.layout === 'horizontal';
  const startTimePx = useMemo(() => {
    if (toNewSheet || !sheet || sheet.boxes.length === 0) return 0;
    const maxT = Math.max(...sheet.boxes.map((b) => (isH ? b.x + b.width : b.y + b.height)));
    return (Math.ceil(maxT / LEVEL_PX) + 1) * LEVEL_PX;
  }, [toNewSheet, sheet, isH]);

  const result = useMemo(() => {
    if (!slide || step < 3) return null;
    return buildFromPptx(slide, plans, {
      ...DEFAULT_PPTX_BUILD_OPTIONS,
      scale, smallToDescription, keepFontSize, levelPx: LEVEL_PX, startTimePx,
      existingBoxIds: toNewSheet ? [] : sheet?.boxes.map((b) => b.id) ?? [],
      existingLineIds: toNewSheet ? [] : sheet?.lines.map((l) => l.id) ?? [],
      existingSdsgIds: toNewSheet ? [] : sheet?.sdsg.map((s) => s.id) ?? [],
      existingNoteIds: toNewSheet ? [] : sheet?.notes.map((n) => n.id) ?? [],
    });
  }, [slide, plans, step, scale, smallToDescription, keepFontSize, startTimePx, toNewSheet, sheet]);

  const runImport = () => {
    if (!file || !result) return;
    const apply = () => {
      if (result.boxes.length > 0 || result.lines.length > 0) importBoxes(result.boxes, result.lines);
      if (result.sdsg.length > 0) importSDSGs(result.sdsg);
      if (result.periodLabels.length > 0) importPeriodLabels(result.periodLabels);
      result.notes.forEach((n) => addNote(n));
    };
    // 反映が終わってから成功を知らせる（新しいシートはシートの切り替えを待ってから反映）
    const done = () => {
      try {
        apply();
      } catch (e) {
        setError(t('error.importFailed', { message: e instanceof Error ? e.message : String(e) }));
        return;
      }
      const msg = t('done.summary', { boxes: result.boxes.length, lines: result.lines.length, sdsg: result.sdsg.length, periods: result.periodLabels.length, notes: result.notes.length });
      alert(result.warnings.length > 0 ? `${msg}\n\n${t('done.warnings', { count: result.warnings.length })}\n${result.warnings.join('\n')}` : msg);
      close();
    };
    if (toNewSheet) {
      const id = addSheet(file.filename.replace(/\.[^.]+$/, ''));
      setActiveSheet(id);
      setTimeout(done, 0);
    } else {
      done();
    }
  };

  if (!open) return null;

  const counts = ROLE_ORDER.map((r) => ({ role: r, n: plans.filter((p) => p.role === r).length })).filter((c) => c.n > 0);
  const listed = slide
    ? [...slide.shapes]
      .filter((s) => showIgnored || !['ignore', 'timeArrow'].includes(planBy.get(s.key)?.role ?? 'ignore'))
      .sort((a, b) => {
        const ra = ROLE_ORDER.indexOf(planBy.get(a.key)?.role ?? 'ignore');
        const rb = ROLE_ORDER.indexOf(planBy.get(b.key)?.role ?? 'ignore');
        return ra - rb || a.x - b.x;
      })
    : [];

  return (
    <div className="modal-backdrop" onClick={close} style={{ zIndex: 1250 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 1080, maxWidth: '96vw' }}>
        <div className="modal-header">
          <h3>{t('title', { step })}</h3>
          <button className="modal-close" onClick={close}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
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
                <input ref={fileInputRef} type="file" accept=".pptx" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ''; }} />
              </div>
            </section>
          )}

          {/* ---------------- 2. 図形の役割 ---------------- */}
          {step === 2 && file && slide && (
            <section className="settings-section">
              <h4>{t('step2.heading')}</h4>
              <p className="hint">
                {t('step2.hint', { filename: file.filename, slide: slide.index, shapes: slide.shapes.length })}
              </p>
              {file.slides.length > 1 && (
                <div className="setting-row">
                  <label>{t('step2.slide')}</label>
                  <select value={slideIdx} onChange={(e) => loadSlide(file, Number(e.target.value))}>
                    {file.slides.map((s, i) => <option key={i} value={i}>{t('step2.slideOption', { index: s.index, shapes: s.shapes.length })}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '6px 0', fontSize: '0.85em' }}>
                {counts.map((c) => (
                  <span key={c.role}><span style={{ display: 'inline-block', width: 10, height: 10, background: ROLE_COLORS[c.role], marginRight: 4 }} />{t(ROLE_LABEL_KEYS[c.role])} {c.n}</span>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: 12 }}>
                <SlidePreview file={file} shapes={slide.shapes} planBy={planBy} hoverKey={hoverKey} onHover={setHoverKey} />
                <div style={{ maxHeight: '52vh', overflowY: 'auto' }}>
                  <label style={{ fontSize: '0.85em', fontWeight: 'normal' }}>
                    <input type="checkbox" checked={showIgnored} onChange={(e) => setShowIgnored(e.target.checked)} /> {t('step2.showIgnored')}
                  </label>
                  <table className="data-table" style={{ fontSize: '0.82em' }}>
                    <thead><tr><th>{t('col.shape')}</th><th style={{ width: 128 }}>{t('col.role')}</th><th style={{ width: 128 }}>{t('col.detail')}</th></tr></thead>
                    <tbody>
                      {listed.map((s) => {
                        const p = planBy.get(s.key)!;
                        return (
                          <tr key={s.key}
                            onMouseEnter={() => setHoverKey(s.key)} onMouseLeave={() => setHoverKey(null)}
                            style={{ background: hoverKey === s.key ? '#fff4d6' : undefined }}>
                            <td title={`${s.text}\n${t('shape.tooltip', { kind: s.geom || s.kind, reason: p.reason ?? '' })}`}>
                              <span style={{ display: 'inline-block', width: 8, height: 8, background: ROLE_COLORS[p.role], marginRight: 4 }} />
                              {s.text ? short(s.text) : <span style={{ color: '#888' }}>{t('shape.noText', { kind: s.geom || s.kind })}</span>}
                            </td>
                            <td>
                              <select value={p.role} onChange={(e) => setPlan(s.key, { role: e.target.value as PptxRole })} style={{ width: '100%' }}>
                                {ROLE_ORDER.map((r) => <option key={r} value={r}>{t(ROLE_LABEL_KEYS[r])}</option>)}
                              </select>
                            </td>
                            <td>
                              {p.role === 'box' && (
                                <select value={p.boxType ?? 'normal'} onChange={(e) => setPlan(s.key, { boxType: e.target.value as BoxType })} style={{ width: '100%' }}>
                                  {SELECTABLE_BOX_TYPES.map((bt) => <option key={bt} value={bt}>{boxTypeLabel(bt)}</option>)}
                                </select>
                              )}
                              {p.role === 'line' && (
                                <select value={p.lineType ?? 'RLine'} onChange={(e) => setPlan(s.key, { lineType: e.target.value as LineType })} style={{ width: '100%' }}>
                                  <option value="RLine">{t('line.RLine')}</option>
                                  <option value="XLine">{t('line.XLine')}</option>
                                </select>
                              )}
                              {p.role === 'subLabel' && (
                                <select value={p.labelOf ?? ''} onChange={(e) => setPlan(s.key, { labelOf: e.target.value || undefined })} style={{ width: '100%' }}>
                                  <option value="">{t('notSelected')}</option>
                                  {ownerKeys.map((k) => {
                                    const sh = slide.shapes.find((x) => x.key === k)!;
                                    const role = planBy.get(k)?.role;
                                    return <option key={k} value={k}>{role === 'box' ? short(sh.text, 14) : t('owner.position', { role: role?.toUpperCase(), x: Math.round(sh.x), y: Math.round(sh.y) })}</option>;
                                  })}
                                </select>
                              )}
                              {p.role === 'sdsgLabel' && (
                                <select value={p.labelOf ?? ''} onChange={(e) => setPlan(s.key, { labelOf: e.target.value || undefined })} style={{ width: '100%' }}>
                                  <option value="">{t('notSelected')}</option>
                                  {sdsgKeys.map((k) => {
                                    const sh = slide.shapes.find((x) => x.key === k)!;
                                    return <option key={k} value={k}>{t('owner.position', { role: planBy.get(k)?.role.toUpperCase(), x: Math.round(sh.x), y: Math.round(sh.y) })}</option>;
                                  })}
                                </select>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ---------------- 3. 確認 ---------------- */}
          {step === 3 && result && (
            <section className="settings-section">
              <h4>{t('step3.heading')}</h4>
              <p>
                Box <strong>{result.boxes.length}</strong>{t('sep')}Line <strong>{result.lines.length}</strong>{t('sep')}
                SD/SG <strong>{result.sdsg.length}</strong>{t('sep')}{t('count.periodLabels')} <strong>{result.periodLabels.length}</strong>{t('sep')}
                {t('count.notes')} <strong>{result.notes.length}</strong>
              </p>
              <div className="setting-row">
                <label title={t('step3.scale.tip')}>{t('step3.scale')}</label>
                <input type="number" min={0.5} max={5} step={0.25} value={scale} onChange={(e) => setScale(Math.max(0.5, Math.min(5, Number(e.target.value) || 2)))} style={{ width: 80 }} />
              </div>
              <div className="setting-row">
                <label title={t('step3.smallToDescription.tip')}>{t('step3.smallToDescription')}</label>
                <input type="checkbox" checked={smallToDescription} onChange={(e) => setSmallToDescription(e.target.checked)} />
              </div>
              <div className="setting-row">
                <label>{t('step3.keepFontSize')}</label>
                <input type="checkbox" checked={keepFontSize} onChange={(e) => setKeepFontSize(e.target.checked)} />
              </div>
              <div className="setting-row"><label>{t('step3.toNewSheet')}</label><input type="checkbox" checked={toNewSheet} onChange={(e) => setToNewSheet(e.target.checked)} /></div>
              {!isH && <p className="hint" style={{ color: '#b45309' }}>{t('step3.verticalWarning')}</p>}
              {result.warnings.length > 0 && (
                <>
                  <h5 style={{ margin: '12px 0 4px' }}>{t('step3.warnings', { count: result.warnings.length })}</h5>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.88em', color: '#8a4b08' }}>
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </>
              )}
              <h5 style={{ margin: '12px 0 4px' }}>{t('step3.links')}</h5>
              <table className="data-table" style={{ fontSize: '0.82em' }}>
                <tbody>
                  {result.lines.map((l) => {
                    const f = result.boxes.find((b) => b.id === l.from);
                    const toBox = result.boxes.find((b) => b.id === l.to);
                    return <tr key={l.id}><td style={{ width: 70 }}>{l.id}</td><td>{short(f?.label ?? l.from, 22)} → {short(toBox?.label ?? l.to, 22)}</td></tr>;
                  })}
                  {result.sdsg.map((g) => {
                    const b = result.boxes.find((x) => x.id === g.attachedTo);
                    return <tr key={g.id}><td>{g.id}</td><td>{short(g.label || t('noLabel'), 22)} ⇒ {short(b?.label ?? g.attachedTo, 22)}</td></tr>;
                  })}
                </tbody>
              </table>
            </section>
          )}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {step > 1 && !(step === 2 && initialFile) && <button className="ribbon-btn-small" onClick={() => setStep(step - 1)}>← {t('back')}</button>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ribbon-btn-small" onClick={close}>{t('cancel')}</button>
            {step === 2 && <button className="ribbon-btn-primary" disabled={!plans.some((p) => p.role === 'box')} onClick={() => setStep(3)}>{t('next')} →</button>}
            {step === 3 && <button className="ribbon-btn-primary" disabled={!result || result.boxes.length === 0} onClick={runImport}>{t('import')}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** スライドの縮図。図形を役割の色で描き、マウスを乗せた図形を強調する */
function SlidePreview({ file, shapes, planBy, hoverKey, onHover }: {
  file: PptxFile;
  shapes: PptxShape[];
  planBy: Map<string, ShapePlan>;
  hoverKey: string | null;
  onHover: (key: string | null) => void;
}) {
  return (
    <svg viewBox={`0 0 ${file.widthPt} ${file.heightPt}`} style={{ width: '100%', border: '1px solid #ddd', background: '#fff' }}>
      {shapes.map((s) => {
        const p = planBy.get(s.key);
        const role = p?.role ?? 'ignore';
        const color = ROLE_COLORS[role];
        const hot = hoverKey === s.key;
        const common = { onMouseEnter: () => onHover(s.key), onMouseLeave: () => onHover(null), style: { cursor: 'pointer' } };
        if (role === 'line' || s.kind === 'connector') {
          const { start, end } = lineEndpoints(s);
          return (
            <g key={s.key} {...common}>
              <line x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} stroke={color} strokeWidth={hot ? 4 : 2} strokeDasharray={p?.lineType === 'XLine' ? '3 2' : undefined} />
              {s.tailArrow && <circle cx={end[0]} cy={end[1]} r={hot ? 4 : 2.5} fill={color} />}
              {s.headArrow && <circle cx={start[0]} cy={start[1]} r={hot ? 4 : 2.5} fill={color} />}
            </g>
          );
        }
        const faded = role === 'ignore' || role === 'timeArrow';
        return (
          <g key={s.key} {...common}>
            <rect x={s.x} y={s.y} width={Math.max(1, s.w)} height={Math.max(1, s.h)}
              fill={color} fillOpacity={hot ? 0.45 : faded ? 0.04 : 0.15}
              stroke={color} strokeWidth={hot ? 2.5 : 1}
              strokeDasharray={role === 'sdsgLabel' || role === 'subLabel' || role === 'note' ? '3 2' : undefined} />
            {(role === 'sd' || role === 'sg') && (
              <text x={s.x + 3} y={s.y + 11} fontSize={10} fill={color} fontWeight="bold">{role.toUpperCase()}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
