// 英語化のレビュー（2026-11-08・Codex と独立レビュー）で直した点の検査
import { describe, it, expect, afterEach } from 'vitest';
import i18n from './i18n';
import { initialUILanguage, hasPriorUse, settleUILanguage } from './utils/uiLanguage';
import { detectTypePrefix } from './utils/pptxImport';
import { useTEMStore } from './store/store';
import { summarizeCodes, type MaxqdaSegment } from './utils/maxqdaImport';
import { mapBoxType, mapSDSGType, mapLineType } from './utils/csvImport';
import { BOX_TYPE_LABELS } from './store/defaults';

afterEach(async () => {
  await i18n.changeLanguage('ja');
  useTEMStore.getState().resetDocument();
});

describe('初めの画面の言語', () => {
  it('保存した好みがあればそれを使う', () => {
    expect(initialUILanguage('en', 'ja-JP', true)).toBe('en');
    expect(initialUILanguage('ja', 'en-US', false)).toBe('ja');
  });
  it('今までの利用者は、ブラウザが英語でも日本語で始める', () => {
    expect(initialUILanguage(null, 'en-US', true)).toBe('ja');
  });
  it('初めての利用者はブラウザの言語に従う', () => {
    expect(initialUILanguage(null, 'en-US', false)).toBe('en');
    expect(initialUILanguage(null, 'ja-JP', false)).toBe('ja');
  });
  it('今までの利用者の印は、言語の好み以外の temer: / temer. の値', () => {
    expect(hasPriorUse(['temer:snapEnabled'])).toBe(true);
    expect(hasPriorUse(['temer.changelog.lastSeen'])).toBe(true);
    expect(hasPriorUse(['temer.uiLanguage'])).toBe(false);
    expect(hasPriorUse(['other-app'])).toBe(false);
  });
});

describe('図の言語を変えたときの凡例の題と時間の矢印の文字', () => {
  it('既定の文字のままなら新しい言語の既定に替わる', () => {
    const st = useTEMStore.getState();
    st.setLocale('en');
    const s = useTEMStore.getState().doc.settings;
    expect(s.legend.title).toBe('Legend');
    expect(s.timeArrow.label).toBe('Irreversible Time');
    useTEMStore.getState().setLocale('ja');
    const s2 = useTEMStore.getState().doc.settings;
    expect(s2.legend.title).toBe('凡例');
    expect(s2.timeArrow.label).toBe('非可逆的時間');
  });
  it('利用者が書き換えた文字は残す', () => {
    useTEMStore.setState((st) => ({ doc: { ...st.doc, settings: { ...st.doc.settings, legend: { ...st.doc.settings.legend, title: '記号の説明' } } } }));
    useTEMStore.getState().setLocale('en');
    expect(useTEMStore.getState().doc.settings.legend.title).toBe('記号の説明');
  });
});

describe('英語の単数と複数', () => {
  it('件数が 1 のときだけ単数の形になる', () => {
    expect(i18n.t('ribbon:home.copy.title', { count: 1, lng: 'en' })).toBe('Copy 1 selected item');
    expect(i18n.t('ribbon:home.copy.title', { count: 3, lng: 'en' })).toBe('Copy 3 selected items');
  });
  it('日本語はこれまでと同じ', () => {
    expect(i18n.t('ribbon:home.copy.title', { count: 1, lng: 'ja' })).toBe(i18n.t('ribbon:home.copy.title', { count: 3, lng: 'ja' }).replace('3', '1'));
  });
});

describe('種類名の表記（両極化した等至点・第 2 等至点）', () => {
  it('画面の表記は新しい名前、取り込みは新旧どちらも引ける', () => {
    expect(BOX_TYPE_LABELS['P-EFP'].ja).toBe('両極化した等至点');
    expect(BOX_TYPE_LABELS['2nd-EFP'].ja).toBe('第 2 等至点');
    expect(BOX_TYPE_LABELS['P-2nd-EFP'].ja).toBe('両極化した第 2 等至点');
    for (const [raw, type] of [
      ['両極化した等至点', 'P-EFP'], ['両極化等至点', 'P-EFP'],
      ['第 2 等至点', '2nd-EFP'], ['第2等至点', '2nd-EFP'], ['第二等至点', '2nd-EFP'],
      ['両極化した第 2 等至点', 'P-2nd-EFP'], ['両極化第二等至点', 'P-2nd-EFP'],
    ] as const) expect(mapBoxType(raw)).toBe(type);
  });
  it('MAXQDA の部分一致は長い語から試す（短い語に先に当たらない）', () => {
    const seg = (code: string) => ({ docName: 'd', codes: [code] }) as unknown as MaxqdaSegment;
    const byCode = Object.fromEntries(
      summarizeCodes([seg('両極化等至点の選択'), seg('P-EFPの選択'), seg('潜在経験の想定')]).map((c) => [c.code, c.suggestedType]),
    );
    expect(byCode).toEqual({ '両極化等至点の選択': 'P-EFP', 'P-EFPの選択': 'P-EFP', '潜在経験の想定': 'annotation' });
  });
});

describe('SG の呼び名（社会的助勢）と TEM の英語名（Modeling）', () => {
  it('表示は社会的助勢、英語名は Modeling', () => {
    expect(i18n.t('terms:SG', { lng: 'ja' })).toBe('社会的助勢（SG）');
    expect(i18n.t('terms:tem', { lng: 'en' })).toBe('Trajectory Equifinality Modeling (TEM)');
    expect(i18n.t('exportReport:sdsg.SG', { lng: 'ja' })).toBe('社会的助勢 (SG)');
  });
  it('取り込みは旧称も SG として読む', () => {
    for (const w of ['社会的助勢', '社会的ガイド', '社会的ガイダンス', '社会的支援']) expect(mapSDSGType(w)).toBe('SG');
  });
});

describe('凡例と用語の表の英語（Irreversible Time・Solid path）', () => {
  it('用語の表は凡例と同じ英語', () => {
    expect(i18n.t('terms:timeArrow', { lng: 'en' })).toBe('Irreversible Time');
    expect(i18n.t('terms:line.RLine', { lng: 'en' })).toBe('Solid path');
    expect(i18n.t('terms:line.XLine', { lng: 'en' })).toBe('Dashed path');
  });
  it('前の既定 Irreversible time の図も、図の言語を日本語にすると非可逆的時間に替わる', () => {
    useTEMStore.getState().setLocale('en');
    useTEMStore.setState((st) => ({ doc: { ...st.doc, settings: { ...st.doc.settings, timeArrow: { ...st.doc.settings.timeArrow, label: 'Irreversible time' } } } }));
    useTEMStore.getState().setLocale('ja');
    expect(useTEMStore.getState().doc.settings.timeArrow.label).toBe('非可逆的時間');
  });
  it('取り込みは新旧どちらの英語も線として読む', () => {
    expect(mapLineType('Solid path')).toBe('RLine');
    expect(mapLineType('Dashed path')).toBe('XLine');
    expect(mapLineType('Solid arrow')).toBe('RLine');
  });
});

describe('2 回目のレビューの指摘', () => {
  it('図の言語を変えたら「変更あり」になる（同じ言語なら変えない）', () => {
    useTEMStore.setState({ dirty: false });
    useTEMStore.getState().setLocale('ja');
    expect(useTEMStore.getState().dirty).toBe(false);
    useTEMStore.getState().setLocale('en');
    expect(useTEMStore.getState().dirty).toBe(true);
  });
  it('PPTX の種類の照合は「両極化した」の新しい表記も読む', () => {
    expect(detectTypePrefix('両極化した等至点 進学しない')?.type).toBe('P-EFP');
    expect(detectTypePrefix('両極化した第 2 等至点 転職しない')?.type).toBe('P-2nd-EFP');
    expect(detectTypePrefix('第 2 等至点 転職')?.type).toBe('2nd-EFP');
    expect(detectTypePrefix('両極化等至点 進学しない')?.type).toBe('P-EFP');
  });
  it('言語の好みが無くても、自動保存の図が残っていれば日本語にする', async () => {
    expect(await settleUILanguage('en', async () => true, null)).toBe('ja');
    expect(await settleUILanguage('en', async () => false, null)).toBe('en');
    expect(await settleUILanguage('en', async () => { throw new Error('x'); }, null)).toBe('en');
    expect(await settleUILanguage('ja', async () => false, 'en')).toBe('en');
  });
});
