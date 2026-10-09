// 「文字だけ」メモ（★・〇 などの強調の記号）の出力（2026-10-09 利用者の要望）
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { exportToPPTX } from './exportPPT';
import { buildSVGDocuments } from './exportSVGNative';
import { DEFAULT_SETTINGS } from '../store/defaults';
import type { ProjectSettings, Sheet } from '../types';

const sheet = {
  id: 'S1', name: 'S1', lines: [], sdsg: [], periodLabels: [],
  boxes: [{ id: 'B1', type: 'normal', label: 'box', x: 0, y: 0, width: 100, height: 60 }],
  notes: [{ id: 'Note1', x: 90, y: -18, width: 36, height: 36, text: '★', style: 'text', fontSize: 24, color: '#d33' }],
} as unknown as Sheet;
const settings: ProjectSettings = {
  ...DEFAULT_SETTINGS,
  timeArrow: { ...DEFAULT_SETTINGS.timeArrow, autoInsert: false, alwaysVisible: false, label: '' },
  legend: { ...DEFAULT_SETTINGS.legend, alwaysVisible: false, includeInExport: false },
};

describe('文字だけのメモ', () => {
  it('PPTX: 枠・塗りなしで、記号を中央に、指定の色で書く', async () => {
    const bytes = await exportToPPTX({ sheet, settings, scale: false, returnBytes: true });
    const zip = await JSZip.loadAsync(bytes as Uint8Array);
    const xml = await zip.file('ppt/slides/slide1.xml')!.async('string');
    const at = xml.indexOf('<a:t>★</a:t>');
    expect(at).toBeGreaterThan(0);
    const sp = xml.slice(xml.lastIndexOf('<p:sp>', at), at);
    expect(sp).not.toMatch(/<a:solidFill><a:srgbClr val="FFF8C5"/);
    expect(sp).toMatch(/<a:ln[^>]*>\s*<a:noFill\s*\/>|<a:ln[^/]*\/>|^((?!<a:ln).)*$/s);
    expect(sp).toMatch(/algn="ctr"/);
    expect(sp).toMatch(/anchor="ctr"/);
    // 3 桁の色（#d33）は 6 桁に広げる（以前は黒になっていた）
    expect(sp).toMatch(/srgbClr val="DD3333"/);
  }, 30_000);

  it('SVG: 枠の矩形を描かず、記号を指定の色で書く', () => {
    const svg = buildSVGDocuments({ sheet, settings, scale: false })[0];
    expect(svg).toMatch(/<text[^>]*fill="#d33"[^>]*>★<\/text>/);
    // 付箋の黄色・吹き出しの枠色の矩形が無い
    expect(svg).not.toMatch(/fill="#fff8c5"/);
  });
});
