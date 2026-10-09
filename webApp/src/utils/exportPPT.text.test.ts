// PPTX 出力の文字の大きさ・余白・SD/SG の形が画面と食い違わないことの回帰テスト（2026-10-09）
// 利用者の報告: PowerPoint に出力すると枠と文字の大きさがずれ、段落設定が崩れる・SD/SG が矢印になる。
// 原因は px を pt として渡していたこと（文字が 4/3 倍）、縮小時の下限、PowerPoint 既定の内側余白、
// SD/SG を軸の細いブロック矢印で描いていたこと。
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { hydrateDocument } from './hydrate';
import { exportToPPTX } from './exportPPT';
import { resolveBoxVisuals } from './boxPreset';
import type { TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';

async function exportSlideXml(scale: boolean) {
  const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
  const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId) ?? doc.sheets[0];
  const bytes = await exportToPPTX({ sheet, settings: doc.settings, scale, returnBytes: true });
  const zip = await JSZip.loadAsync(bytes as Uint8Array);
  const xml = await zip.file('ppt/slides/slide1.xml')!.async('string');
  return { doc, sheet, xml };
}

/** <a:t>text</a:t> を含む図形の、最初の run の sz（1/100 pt）と bodyPr の lIns（EMU） */
function textProps(xml: string, text: string) {
  const at = xml.indexOf(`<a:t>${text}</a:t>`);
  expect(at).toBeGreaterThan(0);
  const spStart = xml.lastIndexOf('<p:sp>', at);
  const sp = xml.slice(spStart, at);
  const sz = Number(sp.match(/<a:rPr[^>]*\ssz="(\d+)"/)?.[1]);
  const lIns = Number(sp.match(/<a:bodyPr[^>]*\slIns="(\d+)"/)?.[1]);
  const face = sp.match(/<a:ea typeface="([^"]+)"/)?.[1];
  return { sz, lIns, face, sp };
}

describe('PPTX 出力の文字', () => {
  it('等倍出力では Box の文字サイズが px × 0.75 pt、余白が画面の padding 4px 相当になる', async () => {
    const { doc, sheet, xml } = await exportSlideXml(false);
    const box = sheet.boxes.find((b) => b.label && !b.label.includes('\n') && !/[<>&]/.test(b.label))!;
    const px = resolveBoxVisuals(box, doc.settings).fontSize ?? doc.settings.defaultFontSize;
    const p = textProps(xml, box.label);
    expect(p.sz).toBe(Math.round(px * 0.75 * 100));
    // 4px = 3pt = 38100 EMU
    expect(p.lIns).toBe(38100);
    // フォント名を明示する（テーマ任せにしない）。jsdom では既定スタックの先頭が選ばれる
    expect(p.face).toBeTruthy();
    // 行送りを pt で明示する
    expect(p.sp).toMatch(/<a:lnSpc><a:spcPts val="\d+"\/><\/a:lnSpc>/);
  }, 30_000);

  it('縮小出力でも文字は枠と同じ倍率で縮む（下限で文字だけ大きく残らない）', async () => {
    const full = await exportSlideXml(false);
    const fit = await exportSlideXml(true);
    const label = full.sheet.boxes.find((b) => b.label && !b.label.includes('\n') && !/[<>&]/.test(b.label))!.label;
    const szFull = textProps(full.xml, label).sz;
    const szFit = textProps(fit.xml, label).sz;
    // 枠の幅の比と文字サイズの比が一致する（丸め誤差の範囲）
    const extOf = (sp: string) => Number(sp.match(/<a:ext cx="(\d+)"/)?.[1]);
    const ratioBox = extOf(textProps(fit.xml, label).sp) / extOf(textProps(full.xml, label).sp);
    expect(szFit / szFull).toBeCloseTo(ratioBox, 1);
  }, 30_000);
});

describe('PPTX 出力の SD/SG', () => {
  it('縦型では SD が左向き（180°）、SG が右向き（0°）＝画面どおり', async () => {
    const doc = hydrateDocument(JSON.parse(kanzakiRaw) as TEMDocument);
    const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId) ?? doc.sheets[0];
    const settings = { ...doc.settings, layout: 'vertical' as const };
    const bytes = await exportToPPTX({ sheet, settings, returnBytes: true });
    const zip = await JSZip.loadAsync(bytes as Uint8Array);
    const xml = await zip.file('ppt/slides/slide1.xml')!.async('string');
    // 図形ごとに rot（1/60000 度）と prst を拾う。凡例の図柄（横型と同じ上下向き）は除く
    const shapes = [...xml.matchAll(/<p:sp>.*?<\/p:sp>/gs)].map((m) => m[0]).filter((sp) => sp.includes('prst="homePlate"'));
    const rots = shapes.map((sp) => Number(sp.match(/<a:xfrm(?: rot="(\d+)")?/)?.[1] ?? 0) / 60000);
    const sdCount = sheet.sdsg.filter((g) => g.type === 'SD' && g.shape !== 'rect').length;
    const sgCount = sheet.sdsg.filter((g) => g.type === 'SG' && g.shape !== 'rect').length;
    expect(rots.filter((r) => r === 180).length).toBeGreaterThanOrEqual(sdCount);
    expect(rots.filter((r) => r === 0).length).toBeGreaterThanOrEqual(sgCount);
  }, 30_000);

  it('SD/SG は画面と同じ五角形（ホームベース）で描き、ブロック矢印は使わない', async () => {
    const { sheet, xml } = await exportSlideXml(true);
    const pentagons = (xml.match(/prst="homePlate"/g) ?? []).length;
    expect(pentagons).toBeGreaterThanOrEqual(sheet.sdsg.filter((g) => g.shape !== 'rect').length);
    expect(xml).not.toMatch(/prst="rightArrow"/);
    // 三角部分の長さ（adj）を画面の rectRatio に合わせて書く
    expect(xml).toMatch(/prst="homePlate"><a:avLst><a:gd name="adj" fmla="val \d+"\/>/);
  }, 30_000);
});
