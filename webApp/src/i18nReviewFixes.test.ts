// 英語化のレビュー（2026-11-08・Codex と独立レビュー）で直した点の検査
import { describe, it, expect, afterEach } from 'vitest';
import i18n from './i18n';
import { initialUILanguage, hasPriorUse } from './utils/uiLanguage';
import { useTEMStore } from './store/store';
import { summarizeCodes, type MaxqdaSegment } from './utils/maxqdaImport';
import { mapBoxType } from './utils/csvImport';
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
    expect(s.timeArrow.label).toBe('Irreversible time');
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
