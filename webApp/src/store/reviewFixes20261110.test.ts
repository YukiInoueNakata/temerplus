// 2026-11-10 の点検（Codex・独立のレビュー）の指摘の直しの回帰テスト
import { describe, it, expect, afterEach } from 'vitest';
import { useTEMStore } from './store';
import { hydrateDocument } from '../utils/hydrate';
import { textSizesOnPaper } from '../utils/readability';
import type { TEMDocument } from '../types';
import demoRaw from '../../sample-tem/fictional_piano_demo.tem?raw';

const sheet = () => { const s = useTEMStore.getState(); return s.doc.sheets.find((sh) => sh.id === s.doc.activeSheetId)!; };
afterEach(() => { useTEMStore.getState().resetDocument(); });

describe('開いたときの画面合わせ', () => {
  it('ファイルを開くと画面を合わせるが、別窓の同期（fit: false）では合わせない', () => {
    const doc = JSON.parse(demoRaw) as TEMDocument;
    const c0 = useTEMStore.getState().fitCounter;
    useTEMStore.getState().loadDocument(doc);
    expect(useTEMStore.getState().fitCounter).toBe(c0 + 1);
    expect(useTEMStore.getState().fitMode).toBe('initial');
    useTEMStore.getState().loadDocument(doc, { fit: false });
    expect(useTEMStore.getState().fitCounter).toBe(c0 + 1);
  });
});

describe('metadata の無い .tem', () => {
  it('読み込みで title・作成日・更新日を補う', () => {
    const raw = JSON.parse(demoRaw) as Record<string, unknown>;
    delete raw.metadata;
    const d = hydrateDocument(raw as unknown as TEMDocument);
    expect(d.metadata.title).toBe('');
    expect(typeof d.metadata.createdAt).toBe('string');
    expect(d.metadata.reportOptions).toBeUndefined();
  });
});

describe('径路の途中に Box を挟んだとき', () => {
  it('元の径路のコメントは、分けた最初の径路に付け替える', () => {
    const st = useTEMStore.getState();
    const a = st.addBox({ type: 'normal', label: 'A', x: 0, y: 0 });
    const b = st.addBox({ type: 'normal', label: 'B', x: 400, y: 0 });
    const l = st.addLine(a, b);
    st.addComment(l, '径路のコメント');
    useTEMStore.getState().insertBoxesBetween(a, b, 1, 'simple');
    const sh = sheet();
    // 分けた最初の径路が同じ ID を受け継ぐこともある。コメントが今ある径路（A から出る径路）に付いていればよい
    expect(sh.lines.find((x) => x.from === a && x.to === b)).toBeUndefined();
    const c = sh.comments.find((x) => x.text === '径路のコメント')!;
    const target = sh.lines.find((x) => x.id === c.targetId)!;
    expect(target).toBeDefined();
    expect(target.from).toBe(a);
  });
});

describe('紙面の文字の点検', () => {
  it('SD/SG の種別ラベルとサブラベルも数える（隠した種別ラベルは数えない）', () => {
    const d = hydrateDocument(JSON.parse(demoRaw) as TEMDocument);
    const sh = d.sheets[0];
    sh.sdsg[0] = { ...sh.sdsg[0], typeLabelFontSize: 8, subLabel: '補足', subLabelFontSize: 6 };
    const items = textSizesOnPaper(d).filter((x) => x.id === sh.sdsg[0].id);
    expect(items.map((x) => x.kind).sort()).toEqual(['sdsg', 'subLabel', 'typeLabel']);
    expect(items.find((x) => x.kind === 'typeLabel')!.pt).toBeCloseTo(6);
    d.settings.typeLabelVisibility = { ...(d.settings.typeLabelVisibility ?? {}), SD: false } as typeof d.settings.typeLabelVisibility;
    expect(textSizesOnPaper(d).some((x) => x.id === sh.sdsg[0].id && x.kind === 'typeLabel')).toBe(false);
  });
  it('凡例は、編集中に隠していても出力に含めるなら数える', () => {
    const d = hydrateDocument(JSON.parse(demoRaw) as TEMDocument);
    d.settings.legend = { ...d.settings.legend, alwaysVisible: false, includeInExport: true };
    expect(textSizesOnPaper(d).some((x) => x.kind === 'legend')).toBe(true);
  });
});
