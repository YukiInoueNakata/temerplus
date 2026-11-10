// 取り込み系（CSV・PowerPoint・MAXQDA・逐語録・表のファイル）の英語化の検査（2026-11-08）
// - 英語の用語名（terms.csv の英語）も種別として受ける
// - 警告・エラー・列の表示名が画面の言語で出る（日本語の文は既存のテストが見ている）
import { describe, it, expect, afterEach } from 'vitest';
import i18n from '../i18n';
import {
  mapBoxType, mapSDSGType, mapLineType, buildLinesFromRows, buildBoxesFromRows,
  FIELD_LABELS, LINE_FIELD_LABELS, SDSG_FIELD_LABELS, PERIOD_LABEL_FIELD_LABELS,
} from './csvImport';
import { PPTX_ROLE_LABELS, parsePptx } from './pptxImport';
import {
  guessMaxqdaRole, dedupeSegments, summarizeCodes,
  MAXQDA_ROLE_LABELS, CODE_ACTION_LABELS, MULTI_BOX_MODE_LABELS,
} from './maxqdaImport';
import { parseTabularFile } from './tabularFile';
import { importTranscriptFile } from './transcriptImport';
import JSZip from 'jszip';

afterEach(async () => {
  await i18n.changeLanguage('ja');
});

describe('英語の用語名を種別として受ける', () => {
  it('Box の種別（大文字小文字を問わない）', () => {
    expect(mapBoxType('Bifurcation point')).toBe('BFP');
    expect(mapBoxType('equifinality point')).toBe('EFP');
    expect(mapBoxType('Polarized equifinality point')).toBe('P-EFP');
    expect(mapBoxType('Second equifinality point')).toBe('2nd-EFP');
    expect(mapBoxType('Polarized second equifinality point')).toBe('P-2nd-EFP');
    expect(mapBoxType('Obligatory passage point')).toBe('OPP');
    expect(mapBoxType('Latent experience')).toBe('annotation');
    // 日本語はこれまでどおり
    expect(mapBoxType('分岐点')).toBe('BFP');
    expect(mapBoxType('両極化第二等至点')).toBe('P-2nd-EFP');
  });

  it('SD/SG と Line の種別', () => {
    expect(mapSDSGType('Social direction')).toBe('SD');
    expect(mapSDSGType('Social guidance')).toBe('SG');
    expect(mapSDSGType('社会的ガイド')).toBe('SG');
    expect(mapLineType('Solid arrow')).toBe('RLine');
    expect(mapLineType('Dashed arrow')).toBe('XLine');
    expect(mapLineType('点線矢印')).toBe('XLine');
    expect(mapLineType('実線径路')).toBe('RLine'); // 2026-11-10 から画面の名前
    expect(mapLineType('点線径路')).toBe('XLine');
  });

  it('MAXQDA のコード名（英語）から種別と扱いを推測する（長い語が先に当たる）', () => {
    const header = ['Document name', 'Code', 'Beginning', 'End', 'Segment'];
    const mapping = header.map(guessMaxqdaRole);
    expect(mapping).toEqual(['docName', 'code', 'start', 'end', 'segment']);
    const rows = [
      header,
      ['A', 'TEM\\Polarized equifinality point', '1', '1', 'x'],
      ['A', 'TEM\\Second equifinality point', '2', '2', 'y'],
      ['A', 'Forces\\Social guidance', '3', '3', 'z'],
      ['A', 'Forces\\Social direction', '4', '4', 'w'],
    ];
    const byCode = Object.fromEntries(summarizeCodes(dedupeSegments(rows, { mapping, hasHeader: true }).segments).map((c) => [c.leaf, c]));
    expect(byCode['Polarized equifinality point'].suggestedType).toBe('P-EFP');
    expect(byCode['Second equifinality point'].suggestedType).toBe('2nd-EFP');
    expect(byCode['Social guidance'].suggestedAction).toBe('sg');
    expect(byCode['Social direction'].suggestedAction).toBe('sd');
  });
});

describe('画面の言語で出る文言', () => {
  it('列・役割の表示名は言語に追従し、キーの順は変わらない', async () => {
    const keys = Object.keys(FIELD_LABELS);
    expect(FIELD_LABELS.ignore).toBe('（無視）');
    expect(MAXQDA_ROLE_LABELS.docName).toBe('文書名（逐語録）');
    await i18n.changeLanguage('en');
    expect(Object.keys(FIELD_LABELS)).toEqual(keys);
    expect(FIELD_LABELS.ignore).toBe('(Ignore)');
    expect(FIELD_LABELS.timeLevel).toBe('Time Level');
    expect(LINE_FIELD_LABELS.type).toBe('Type (RLine/XLine)');
    expect(SDSG_FIELD_LABELS.attachedTo).toBe('Attached to (attachedTo)');
    expect(PERIOD_LABEL_FIELD_LABELS.position).toBe('Position (Time Level)');
    expect(PPTX_ROLE_LABELS.timeArrow).toBe('Time arrow (not imported)');
    expect(CODE_ACTION_LABELS.box).toBe('Make a Box');
    expect(MULTI_BOX_MODE_LABELS.sequence).toBe('Place in sequence over time');
    // 全部の値に日本語が残っていない
    const all = [FIELD_LABELS, LINE_FIELD_LABELS, SDSG_FIELD_LABELS, PERIOD_LABEL_FIELD_LABELS, PPTX_ROLE_LABELS, MAXQDA_ROLE_LABELS, CODE_ACTION_LABELS, MULTI_BOX_MODE_LABELS]
      .flatMap((o) => Object.values(o));
    expect(all.filter((v) => /[぀-ヿ㐀-鿿]/.test(v))).toEqual([]);
  });

  it('CSV 取り込みのエラー（日本語は従来どおり・英語の画面では英語）', async () => {
    const opts = { mapping: ['from', 'to'] as const, hasHeader: false, defaultType: 'RLine' as const, defaultShape: 'straight' as const, existingIds: new Set<string>(), validBoxIds: new Set(['B1']) };
    const rows = [['B1', 'B9'], ['', '']];
    expect(buildLinesFromRows(rows, { ...opts, mapping: [...opts.mapping] }).errors).toEqual([
      '行 1: to=B9 に該当する Box がないためスキップ',
      '行 2: from/to が空のためスキップ',
    ]);
    await i18n.changeLanguage('en');
    expect(buildLinesFromRows(rows, { ...opts, mapping: [...opts.mapping] }).errors).toEqual([
      'Row 1: skipped (no Box with to=B9)',
      'Row 2: skipped (from/to is empty)',
    ]);
    const boxes = buildBoxesFromRows([['']], {
      mapping: ['label'], hasHeader: false, defaultType: 'normal', defaultWidth: 100, defaultHeight: 50,
      startTimeLevel: 0, baseItemLevel: 0, autoConnect: false, existingIds: new Set(), levelPx: 100,
    } as Parameters<typeof buildBoxesFromRows>[1]);
    expect(boxes.errors).toEqual(['Row 1: skipped (empty label)']);
  });

  it('ファイルを開いたときのエラー', async () => {
    await i18n.changeLanguage('en');
    await expect(parseTabularFile(new File(['x'], 'a.pdf'))).rejects.toThrow('Unsupported format: a.pdf (supported: .csv / .tsv / .xlsx / .xls)');
    await expect(importTranscriptFile(new File(['x'], 'a.pdf'))).rejects.toThrow('Unsupported format: a.pdf\nSupported:');
    const zip = new JSZip();
    zip.file('dummy.txt', 'x');
    const bytes = await zip.generateAsync({ type: 'uint8array' });
    await expect(parsePptx(bytes)).rejects.toThrow('Could not read the file as PowerPoint');
    await i18n.changeLanguage('ja');
    await expect(parsePptx(bytes)).rejects.toThrow('PowerPoint のファイルとして読めませんでした（ppt/presentation.xml がありません）');
    await expect(parseTabularFile(new File(['x'], 'a.pdf'))).rejects.toThrow('対応していない形式です: a.pdf（対応: .csv / .tsv / .xlsx / .xls）');
  });
});
