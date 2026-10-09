// PowerPoint（.pptx）の TEM 図取り込みのテスト
// - スライド XML の読み取り（座標・回転・反転・矢じり・縦書き・グループの展開）
// - 種別の接頭辞（BFP / 仮EFP / 第2等EFP）と小さい文字の説明への振り分け
// - 役割の推測（吹き出しの向き → SD/SG、重なる文字 → ラベル、第N期 → 時期）
// - 組み立て（Line の両端の推定、SD/SG の紐付け先、ID の採番）
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import {
  parseSlideXml, parsePptx, classifyShapes, buildFromPptx, detectTypePrefix, splitBoxText, shapeDirection,
  DEFAULT_PPTX_BUILD_OPTIONS, type PptxBuildOptions,
} from './pptxImport';

const E = 12700; // EMU / pt

const xfrm = (x: number, y: number, w: number, h: number, attrs = '') =>
  `<a:xfrm${attrs}><a:off x="${x * E}" y="${y * E}"/><a:ext cx="${w * E}" cy="${h * E}"/></a:xfrm>`;

const box = (id: number, x: number, y: number, w: number, h: number, runs: string, opts: { dash?: string; vert?: boolean } = {}) => `
<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="box ${id}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr>${xfrm(x, y, w, h)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>
<a:ln w="12700"><a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:prstDash val="${opts.dash ?? 'solid'}"/></a:ln></p:spPr>
<p:txBody><a:bodyPr vert="${opts.vert ? 'wordArtVertRtl' : 'horz'}"/><a:p>${runs}</a:p></p:txBody></p:sp>`;

const run = (t: string, sz = 800, color?: string) =>
  `<a:r><a:rPr lang="ja-JP" sz="${sz}">${color ? `<a:solidFill><a:srgbClr val="${color}"/></a:solidFill>` : ''}</a:rPr><a:t>${t}</a:t></a:r>`;

const textBox = (id: number, x: number, y: number, w: number, h: number, t: string) => `
<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="tb ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
<p:spPr>${xfrm(x, y, w, h)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
<p:txBody><a:bodyPr/><a:p>${run(t)}</a:p></p:txBody></p:sp>`;

const callout = (id: number, x: number, y: number, w: number, h: number, rot = 0) => `
<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="callout ${id}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr>${xfrm(x, y, w, h, rot ? ` rot="${rot * 60000}"` : '')}<a:prstGeom prst="upArrowCallout"><a:avLst/></a:prstGeom>
<a:ln w="12700"><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:ln></p:spPr></p:sp>`;

const connector = (id: number, x: number, y: number, w: number, h: number, opts: { flipV?: boolean; dash?: string; endCxn?: number; head?: boolean } = {}) => `
<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="${id}" name="cxn ${id}"/><p:cNvCxnSpPr>${opts.endCxn ? `<a:endCxn id="${opts.endCxn}" idx="1"/>` : ''}</p:cNvCxnSpPr><p:nvPr/></p:nvCxnSpPr>
<p:spPr>${xfrm(x, y, w, h, opts.flipV ? ' flipV="1"' : '')}<a:prstGeom prst="straightConnector1"><a:avLst/></a:prstGeom>
<a:ln w="25400"><a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:prstDash val="${opts.dash ?? 'solid'}"/>
<a:headEnd type="${opts.head ? 'triangle' : 'none'}"/><a:tailEnd type="${opts.head ? 'none' : 'triangle'}"/></a:ln></p:spPr></p:cxnSp>`;

const slideXml = (body: string) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${body}</p:spTree></p:cSld></p:sld>`;

/** 典型的な横型 TEM 図: Box 3 つ（うち BFP・点線）、矢印 2 本、SD・SG、時期、時間の矢印 */
const SAMPLE = slideXml([
  box(10, 100, 100, 30, 200, run('高校時代に留学する'), { vert: true }),
  box(11, 200, 100, 30, 200, run('BFP') + run('　違いをどう意味付けるか'), { vert: true }),
  box(12, 300, 50, 30, 150, run('受け入れる（最小化的') + run('）', 933) + run('再意味付け', 667, 'FF0000'), { vert: true }),
  box(13, 300, 250, 30, 100, run('違いを気づかない'), { vert: true, dash: 'sysDash' }),
  // BFP(200-230) の右辺 → 上の Box（300,…）の左辺: 実線、endCxn あり
  connector(20, 230, 150, 70, 30, { flipV: true, endCxn: 12 }),
  // BFP の右辺 → 点線 Box: 点線
  connector(21, 230, 260, 70, 20, { dash: 'sysDot' }),
  callout(30, 90, 330, 60, 40, 180),     // 下向き → SD
  textBox(31, 92, 340, 56, 20, '語学力の不足'),
  callout(32, 190, 330, 60, 40),          // 上向き → SG
  textBox(33, 192, 340, 56, 20, '家族の後押し'),
  textBox(40, 100, 20, 150, 20, '第1期：支援される側'),
  `<p:sp><p:nvSpPr><p:cNvPr id="50" name="arrow"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm(50, 420, 600, 40)}<a:prstGeom prst="rightArrow"><a:avLst/></a:prstGeom></p:spPr></p:sp>`,
  textBox(51, 300, 430, 80, 20, '非可逆的時間'),
].join(''));

const buildOpts = (patch: Partial<PptxBuildOptions> = {}): PptxBuildOptions => ({
  ...DEFAULT_PPTX_BUILD_OPTIONS, levelPx: 100,
  existingBoxIds: [], existingLineIds: [], existingSdsgIds: [], existingNoteIds: [],
  ...patch,
});

describe('parseSlideXml', () => {
  it('位置・大きさを pt で読み、縦書き・点線・矢じり・接続先を拾う', () => {
    const s = parseSlideXml(SAMPLE);
    const b = s.shapes.find((x) => x.id === '13')!;
    expect([b.x, b.y, b.w, b.h]).toEqual([300, 250, 30, 100]);
    expect(b.vertical).toBe(true);
    expect(b.dash).toBe('sysDash');
    const c = s.shapes.find((x) => x.id === '20')!;
    expect(c.kind).toBe('connector');
    expect(c.tailArrow).toBe(true);
    expect(c.flipV).toBe(true);
    expect(c.endCxnId).toBe('12');
    const t = s.shapes.find((x) => x.id === '31')!;
    expect(t.isTextBox).toBe(true);
    expect(t.hasOutline).toBe(false);
  });

  it('グループの子図形をスライド座標に展開する', () => {
    const xml = slideXml(`<p:grpSp><p:nvGrpSpPr><p:cNvPr id="2" name="g"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="${100 * E}" y="${50 * E}"/><a:ext cx="${200 * E}" cy="${100 * E}"/><a:chOff x="0" y="0"/><a:chExt cx="${100 * E}" cy="${50 * E}"/></a:xfrm></p:grpSpPr>
      ${box(3, 10, 10, 20, 20, run('A'))}</p:grpSp>`);
    const b = parseSlideXml(xml).shapes[0];
    // 子座標 (10,10) × 倍率 2 + オフセット (100,50)
    expect([b.x, b.y, b.w, b.h]).toEqual([120, 70, 40, 40]);
  });

  it('回転で吹き出しの向きが変わる', () => {
    const s = parseSlideXml(SAMPLE);
    expect(shapeDirection(s.shapes.find((x) => x.id === '30')!)).toEqual([0, 1]);
    expect(shapeDirection(s.shapes.find((x) => x.id === '32')!)).toEqual([0, -1]);
  });
});

describe('detectTypePrefix / splitBoxText', () => {
  it('本文先頭の種別名を読む', () => {
    expect(detectTypePrefix('BFP　違いをどう意味付けるか')).toEqual({ type: 'BFP', rest: '違いをどう意味付けるか' });
    expect(detectTypePrefix('第2等EFP　実践を継続する')?.type).toBe('2nd-EFP');
    expect(detectTypePrefix('P-EFP：留学しない')?.type).toBe('P-EFP');
    expect(detectTypePrefix('必須通過点 渡航')?.type).toBe('OPP');
  });
  it('「仮」は暫定の意味として種別を変えず、ラベルに（仮）を残す', () => {
    expect(detectTypePrefix('仮EFP　文化相対的な見方をする')).toEqual({ type: 'EFP', rest: '（仮）文化相対的な見方をする' });
  });
  it('区切りの無い語は種別とみなさない', () => {
    expect(detectTypePrefix('BFPとは何か')).toBeNull();
    expect(detectTypePrefix('高校時代に留学する')).toBeNull();
  });
  it('本文より小さい文字は説明へ回し、主たる文字サイズを返す', () => {
    const r = splitBoxText([[{ text: '受け入れる（最小化的', size: 8 }, { text: '）', size: 9.33 }, { text: '再意味付け', size: 6.67 }]], { smallToDescription: true });
    expect(r).toEqual({ label: '受け入れる（最小化的）', description: '再意味付け', mainSize: 8 });
    const off = splitBoxText([[{ text: 'A', size: 8 }, { text: 'b', size: 6 }]], { smallToDescription: false });
    expect(off.label).toBe('Ab');
  });
});

describe('classifyShapes', () => {
  const s = parseSlideXml(SAMPLE);
  const plans = classifyShapes(s, { widthPt: 960 });
  const roleOf = (id: string) => plans.find((p) => p.key === id)!;

  it('枠のある文字は Box、種別は接頭辞・点線から推測する', () => {
    expect(roleOf('10')).toMatchObject({ role: 'box', boxType: 'normal' });
    expect(roleOf('11')).toMatchObject({ role: 'box', boxType: 'BFP' });
    expect(roleOf('13')).toMatchObject({ role: 'box', boxType: 'annotation' });
  });
  it('下向きの吹き出しは SD、上向きは SG、重なる文字はそのラベル', () => {
    expect(roleOf('30').role).toBe('sd');
    expect(roleOf('32').role).toBe('sg');
    expect(roleOf('31')).toMatchObject({ role: 'sdsgLabel', labelOf: '30' });
    expect(roleOf('33')).toMatchObject({ role: 'sdsgLabel', labelOf: '32' });
  });
  it('矢じりのある線は Line（点線は XLine）、第N期は時期、時間の矢印とそのラベルは取り込まない', () => {
    expect(roleOf('20')).toMatchObject({ role: 'line', lineType: 'RLine' });
    expect(roleOf('21')).toMatchObject({ role: 'line', lineType: 'XLine' });
    expect(roleOf('40').role).toBe('period');
    expect(roleOf('50').role).toBe('timeArrow');
    expect(roleOf('51').role).toBe('ignore');
  });
});

describe('buildFromPptx', () => {
  const s = parseSlideXml(SAMPLE);
  const plans = classifyShapes(s, { widthPt: 960 });

  it('Box を作り、接頭辞を外したラベル・小さい文字の説明・縦書き・文字サイズを写す', () => {
    const r = buildFromPptx(s, plans, buildOpts());
    expect(r.boxes).toHaveLength(4);
    const bfp = r.boxes.find((b) => b.type === 'BFP')!;
    expect(bfp.label).toBe('違いをどう意味付けるか');
    expect(bfp.textOrientation).toBe('vertical');
    expect(bfp.style?.fontSize).toBe(16);          // 8pt × 倍率 2
    const m = r.boxes.find((b) => b.label.startsWith('受け入れる'))!;
    expect(m.label).toBe('受け入れる（最小化的）');
    expect(m.description).toBe('再意味付け');
    // 原点は Box・SD/SG・メモのうち最も左（SD の 90pt）と最も上（Box の 50pt）。Box の左端 100pt → (100 − 90) × 2
    expect(Math.min(...r.boxes.map((b) => b.x))).toBe(20);
    expect(Math.min(...r.boxes.map((b) => b.y))).toBe(0);
  });

  it('Line の両端を位置（と endCxn）から推定する', () => {
    const r = buildFromPptx(s, plans, buildOpts());
    const id = (label: string) => r.boxes.find((b) => b.label.startsWith(label))!.id;
    expect(r.lines.map((l) => [l.type, l.from, l.to])).toEqual([
      ['RLine', id('違いをどう'), id('受け入れる')],
      ['XLine', id('違いをどう'), id('違いを気づかない')],
    ]);
  });

  it('始点側だけに矢じりがあれば向きを逆にする', () => {
    const xml = slideXml(box(1, 0, 0, 20, 50, run('A')) + box(2, 100, 0, 20, 50, run('B')) + connector(3, 20, 20, 80, 0, { head: true }));
    const sl = parseSlideXml(xml);
    const r = buildFromPptx(sl, classifyShapes(sl, { widthPt: 960 }), buildOpts());
    const a = r.boxes.find((b) => b.label === 'A')!.id;
    const b = r.boxes.find((x) => x.label === 'B')!.id;
    expect(r.lines.map((l) => [l.from, l.to])).toEqual([[b, a]]);
  });

  it('端点の近くに Box が無い矢印は警告して取り込まない', () => {
    const xml = slideXml(box(1, 0, 0, 20, 50, run('A')) + connector(3, 300, 300, 80, 0));
    const sl = parseSlideXml(xml);
    const r = buildFromPptx(sl, classifyShapes(sl, { widthPt: 960 }), buildOpts());
    expect(r.lines).toHaveLength(0);
    expect(r.warnings.some((w) => w.includes('Box が見つからない'))).toBe(true);
  });

  it('SD/SG は重なる文字をラベルにし、時間方向で最も近い Box に紐付ける（中心からの差分で位置を持つ）', () => {
    const r = buildFromPptx(s, plans, buildOpts());
    const sd = r.sdsg.find((g) => g.type === 'SD')!;
    const sg = r.sdsg.find((g) => g.type === 'SG')!;
    expect(sd.label).toBe('語学力の不足');
    expect(sg.label).toBe('家族の後押し');
    const first = r.boxes.find((b) => b.label === '高校時代に留学する')!;
    expect(sd.attachedTo).toBe(first.id);
    expect(sg.attachedTo).toBe(r.boxes.find((b) => b.type === 'BFP')!.id);
    // 吹き出しの中心 (120, 350) − Box の中心 (115, 200) = (5, 150) pt → × 2
    expect([sd.timeOffset, sd.itemOffset]).toEqual([10, 300]);
    expect([sd.width, sd.height]).toEqual([120, 80]);
  });

  it('時期ラベルは中心の時間位置（Level）に置く', () => {
    const r = buildFromPptx(s, plans, buildOpts());
    // 中心 x = 175pt → (175 − 90) × 2 = 170px → 1.7 Level（原点は最も左の SD の 90pt）
    expect(r.periodLabels.map((p) => [p.position, p.label])).toEqual([[1.7, '第1期：支援される側']]);
  });

  it('時期ラベルの ID は取り込みのたびに別になる（同じシートへ 2 回取り込んでも重ならない）', () => {
    const a = buildFromPptx(s, plans, buildOpts()).periodLabels[0].id;
    const b = buildFromPptx(s, plans, buildOpts()).periodLabels[0].id;
    expect(a).not.toBe(b);
  });

  it('既存の ID と衝突しないように採番し、開始位置をずらせる', () => {
    const r = buildFromPptx(s, plans, buildOpts({ existingBoxIds: ['Item1', 'BFP1'], existingSdsgIds: ['SD1'], startTimePx: 500 }));
    expect(r.boxes.map((b) => b.id)).toEqual(expect.arrayContaining(['Item2', 'BFP2']));
    expect(r.sdsg.find((g) => g.type === 'SD')!.id).toBe('SD2');
    expect(Math.min(...r.boxes.map((b) => b.x))).toBeGreaterThanOrEqual(500);
  });

  it('役割を「無視」に変えた図形は取り込まない', () => {
    const changed = plans.map((p) => (p.key === '13' ? { ...p, role: 'ignore' as const } : p));
    const r = buildFromPptx(s, changed, buildOpts());
    expect(r.boxes).toHaveLength(3);
    expect(r.lines).toHaveLength(1);   // 点線 Box への矢印は終点が無くなる
  });
});

describe('回転・反転・グループ・プレースホルダー（2026-10-01 レビュー対応）', () => {
  const rotXfrm = (x: number, y: number, w: number, h: number, rot: number) =>
    `<a:xfrm rot="${rot * 60000}"><a:off x="${x * E}" y="${y * E}"/><a:ext cx="${w * E}" cy="${h * E}"/></a:xfrm>`;
  const build = (xml: string) => {
    const sl = parseSlideXml(slideXml(xml));
    return { sl, r: buildFromPptx(sl, classifyShapes(sl, { widthPt: 960 }), buildOpts()) };
  };

  it('90 度回したコネクタ（縦の線を横の枠＋回転で保存）の両端を正しく求める', () => {
    // A（上）と B（下）。線の枠は中心 (50,110)・長さ 180 の横線を 90 度回したもの → (50,20)→(50,200)
    const cxn = `<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="9" name="c"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr><p:spPr>${rotXfrm(-40, 110, 180, 0, 90)}
      <a:prstGeom prst="straightConnector1"/><a:ln><a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:tailEnd type="triangle"/></a:ln></p:spPr></p:cxnSp>`;
    const { r } = build(box(1, 0, 0, 100, 20, run('A')) + box(2, 0, 200, 100, 20, run('B')) + cxn);
    const id = (l: string) => r.boxes.find((b) => b.label === l)!.id;
    expect(r.lines.map((l) => [l.from, l.to])).toEqual([[id('A'), id('B')]]);
  });

  it('90 度回した Box は見た目の外形（縦横を入れ替えた枠）で置き、文字の向きも入れ替える', () => {
    const rotated = box(1, 0, 0, 200, 40, run('回した Box')).replace(/<a:xfrm>[\s\S]*?<\/a:xfrm>/, rotXfrm(0, 0, 200, 40, 90));
    const { r } = build(rotated);
    const b = r.boxes[0];
    // 外形は 40 × 200 pt → × 2
    expect([b.width, b.height]).toEqual([80, 400]);
    expect(b.textOrientation).toBe('vertical');
  });

  it('グループの反転・回転を子図形に反映する', () => {
    // 枠 (0,0)-(200,100) のグループを左右反転。子 A は左端 → 反転後は右端へ
    const grp = (attrs: string) => `<p:grpSp><p:nvGrpSpPr><p:cNvPr id="2" name="g"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm${attrs}><a:off x="0" y="0"/><a:ext cx="${200 * E}" cy="${100 * E}"/><a:chOff x="0" y="0"/><a:chExt cx="${200 * E}" cy="${100 * E}"/></a:xfrm></p:grpSpPr>
      ${box(3, 0, 0, 20, 100, run('A'))}</p:grpSp>`;
    const flipped = parseSlideXml(slideXml(grp(' flipH="1"'))).shapes[0];
    expect([flipped.x, flipped.y, flipped.w, flipped.h]).toEqual([180, 0, 20, 100]);
    expect(flipped.flipH).toBe(true);
    // 180 度回転: 子 A（左端・縦長）は右端へ移り、回転角を受け継ぐ
    const turned = parseSlideXml(slideXml(grp(' rot="10800000"'))).shapes[0];
    expect([Math.round(turned.x), Math.round(turned.y)]).toEqual([180, 0]);
    expect(turned.rot).toBe(180);
  });

  it('位置を持たないプレースホルダーの文字は落とさず警告に出す', () => {
    const ph = `<p:sp><p:nvSpPr><p:cNvPr id="7" name="Title"/><p:cNvSpPr/><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr><p:spPr/>
      <p:txBody><a:bodyPr/><a:p>${run('図のタイトル')}</a:p></p:txBody></p:sp>`;
    const { sl, r } = build(box(1, 0, 0, 100, 20, run('A')) + ph);
    expect(sl.skipped).toEqual(['図のタイトル']);
    expect(r.warnings.some((w) => w.includes('プレースホルダー') && w.includes('図のタイトル'))).toBe(true);
  });

  it('文字の無い枠に重なるテキストは枠の文字になり、隣の種別バッジは種別に反映される', () => {
    const frame = (id: number, x: number, y: number, w: number, h: number) => `
<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="f"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr>${xfrm(x, y, w, h)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln w="12700"><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:ln></p:spPr></p:sp>`;
    const { sl, r } = build(frame(1, 0, 40, 100, 50) + textBox(2, 0, 40, 100, 50, '進学を迷う') + textBox(3, 0, 20, 100, 16, 'BFP-1'));
    expect(sl.shapes.map((x) => x.id)).toEqual(['1', '3']);   // 文字は枠に合流
    expect(r.boxes).toHaveLength(1);
    expect(r.boxes[0]).toMatchObject({ label: '進学を迷う', type: 'BFP' });
    expect(r.notes).toHaveLength(0);
    // 合流したことが推測の理由に出て、役割を「メモ」に変えれば文字はメモとして残る（誤った合流を戻せる）
    const plans = classifyShapes(sl, { widthPt: 960 });
    expect(plans.find((p) => p.key === '1')!.reason).toContain('合流');
    const asNote = plans.map((p) => (p.key === '1' ? { ...p, role: 'note' as const } : p));
    expect(buildFromPptx(sl, asNote, buildOpts()).notes.map((n) => n.text)).toEqual(['進学を迷う']);
  });

  it('Box どうしをつなぐ長い矢印は時間の矢印と取り違えない（Codex pass-2）', () => {
    const { r } = build(box(1, 0, 100, 30, 100, run('A')) + box(2, 700, 100, 30, 100, run('B')) + connector(3, 30, 150, 670, 0));
    expect(r.lines).toHaveLength(1);
  });

  it('囲み枠の中に Box があれば「凡例」「Legend」の文字があっても中を捨てない（Codex pass-2）', () => {
    const lane = `<p:sp><p:nvSpPr><p:cNvPr id="1" name="lane"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm(0, 0, 400, 300)}<a:prstGeom prst="rect"/>
      <a:ln><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:ln></p:spPr></p:sp>`;
    const { r } = build(lane + textBox(2, 10, 10, 60, 20, '凡例') + box(3, 50, 50, 30, 100, run('A')) + box(4, 150, 50, 30, 100, run('Legend')));
    expect(r.boxes.map((b) => b.label).sort()).toEqual(['A', 'Legend']);
  });

  it('SD/SG から離れた「SD」という文字はメモのまま残す（Codex pass-2）', () => {
    const { r } = build(box(1, 0, 0, 30, 100, run('A')) + textBox(2, 400, 300, 40, 20, 'SD'));
    expect(r.notes.map((n) => n.text)).toEqual(['SD']);
  });

  it('Box のすぐ下でも大きな文字（14pt 超）はサブラベルにしない（Codex pass-2）', () => {
    const big = textBox(2, 0, 104, 200, 24, '重要な限界').replace(run('重要な限界'), run('重要な限界', 1800));
    const { r } = build(box(1, 0, 0, 30, 100, run('A')) + big);
    expect(r.boxes[0].subLabel).toBeUndefined();
    expect(r.notes.map((n) => n.text)).toEqual(['重要な限界']);
  });

  it('大きな背景の枠は中の小さな文字を吸い込まない', () => {
    const bg = `<p:sp><p:nvSpPr><p:cNvPr id="1" name="bg"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm(0, 0, 800, 400)}<a:prstGeom prst="rect"/>
      <a:ln><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:ln></p:spPr></p:sp>`;
    const { sl } = build(bg + textBox(2, 100, 100, 60, 20, 'メモ'));
    expect(sl.shapes.map((x) => x.id)).toEqual(['1', '2']);
  });
});

// 実データ（参加者から提供された pptx。git 管理外）での回帰テスト。ファイルが無い環境ではスキップ。
// 公開リポジトリなので、ファイル名・中身の文言はテストに書かない（置き場のフォルダ内の .pptx を探す）
const REAL_DIR = '../test-assets/private/maxqda';
const REAL = existsSync(REAL_DIR)
  ? (readdirSync(REAL_DIR).filter((n) => n.toLowerCase().endsWith('.pptx')).map((n) => `${REAL_DIR}/${n}`)[0] ?? '')
  : '';
describe.skipIf(!REAL)('実データ（PowerPoint の TEM 図）', () => {
  it('Box・Line・SD/SG・時期を取り込める', async () => {
    const f = await parsePptx(new Uint8Array(readFileSync(REAL)), 'real.pptx');
    const s = f.slides[0];
    const plans = classifyShapes(s, { widthPt: f.widthPt });
    const r = buildFromPptx(s, plans, buildOpts());
    expect(r.boxes).toHaveLength(23);
    expect(r.lines).toHaveLength(7);
    expect(r.sdsg).toHaveLength(8);
    expect(r.sdsg.filter((g) => g.type === 'SD')).toHaveLength(3);
    expect(r.sdsg.every((g) => g.label.length > 0)).toBe(true);
    expect(r.periodLabels.map((p) => p.label.slice(0, 3))).toEqual(['第1期', '第2期', '第3期']);
    expect(r.boxes.filter((b) => b.type === 'BFP')).toHaveLength(3);
    expect(r.boxes.some((b) => b.type === '2nd-EFP')).toBe(true);
    // 横に長い SG には 2 つの文字が乗っている（2 行のラベルになる）
    expect(r.sdsg.some((g) => g.type === 'SG' && g.label.split('\n').length >= 2)).toBe(true);
  });
});
