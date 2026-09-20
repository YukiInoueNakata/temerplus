// 重なり検出のテスト
// - 合成した最小ケースで 4 種の検査が意図どおり効くこと
// - 同梱デモで、報告された BFP の重なり（サブラベル × 種別ラベル）を拾えること
// 計測は環境非依存の approximateMeasurer を注入して決定的にする。
import { describe, it, expect } from 'vitest';
import { detectOverlaps, countByKind, segmentIntersectsRect } from './overlapDetect';
import { approximateMeasurer } from './textMeasure';
import { hydrateDocument } from './hydrate';
import { DEFAULT_SETTINGS } from '../store/defaults';
import type { ProjectSettings, Sheet, TEMDocument } from '../types';
import kanzakiRaw from '../../sample-tem/kanzaki2021_figure1.tem?raw';
import kanzakiEnRaw from '../../sample-tem/kanzaki2021_figure1_en.tem?raw';

const opts = { measure: approximateMeasurer };

const emptySheet = (): Sheet => ({
  id: 'S1', name: 'S1', boxes: [], lines: [], sdsg: [], periodLabels: [],
} as unknown as Sheet);

/** 時間軸・凡例・時期ラベルを切った、Box だけを見る設定 */
const bareSettings = (): ProjectSettings => ({
  ...DEFAULT_SETTINGS,
  timeArrow: { ...DEFAULT_SETTINGS.timeArrow, autoInsert: false, alwaysVisible: false, label: '' },
  legend: { ...DEFAULT_SETTINGS.legend, alwaysVisible: false },
});

describe('segmentIntersectsRect', () => {
  const r = { x: 0, y: 0, width: 10, height: 10 };
  it('矩形を貫く線分を検出する', () => {
    expect(segmentIntersectsRect({ x: -5, y: 5 }, { x: 15, y: 5 }, r)).toBe(true);
  });
  it('端点が内側にある線分を検出する', () => {
    expect(segmentIntersectsRect({ x: 5, y: 5 }, { x: 50, y: 50 }, r)).toBe(true);
  });
  it('外れている線分は検出しない', () => {
    expect(segmentIntersectsRect({ x: -5, y: 20 }, { x: 15, y: 20 }, r)).toBe(false);
  });
});

describe('detectOverlaps: Box 同士の重なり', () => {
  it('重なった Box の対を 1 件返す', () => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'A', type: 'normal', label: 'a', x: 0, y: 0, width: 100, height: 50 },
      { id: 'B', type: 'normal', label: 'b', x: 50, y: 0, width: 100, height: 50 },
    ] as Sheet['boxes'];
    const issues = detectOverlaps(sheet, 'horizontal', bareSettings(), opts);
    const boxBox = issues.filter((i) => i.kind === 'boxBox');
    expect(boxBox).toHaveLength(1);
    expect(boxBox[0].targets.map((t) => t.id).sort()).toEqual(['A', 'B']);
  });

  it('離れている Box は検出しない', () => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'A', type: 'normal', label: 'a', x: 0, y: 0, width: 100, height: 50 },
      { id: 'B', type: 'normal', label: 'b', x: 200, y: 0, width: 100, height: 50 },
    ] as Sheet['boxes'];
    expect(detectOverlaps(sheet, 'horizontal', bareSettings(), opts)
      .filter((i) => i.kind === 'boxBox')).toHaveLength(0);
  });

  it('checks で切ると検出しない', () => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'A', type: 'normal', label: 'a', x: 0, y: 0, width: 100, height: 50 },
      { id: 'B', type: 'normal', label: 'b', x: 50, y: 0, width: 100, height: 50 },
    ] as Sheet['boxes'];
    const issues = detectOverlaps(sheet, 'horizontal', bareSettings(), {
      ...opts, checks: { boxBox: false },
    });
    expect(issues.filter((i) => i.kind === 'boxBox')).toHaveLength(0);
  });
});

describe('detectOverlaps: テキストのはみ出し', () => {
  // 本文は pre-wrap で自動折返しされる。したがって
  //   - 日本語は文字単位で折り返せるので横にはみ出さない
  //   - 折り返せない長い英単語は横にはみ出す
  // また自動調整が効いている方向は描画側が吸収するので対象外になる。
  const boxWith = (label: string, extra: Record<string, unknown> = {}) => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'A', type: 'normal', label, x: 0, y: 0, width: 60, height: 30, ...extra },
    ] as Sheet['boxes'];
    return sheet;
  };
  const overflowIssues = (sheet: Sheet, settings = bareSettings()) =>
    detectOverlaps(sheet, 'horizontal', settings, opts).filter((i) => i.kind === 'textOverflow');

  it('折り返せない長い英単語は横のはみ出しとして検出する', () => {
    const issues = overflowIssues(boxWith('Relationships'));
    expect(issues).toHaveLength(1);
    expect(issues[0].targets[0].id).toBe('A');
    expect(issues[0].message).toContain('横に');
  });

  it('日本語は折り返されるので横のはみ出しにはならない', () => {
    // 既定は width-fixed（高さ自動）なので縦のはみ出しも対象外
    expect(overflowIssues(boxWith('とても長い本文がここに入っていて収まらない'))).toHaveLength(0);
  });

  it('自動調整なしなら、折り返した結果の縦のはみ出しを検出する', () => {
    const settings = { ...bareSettings(), defaultAutoFitBoxMode: 'none' as const };
    const issues = overflowIssues(boxWith('とても長い本文がここに入っていて収まらない'), settings);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('縦に');
  });

  it('autoFitText が有効な Box は対象外（文字サイズが縮んで収まるため）', () => {
    const settings = { ...bareSettings(), defaultAutoFitBoxMode: 'none' as const };
    expect(overflowIssues(boxWith('とても長い本文がここに入っていて収まらない', { autoFitText: true }), settings))
      .toHaveLength(0);
  });

  it('収まっている本文は検出しない', () => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'A', type: 'normal', label: 'あ', x: 0, y: 0, width: 200, height: 100 },
    ] as Sheet['boxes'];
    expect(overflowIssues(sheet)).toHaveLength(0);
  });
});

describe('detectOverlaps: ラベル類の重なり', () => {
  // 横型では 種別ラベル = 枠の上 / サブラベル = 枠の下。
  // 上下に近接した 2 つの Box では、下の Box の種別ラベルと
  // 上の Box のサブラベルが同じ隙間に入って衝突する（デモで実際に起きた形）。
  const stacked = (gap: number): Sheet => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'UP', type: 'BFP', label: 'u', subLabel: 'A 分岐点', x: 0, y: 0, width: 100, height: 80 },
      { id: 'DOWN', type: 'BFP', label: 'd', subLabel: 'B 分岐点', x: 0, y: 80 + gap, width: 100, height: 80 },
    ] as Sheet['boxes'];
    return sheet;
  };

  it('隙間が狭いと サブラベル × 種別ラベル を検出する', () => {
    const issues = detectOverlaps(stacked(20), 'horizontal', bareSettings(), opts)
      .filter((i) => i.kind === 'labelLabel');
    expect(issues.length).toBeGreaterThan(0);
    const parts = issues[0].targets.map((t) => t.part).sort();
    expect(parts).toEqual(['subLabel', 'typeLabel']);
  });

  it('隙間を広げれば検出しない', () => {
    const issues = detectOverlaps(stacked(120), 'horizontal', bareSettings(), opts)
      .filter((i) => i.kind === 'labelLabel');
    expect(issues).toHaveLength(0);
  });

  it('同じ要素の部位どうしは対象にしない', () => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'ONLY', type: 'BFP', label: 'x', subLabel: 'A 分岐点', x: 0, y: 0, width: 100, height: 80 },
    ] as Sheet['boxes'];
    expect(detectOverlaps(sheet, 'horizontal', bareSettings(), opts)
      .filter((i) => i.kind === 'labelLabel')).toHaveLength(0);
  });
});

describe('detectOverlaps: 矢印とラベルの衝突', () => {
  it('無関係な Box を貫く矢印を検出する', () => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'FROM', type: 'normal', label: 'f', x: 0, y: 0, width: 60, height: 40 },
      { id: 'MID', type: 'normal', label: 'm', x: 150, y: 0, width: 60, height: 40 },
      { id: 'TO', type: 'normal', label: 't', x: 300, y: 0, width: 60, height: 40 },
    ] as Sheet['boxes'];
    sheet.lines = [
      { id: 'L1', type: 'RLine', from: 'FROM', to: 'TO', connectionMode: 'center-to-center', shape: 'straight' },
    ] as Sheet['lines'];
    const issues = detectOverlaps(sheet, 'horizontal', bareSettings(), opts)
      .filter((i) => i.kind === 'lineLabel');
    expect(issues.some((i) => i.targets.some((t) => t.id === 'MID'))).toBe(true);
  });

  it('始点・終点の Box は衝突として数えない', () => {
    const sheet = emptySheet();
    sheet.boxes = [
      { id: 'FROM', type: 'normal', label: 'f', x: 0, y: 0, width: 60, height: 40 },
      { id: 'TO', type: 'normal', label: 't', x: 200, y: 0, width: 60, height: 40 },
    ] as Sheet['boxes'];
    sheet.lines = [
      { id: 'L1', type: 'RLine', from: 'FROM', to: 'TO', connectionMode: 'center-to-center', shape: 'straight' },
    ] as Sheet['lines'];
    const issues = detectOverlaps(sheet, 'horizontal', bareSettings(), opts)
      .filter((i) => i.kind === 'lineLabel');
    expect(issues).toHaveLength(0);
  });
});

describe('同梱デモでの検出', () => {
  const load = (raw: string) => hydrateDocument(JSON.parse(raw) as TEMDocument);

  it('日本語デモで BFP のサブラベル × 種別ラベルを拾う', () => {
    const doc = load(kanzakiRaw);
    const sheet = doc.sheets[1];
    const issues = detectOverlaps(sheet, doc.settings.layout, doc.settings, opts);
    const labelHits = issues.filter((i) => i.kind === 'labelLabel');
    const bfp = labelHits.find((i) => i.targets.some((t) => t.id.startsWith('BFP_')));
    expect(bfp, `検出された labelLabel: ${JSON.stringify(labelHits.map((i) => i.message))}`).toBeTruthy();
  });

  it('英語デモでも同じ箇所を拾う', () => {
    const doc = load(kanzakiEnRaw);
    const sheet = doc.sheets[1];
    const issues = detectOverlaps(sheet, doc.settings.layout, doc.settings, opts);
    expect(issues.filter((i) => i.kind === 'labelLabel')
      .some((i) => i.targets.some((t) => t.id.startsWith('BFP_')))).toBe(true);
  });

  it('countByKind が種別ごとに数える', () => {
    const doc = load(kanzakiRaw);
    const issues = detectOverlaps(doc.sheets[1], doc.settings.layout, doc.settings, opts);
    const counts = countByKind(issues);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(issues.length);
  });
});
