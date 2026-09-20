// computeContentBounds のゴールデンテスト
// 同梱デモ 2 本の bounding box を固定し、ジオメトリの共通化リファクタで
// fit（全体表示）の結果が動いていないことを保証する。
import { describe, it, expect } from 'vitest';
import { computeContentBounds } from './fitBounds';
import { hydrateDocument } from './hydrate';
import type { TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';
import kanzakiEnRaw from '../../sample-tem/kanzaki2021_figure1_en.tem?raw';

const load = (raw: string) => hydrateDocument(JSON.parse(raw) as TEMDocument);

describe('computeContentBounds（ゴールデン）', () => {
  it('日本語デモの各シートの bbox が変わらない', () => {
    const doc = load(kanzakiRaw);
    const result = doc.sheets.map((sheet) => {
      const r = computeContentBounds(sheet, doc.settings.layout, doc.settings);
      return r && {
        x: Math.round(r.x), y: Math.round(r.y),
        width: Math.round(r.width), height: Math.round(r.height),
      };
    });
    expect(result).toMatchSnapshot();
  });

  it('英語デモの各シートの bbox が変わらない', () => {
    const doc = load(kanzakiEnRaw);
    const result = doc.sheets.map((sheet) => {
      const r = computeContentBounds(sheet, doc.settings.layout, doc.settings);
      return r && {
        x: Math.round(r.x), y: Math.round(r.y),
        width: Math.round(r.width), height: Math.round(r.height),
      };
    });
    expect(result).toMatchSnapshot();
  });
});
