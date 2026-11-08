// 新しい図の言語は画面の言語にする（2026-11-08 英語化）
// - 新規作成・起動時の空の図・作例は、画面の言語（i18n.language）で図の言語（settings.locale）と既定の文字を入れる
// - 既存のファイルを開いたときは、そのファイルの locale を使う（loadDocument は変えない）
// - 日本語の画面では、これまでと 1 字も変わらない
import { describe, it, expect, afterEach } from 'vitest';
import i18n from '../i18n';
import {
  createEmptyDocument,
  createSampleDocument,
  createDefaultSettings,
  currentUILocale,
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  fontOptionLabel,
} from './defaults';
import { useTEMStore } from './store';
import { BUILTIN_THEMES } from '../utils/boxThemes';
import { BUILTIN_PRESETS } from '../utils/exportPresets';
import { PAPER_SIZE_OPTIONS } from '../utils/paperSizes';
import { OVERLAP_CHECK_LABELS } from '../utils/overlapDetect';
import { choiceCautions } from '../utils/exportContent';

afterEach(async () => {
  await i18n.changeLanguage('ja');
  useTEMStore.getState().resetDocument();
});

describe('新しい図の言語＝画面の言語', () => {
  it('日本語の画面: これまでどおり日本語の図（既定値も同じ）', () => {
    expect(currentUILocale()).toBe('ja');
    const doc = createEmptyDocument();
    expect(doc.settings.locale).toBe('ja');
    expect(doc.settings.timeArrow.label).toBe('非可逆的時間');
    expect(doc.settings.legend.title).toBe('凡例');
    expect(doc.settings.timeArrow.label).toBe(DEFAULT_SETTINGS.timeArrow.label);
    expect(doc.settings.legend.title).toBe(DEFAULT_SETTINGS.legend.title);
    const sample = createSampleDocument();
    expect(sample.sheets[0].name).toBe('参加者A');
    expect(sample.sheets[0].boxes.map((b) => b.label)).toEqual(['出発点', '必須通過点', '分岐点', '等至点', '両極化した等至点']);
    expect(sample.sheets[0].periodLabels.map((p) => p.label)).toEqual(['時期1', '時期2']);
    expect(sample.metadata.author).toBe('中田友貴');
  });

  it('英語の画面: 新しい図は英語（locale・時間の矢印・凡例の題）', async () => {
    await i18n.changeLanguage('en');
    expect(currentUILocale()).toBe('en');
    const doc = createEmptyDocument();
    expect(doc.settings.locale).toBe('en');
    expect(doc.settings.timeArrow.label).toBe('Irreversible time');
    expect(doc.settings.legend.title).toBe('Legend');
    // 既定の設定そのもの（古いファイルの補完に使う）は変えない
    expect(DEFAULT_SETTINGS.locale).toBe('ja');
    expect(DEFAULT_SETTINGS.timeArrow.label).toBe('非可逆的時間');
  });

  it('英語の画面: 作例の Box・時期ラベルも英語', async () => {
    await i18n.changeLanguage('en');
    const sample = createSampleDocument();
    expect(sample.settings.locale).toBe('en');
    expect(sample.sheets[0].name).toBe('Participant A');
    expect(sample.sheets[0].boxes[0].label).toBe('Starting point');
    expect(sample.sheets[0].periodLabels.map((p) => p.label)).toEqual(['Period 1', 'Period 2']);
  });

  it('locale を渡せば画面の言語によらずその言語で作る', () => {
    const settings = createDefaultSettings('en');
    expect(settings.locale).toBe('en');
    expect(settings.timeArrow.label).toBe('Irreversible time');
    expect(createEmptyDocument('ja').settings.timeArrow.label).toBe('非可逆的時間');
  });

  it('新規作成（resetDocument）は画面の言語。既存のファイルを開いたらそのファイルの locale', async () => {
    await i18n.changeLanguage('en');
    useTEMStore.getState().resetDocument();
    expect(useTEMStore.getState().doc.settings.locale).toBe('en');
    // 日本語のファイルを開く
    useTEMStore.getState().loadDocument(createEmptyDocument('ja'));
    expect(useTEMStore.getState().doc.settings.locale).toBe('ja');
    expect(useTEMStore.getState().doc.settings.timeArrow.label).toBe('非可逆的時間');
  });

  it('足した Box の最初の文字は図の言語（画面の言語ではない）', async () => {
    useTEMStore.getState().loadDocument(createEmptyDocument('en'));
    const id = useTEMStore.getState().addBox();
    const sheet = useTEMStore.getState().doc.sheets[0];
    expect(sheet.boxes.find((b) => b.id === id)?.label).toBe('New box');
    useTEMStore.getState().loadDocument(createEmptyDocument('ja'));
    await i18n.changeLanguage('en');
    const id2 = useTEMStore.getState().addBox();
    expect(useTEMStore.getState().doc.sheets[0].boxes.find((b) => b.id === id2)?.label).toBe('新規Box');
  });
});

describe('定数の表示名は画面の言語', () => {
  it('日本語の画面: これまでどおり', () => {
    expect(BUILTIN_THEMES[0].name).toBe('モノクロ（既定）');
    expect(BUILTIN_PRESETS[0].name).toBe('既定（A4 横）');
    expect(PAPER_SIZE_OPTIONS[0].label).toBe('A4 横');
    expect(OVERLAP_CHECK_LABELS.boxBox).toBe('Box 同士の重なり');
    expect(fontOptionLabel(FONT_OPTIONS[0])).toBe('システム標準');
    expect(choiceCautions({ legend: false })[0]).toBe('凡例を含めずに出力します。記号の意味を図の説明や本文で示してください。');
  });

  it('英語の画面: 英語で引く', async () => {
    await i18n.changeLanguage('en');
    expect(BUILTIN_THEMES[0].name).toBe('Monochrome (default)');
    expect(BUILTIN_PRESETS[0].name).toBe('Default (A4 landscape)');
    expect(PAPER_SIZE_OPTIONS[4].label).toBe('16:9 slide (13.33 × 7.5 in)');
    expect(OVERLAP_CHECK_LABELS.boxBox).toBe('Overlapping boxes');
    expect(fontOptionLabel(FONT_OPTIONS[0])).toBe('System default');
    expect(fontOptionLabel(FONT_OPTIONS[6])).toBe('Arial');
  });
});
