import { describe, it, expect } from 'vitest';
import { computeLegendItems } from './legend';
import { DEFAULT_SETTINGS } from '../store/defaults';
import type { Sheet } from '../types';

// 最小シート: Box 2 種 + 実線/点線径路 + SD/SG を 1 つずつ
function makeSheet(): Sheet {
  return {
    id: 'sheet-1',
    name: 'Sheet 1',
    boxes: [
      { id: 'B1', type: 'EFP', text: 'a', itemLevel: 0, timeLevel: 0, width: 100, height: 40 },
      { id: 'B2', type: 'OPP', text: 'b', itemLevel: 1, timeLevel: 1, width: 100, height: 40 },
    ],
    lines: [
      { id: 'L1', type: 'RLine', from: 'B1', to: 'B2' },
      { id: 'L2', type: 'XLine', from: 'B2', to: 'B1' },
    ],
    sdsg: [
      { id: 'SD_1', type: 'SD', text: 'sd', itemLevel: 0, timeLevel: 0 },
      { id: 'SG_1', type: 'SG', text: 'sg', itemLevel: 0, timeLevel: 1 },
    ],
  } as unknown as Sheet;
}

const legendSettings = { ...DEFAULT_SETTINGS.legend, includeTimeArrow: true };

describe('computeLegendItems の locale 切替', () => {
  it('既定（引数省略）は日本語ラベルを返す', () => {
    const items = computeLegendItems(makeSheet(), legendSettings);
    const byKey = Object.fromEntries(items.map((i) => [i.key, i]));
    expect(byKey['EFP'].label).toBe('等至点');
    expect(byKey['RLine'].label).toBe('実線径路');
    expect(byKey['timeArrow'].label).toBe('非可逆的時間');
    expect(byKey['SD'].description).toContain('社会的方向づけ');
  });

  it("locale='ja' は既定と同じ", () => {
    const a = computeLegendItems(makeSheet(), legendSettings);
    const b = computeLegendItems(makeSheet(), legendSettings, 'ja');
    expect(b).toEqual(a);
  });

  it("locale='en' は英語ラベル・英語説明を返す", () => {
    const items = computeLegendItems(makeSheet(), legendSettings, 'en');
    const byKey = Object.fromEntries(items.map((i) => [i.key, i]));
    expect(byKey['EFP'].label).toBe('EFP');
    expect(byKey['EFP'].description).toBe('Equifinality Point');
    expect(byKey['OPP'].label).toBe('OPP');
    expect(byKey['RLine'].label).toBe('Solid path');
    expect(byKey['XLine'].description).toBe('Imagined (unrealized) path');
    expect(byKey['SD'].description).toContain('Social Direction');
    expect(byKey['SG'].description).toContain('Social Guidance');
    expect(byKey['timeArrow'].label).toBe('Irreversible Time');
  });

  it('locale を変えても項目の key と並び順は変わらない（itemOverrides のキー互換）', () => {
    const ja = computeLegendItems(makeSheet(), legendSettings, 'ja').map((i) => `${i.category}:${i.key}`);
    const en = computeLegendItems(makeSheet(), legendSettings, 'en').map((i) => `${i.category}:${i.key}`);
    expect(en).toEqual(ja);
  });
});
