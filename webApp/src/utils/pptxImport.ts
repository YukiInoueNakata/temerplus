// ============================================================================
// PowerPoint（.pptx）で描かれた TEM 図の取り込み
//
// PowerPoint の TEM 図は「図形の見た目」でしか意味を持たない（どれが Box で、
// どの矢印がどの Box をつなぐかはデータとして無い）。そこで
//   1. parse    : スライド XML から図形（位置・大きさ・回転・文字・線種・矢じり）を読む
//   2. classify : 図形ごとに役割（Box / SD / SG / Line / 時期 / メモ / 無視）を推測する
//   3. build    : 利用者が直した役割に沿って、位置関係から Line の両端・SD/SG の紐付け先・
//                 SD/SG のラベル（隣の テキスト ボックス）を推定し、TEM 要素を組み立てる
// の 3 段で取り込む。ここは純関数だけ（store に触らない）。UI は PptxImportDialog。
//
// 単位: parse/classify は pt（EMU / 12700）、build の出力は px（pt × scale）。
// ============================================================================

import JSZip from 'jszip';
import type { Box, BoxType, Line, LineType, Note, PeriodLabel, SDSG } from '../types';
import { genBoxIdByType, genLineIdByType, genPeriodId, genSDSGIdByType } from '../store/defaults';
import { PPTX_SDSG_NAME_PREFIX } from './sdsgShape';

const EMU_PER_PT = 12700;

// ----------------------------------------------------------------------------
// 1. parse
// ----------------------------------------------------------------------------

export interface PptxRun {
  text: string;
  /** pt。未指定なら undefined（段落・図形の既定に従う） */
  size?: number;
  color?: string;
  bold?: boolean;
}

export type PptxShapeKind = 'shape' | 'connector' | 'table' | 'picture';

export interface PptxShape {
  /** スライド内で一意（cNvPr id。重複時は連番を付ける） */
  key: string;
  /** cNvPr の id（コネクタの stCxn / endCxn が参照する） */
  id: string;
  name: string;
  kind: PptxShapeKind;
  /** prstGeom の prst（custGeom は 'custom'、無ければ ''） */
  geom: string;
  /** スライド座標（pt）。グループは展開済み */
  x: number;
  y: number;
  w: number;
  h: number;
  /** 度（時計回り） */
  rot: number;
  flipH: boolean;
  flipV: boolean;
  /** 段落ごとのラン */
  paragraphs: PptxRun[][];
  /** 全文（段落は改行で連結） */
  text: string;
  vertical: boolean;
  isTextBox: boolean;
  hasOutline: boolean;
  hasFill: boolean;
  /** prstDash（'solid' / 'dash' / 'sysDot' など）。指定なしは undefined */
  dash?: string;
  /** 'dbl' などの複線 */
  compound?: string;
  lineWidthPt?: number;
  /** 始点側（headEnd）・終点側（tailEnd）の矢じり */
  headArrow: boolean;
  tailArrow: boolean;
  stCxnId?: string;
  endCxnId?: string;
  /** 文字の無い枠に重なっていたテキストを合流したときの個数（mergeOverlayTexts） */
  mergedTexts?: number;
  /** 表のセル文字（行 × 列） */
  table?: string[][];
}

export interface PptxSlide {
  index: number;       // 1 始まり
  shapes: PptxShape[];
  /** 位置を持たず読めなかった図形の文字（プレースホルダーなど）。警告に使う */
  skipped?: string[];
}

export interface PptxFile {
  filename: string;
  widthPt: number;
  heightPt: number;
  slides: PptxSlide[];
}

/** 名前空間を気にせずローカル名で子要素を探す */
function child(el: Element | null | undefined, name: string): Element | null {
  if (!el) return null;
  for (const c of Array.from(el.children)) if (c.localName === name) return c;
  return null;
}
function children(el: Element | null | undefined, name: string): Element[] {
  if (!el) return [];
  return Array.from(el.children).filter((c) => c.localName === name);
}
function descendant(el: Element | null | undefined, name: string): Element | null {
  if (!el) return null;
  const all = el.getElementsByTagName('*');
  for (const c of Array.from(all)) if (c.localName === name) return c;
  return null;
}
const num = (v: string | null | undefined, d = 0): number => {
  const n = Number(v);
  return v != null && Number.isFinite(n) ? n : d;
};

// ---- 座標変換（グループの入れ子を含む） ----
// アフィン行列 [a, b, c, d, e, f]: x' = a·x + c·y + e, y' = b·x + d·y + f
type Mat = [number, number, number, number, number, number];
const MAT_ID: Mat = [1, 0, 0, 1, 0, 0];
const mul = (m: Mat, n: Mat): Mat => [   // m ∘ n（n を先に適用）
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
const translate = (x: number, y: number): Mat => [1, 0, 0, 1, x, y];
const scaleM = (x: number, y: number): Mat => [x, 0, 0, y, 0, 0];
const rotateM = (deg: number): Mat => {
  const r = (deg * Math.PI) / 180;
  return [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
};
const apply = (m: Mat, x: number, y: number): [number, number] => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
/** 1/1000 pt に丸める（行列計算の端数と -0 を消す） */
const rnd = (v: number) => Math.round(v * 1000) / 1000 + 0;

/** 親グループまでに積み上がった変換。図形自身の回転・反転・大きさはこれと合成する */
interface GroupXf {
  m: Mat;          // 子座標（pt）→ スライド座標（pt）
  rot: number;     // 累積回転（度）
  flipH: boolean;
  flipV: boolean;
  sx: number;      // 累積の拡大率（図形の幅・高さに掛ける）
  sy: number;
}
const GROUP_ID: GroupXf = { m: MAT_ID, rot: 0, flipH: false, flipV: false, sx: 1, sy: 1 };

interface RawXfrm { x: number; y: number; w: number; h: number; rot: number; flipH: boolean; flipV: boolean }

function readXfrm(xfrm: Element | null): RawXfrm | null {
  if (!xfrm) return null;
  const off = child(xfrm, 'off');
  const ext = child(xfrm, 'ext');
  if (!off || !ext) return null;
  return {
    x: num(off.getAttribute('x')) / EMU_PER_PT,
    y: num(off.getAttribute('y')) / EMU_PER_PT,
    w: num(ext.getAttribute('cx')) / EMU_PER_PT,
    h: num(ext.getAttribute('cy')) / EMU_PER_PT,
    rot: num(xfrm.getAttribute('rot')) / 60000,
    flipH: xfrm.getAttribute('flipH') === '1' || xfrm.getAttribute('flipH') === 'true',
    flipV: xfrm.getAttribute('flipV') === '1' || xfrm.getAttribute('flipV') === 'true',
  };
}

/** 回転・反転の合成。親が鏡映（反転が片方だけ）なら子の回転の向きが逆になる */
function composeOrientation(g: GroupXf, rot: number, flipH: boolean, flipV: boolean) {
  const mirrored = g.flipH !== g.flipV;
  const r = ((mirrored ? -rot : rot) + g.rot) % 360;
  return { rot: r < 0 ? r + 360 : r, flipH: flipH !== g.flipH, flipV: flipV !== g.flipV };
}

/** グループ（grpSpPr の xfrm）を 1 段入れたときの変換 */
function enterGroup(g: GroupXf, xf: Element | null): GroupXf {
  const raw = readXfrm(xf);
  const chOff = child(xf, 'chOff');
  const chExt = child(xf, 'chExt');
  if (!raw || !chOff || !chExt) return g;
  const chX = num(chOff.getAttribute('x')) / EMU_PER_PT;
  const chY = num(chOff.getAttribute('y')) / EMU_PER_PT;
  const chW = num(chExt.getAttribute('cx')) / EMU_PER_PT || raw.w || 1;
  const chH = num(chExt.getAttribute('cy')) / EMU_PER_PT || raw.h || 1;
  const sx = raw.w / chW || 1;
  const sy = raw.h / chH || 1;
  const cx = raw.x + raw.w / 2;
  const cy = raw.y + raw.h / 2;
  // 子座標 → グループの枠（拡大・平行移動）→ 枠の中心で反転 → 回転 → 親へ
  let local = mul(translate(raw.x, raw.y), mul(scaleM(sx, sy), translate(-chX, -chY)));
  local = mul(translate(cx, cy), mul(rotateM(raw.rot), mul(scaleM(raw.flipH ? -1 : 1, raw.flipV ? -1 : 1), mul(translate(-cx, -cy), local))));
  const o = composeOrientation(g, raw.rot, raw.flipH, raw.flipV);
  return { m: mul(g.m, local), rot: o.rot, flipH: o.flipH, flipV: o.flipV, sx: g.sx * sx, sy: g.sy * sy };
}

/** 図形の xfrm をスライド座標へ（中心を写し、回転前の枠として持つ） */
function placeShape(g: GroupXf, raw: RawXfrm) {
  const [cx, cy] = apply(g.m, raw.x + raw.w / 2, raw.y + raw.h / 2);
  const w = raw.w * Math.abs(g.sx);
  const h = raw.h * Math.abs(g.sy);
  const o = composeOrientation(g, raw.rot, raw.flipH, raw.flipV);
  return { x: rnd(cx - w / 2), y: rnd(cy - h / 2), w: rnd(w), h: rnd(h), rot: rnd(o.rot), flipH: o.flipH, flipV: o.flipV };
}

/**
 * 見た目の外接矩形（回転を反映）。x / y / w / h は回転前の枠なので、
 * 当たり判定・配置にはこちらを使う
 */
export function visualRect(s: { x: number; y: number; w: number; h: number; rot: number }): { x: number; y: number; w: number; h: number } {
  const r = (s.rot * Math.PI) / 180;
  const cos = Math.abs(Math.cos(r));
  const sin = Math.abs(Math.sin(r));
  const w = s.w * cos + s.h * sin;
  const h = s.w * sin + s.h * cos;
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  return { x: rnd(cx - w / 2), y: rnd(cy - h / 2), w: rnd(w), h: rnd(h) };
}

/** 90 度 / 270 度に近い回転（縦横が入れ替わって見える） */
const isQuarterTurned = (rot: number) => {
  const m = ((rot % 180) + 180) % 180;
  return m > 45 && m < 135;
};

function readParagraphs(txBody: Element | null): PptxRun[][] {
  if (!txBody) return [];
  return children(txBody, 'p').map((p) => {
    const runs: PptxRun[] = [];
    Array.from(p.children).forEach((r) => {
      if (r.localName === 'br') { runs.push({ text: '\n' }); return; }
      if (r.localName !== 'r' && r.localName !== 'fld') return;
      const t = child(r, 't')?.textContent ?? '';
      if (!t) return;
      const rPr = child(r, 'rPr');
      const sz = rPr?.getAttribute('sz');
      const color = descendant(child(rPr, 'solidFill'), 'srgbClr')?.getAttribute('val') ?? undefined;
      runs.push({
        text: t,
        size: sz ? num(sz) / 100 : undefined,
        color: color ? `#${color}` : undefined,
        bold: rPr?.getAttribute('b') === '1' ? true : undefined,
      });
    });
    return runs;
  });
}

const paragraphsText = (ps: PptxRun[][]): string =>
  ps.map((rs) => rs.map((r) => r.text).join('')).join('\n').replace(/\n{2,}/g, '\n').trim();

function readLine(spPr: Element | null, style: Element | null) {
  const ln = child(spPr, 'ln');
  let hasOutline: boolean;
  if (ln) {
    hasOutline = !child(ln, 'noFill');
    // <a:ln> に色指定が無いときは style の lnRef に従う（style も無ければ線は描かれない。
    // pptxgenjs の文字図形は空の <a:ln></a:ln> を出す）
    if (hasOutline && !child(ln, 'solidFill') && !child(ln, 'gradFill') && !child(ln, 'pattFill')) {
      const lnRef = child(style, 'lnRef');
      hasOutline = !!lnRef && num(lnRef.getAttribute('idx')) > 0;
    }
  } else {
    const lnRef = child(style, 'lnRef');
    hasOutline = !!lnRef && num(lnRef.getAttribute('idx')) > 0;
  }
  const arrowish = (el: Element | null) => {
    const t = el?.getAttribute('type');
    return !!t && t !== 'none';
  };
  return {
    hasOutline,
    dash: child(ln, 'prstDash')?.getAttribute('val') ?? undefined,
    compound: ln?.getAttribute('cmpd') ?? undefined,
    lineWidthPt: ln?.getAttribute('w') ? num(ln.getAttribute('w')) / EMU_PER_PT : undefined,
    headArrow: arrowish(child(ln, 'headEnd')),
    tailArrow: arrowish(child(ln, 'tailEnd')),
  };
}

function readFill(spPr: Element | null, style: Element | null): boolean {
  if (child(spPr, 'noFill')) return false;
  const solid = child(spPr, 'solidFill');
  if (solid) {
    // 不透明度 0（pptxgenjs の文字図形の透明な背景）は塗りなし
    const alpha = descendant(solid, 'alpha');
    return !(alpha && num(alpha.getAttribute('val'), 100000) === 0);
  }
  if (child(spPr, 'gradFill') || child(spPr, 'pattFill') || child(spPr, 'blipFill')) return true;
  const fillRef = child(style, 'fillRef');
  return !!fillRef && num(fillRef.getAttribute('idx')) > 0;
}

/** スライド XML（ppt/slides/slideN.xml の中身）を図形の一覧にする */
export function parseSlideXml(xml: string, index = 1): PptxSlide {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const spTree = descendant(doc.documentElement, 'spTree');
  const shapes: PptxShape[] = [];
  const usedKeys = new Set<string>();
  const keyFor = (id: string) => {
    let k = id || 'shape';
    let n = 2;
    while (usedKeys.has(k)) k = `${id}_${n++}`;
    usedKeys.add(k);
    return k;
  };

  const skipped: string[] = [];

  const walk = (container: Element, t: GroupXf) => {
    Array.from(container.children).forEach((el) => {
      const ln = el.localName;
      if (ln === 'grpSp') {
        walk(el, enterGroup(t, child(child(el, 'grpSpPr'), 'xfrm')));
        return;
      }
      if (ln !== 'sp' && ln !== 'cxnSp' && ln !== 'graphicFrame' && ln !== 'pic') return;

      const nv = child(el, ln === 'sp' ? 'nvSpPr' : ln === 'cxnSp' ? 'nvCxnSpPr' : ln === 'pic' ? 'nvPicPr' : 'nvGraphicFramePr');
      const cNvPr = child(nv, 'cNvPr');
      const id = cNvPr?.getAttribute('id') ?? '';
      const name = cNvPr?.getAttribute('name') ?? '';
      const spPr = child(el, 'spPr');
      const style = child(el, 'style');
      const xfrmEl = ln === 'graphicFrame' ? child(el, 'xfrm') : child(spPr, 'xfrm');
      const xf = readXfrm(xfrmEl);
      if (!xf) {
        // 位置をレイアウトから継承するプレースホルダーなど。黙って落とさず、文字があれば知らせる
        const text = paragraphsText(readParagraphs(child(el, 'txBody')));
        if (text) skipped.push(text);
        return;
      }
      const base = { key: keyFor(id), id, name, ...placeShape(t, xf) };

      if (ln === 'graphicFrame') {
        const tbl = descendant(el, 'tbl');
        if (!tbl) return;
        const table = children(tbl, 'tr').map((tr) => children(tr, 'tc').map((tc) => paragraphsText(readParagraphs(child(tc, 'txBody')))));
        shapes.push({
          ...base, kind: 'table', geom: '', paragraphs: [], text: '', vertical: false,
          isTextBox: false, hasOutline: false, hasFill: false, headArrow: false, tailArrow: false, table,
        });
        return;
      }
      if (ln === 'pic') {
        shapes.push({
          ...base, kind: 'picture', geom: '', paragraphs: [], text: '', vertical: false,
          isTextBox: false, hasOutline: false, hasFill: true, headArrow: false, tailArrow: false,
        });
        return;
      }

      const geom = child(spPr, 'prstGeom')?.getAttribute('prst') ?? (child(spPr, 'custGeom') ? 'custom' : '');
      const txBody = child(el, 'txBody');
      const paragraphs = readParagraphs(txBody);
      const vert = child(txBody, 'bodyPr')?.getAttribute('vert') ?? 'horz';
      const line = readLine(spPr, style);
      const cNvSpPr = child(nv, ln === 'sp' ? 'cNvSpPr' : 'cNvCxnSpPr');
      shapes.push({
        ...base,
        kind: ln === 'cxnSp' ? 'connector' : 'shape',
        geom,
        paragraphs,
        text: paragraphsText(paragraphs),
        vertical: /vert|eaVert|wordArtVert/i.test(vert) && vert !== 'horz',
        isTextBox: cNvSpPr?.getAttribute('txBox') === '1',
        hasOutline: line.hasOutline,
        hasFill: readFill(spPr, style),
        dash: line.dash,
        compound: line.compound,
        lineWidthPt: line.lineWidthPt,
        headArrow: line.headArrow,
        tailArrow: line.tailArrow,
        stCxnId: child(cNvSpPr, 'stCxn')?.getAttribute('id') ?? undefined,
        endCxnId: child(cNvSpPr, 'endCxn')?.getAttribute('id') ?? undefined,
      });
    });
  };
  if (spTree) walk(spTree, GROUP_ID);
  return { index, shapes: mergeOverlayTexts(shapes), skipped };
}

/** 枠になりうる図形（四角・角丸・楕円など） */
const BOX_GEOMS = /^(rect|roundRect|snipRoundRect|round2SameRect|flowChartProcess|flowChartAlternateProcess|ellipse|flowChartConnector|plaque|)$/;

/**
 * 文字の無い枠に、ほぼ同じ大きさのテキストが重なっていれば、その枠の文字として合流させる。
 * 「四角形の上にテキスト ボックスを置く」描き方と、TEMer 自身の pptx 出力（枠と文字を別図形で出す）の両方に効く。
 * 背景の大きな枠が中の文字を吸い込まないよう、テキストが枠の 25% 以上を占めるときだけ合流する
 */
function mergeOverlayTexts(shapes: PptxShape[]): PptxShape[] {
  const removed = new Set<string>();
  const frames = shapes.filter((s) => s.kind === 'shape' && !s.text && !s.isTextBox && s.hasOutline && BOX_GEOMS.test(s.geom));
  const texts = shapes.filter((s) => s.kind === 'shape' && s.text && (s.isTextBox || !s.hasOutline));
  const merged = new Map<string, PptxShape[]>();
  texts.forEach((t) => {
    const tr = visualRect(t);
    const area = Math.max(1, tr.w * tr.h);
    let best: PptxShape | null = null;
    let bestFrac = 0;
    frames.forEach((f) => {
      const fr = visualRect(f);
      const ov = rectOverlap(fr, tr);
      const frac = ov / area;
      if (frac >= 0.6 && area >= fr.w * fr.h * 0.25 && frac > bestFrac) { best = f; bestFrac = frac; }
    });
    if (best) {
      const k = (best as PptxShape).key;
      merged.set(k, [...(merged.get(k) ?? []), t]);
      removed.add(t.key);
    }
  });
  return shapes
    .filter((s) => !removed.has(s.key))
    .map((s) => {
      const ts = merged.get(s.key);
      if (!ts) return s;
      const sorted = [...ts].sort((a, b) => (Math.abs(a.y - b.y) > 4 ? a.y - b.y : a.x - b.x));
      const paragraphs = sorted.flatMap((t) => t.paragraphs);
      return { ...s, paragraphs, text: paragraphsText(paragraphs), vertical: s.vertical || sorted.some((t) => t.vertical), mergedTexts: sorted.length };
    });
}

function rectOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

/** .pptx を読み、スライドごとの図形一覧にする */
export async function parsePptx(data: ArrayBuffer | Uint8Array, filename = ''): Promise<PptxFile> {
  const zip = await JSZip.loadAsync(data);
  const pres = zip.file('ppt/presentation.xml');
  if (!pres) throw new Error('PowerPoint のファイルとして読めませんでした（ppt/presentation.xml がありません）');
  const presXml = await pres.async('string');
  const sz = presXml.match(/<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
  const widthPt = sz ? Number(sz[1]) / EMU_PER_PT : 960;
  const heightPt = sz ? Number(sz[2]) / EMU_PER_PT : 540;

  // スライドの並び: presentation.xml の sldIdLst → rels の順。取れなければ番号順
  const names = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
  let ordered = names.sort((a, b) => Number(a.match(/(\d+)\.xml$/)![1]) - Number(b.match(/(\d+)\.xml$/)![1]));
  const relsFile = zip.file('ppt/_rels/presentation.xml.rels');
  if (relsFile) {
    const rels = await relsFile.async('string');
    const rIds = Array.from(presXml.matchAll(/<p:sldId [^>]*r:id="([^"]+)"/g)).map((m) => m[1]);
    const target = new Map(Array.from(rels.matchAll(/<Relationship [^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)).map((m) => [m[1], m[2]]));
    const fromRels = rIds.map((r) => target.get(r)).filter((t): t is string => !!t).map((t) => `ppt/${t.replace(/^\/?ppt\//, '')}`);
    if (fromRels.length > 0 && fromRels.every((n) => names.includes(n))) ordered = fromRels;
  }

  const slides: PptxSlide[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const xml = await zip.file(ordered[i])!.async('string');
    slides.push(parseSlideXml(xml, i + 1));
  }
  return { filename, widthPt, heightPt, slides };
}

// ----------------------------------------------------------------------------
// 2. classify
// ----------------------------------------------------------------------------

export type PptxRole = 'ignore' | 'box' | 'sd' | 'sg' | 'sdsgLabel' | 'subLabel' | 'line' | 'period' | 'note' | 'timeArrow';

export const PPTX_ROLE_LABELS: Record<PptxRole, string> = {
  box: 'Box',
  sd: 'SD',
  sg: 'SG',
  sdsgLabel: 'SD/SG のラベル',
  subLabel: 'サブラベル（Box・SD/SG の下の文字）',
  line: 'Line（矢印）',
  period: '時期ラベル',
  note: 'メモ（付箋）',
  timeArrow: '時間の矢印（取り込まない）',
  ignore: '（無視）',
};

export interface ShapePlan {
  key: string;
  role: PptxRole;
  boxType?: BoxType;
  lineType?: LineType;
  /** role === 'sdsgLabel' のときはどの SD/SG、'subLabel' のときはどの Box / SD/SG（図形 key）の文字か */
  labelOf?: string;
  /** 推測の理由（UI に出す） */
  reason?: string;
}

const CALLOUT_DIR: Record<string, [number, number]> = {
  upArrowCallout: [0, -1], downArrowCallout: [0, 1], leftArrowCallout: [-1, 0], rightArrowCallout: [1, 0],
  upArrow: [0, -1], downArrow: [0, 1],
  homePlate: [1, 0], chevron: [1, 0],
  // TEMer 自身の pptx 出力は SD/SG を右向きブロック矢印を 90 / 270 度回して描く
  rightArrow: [1, 0], leftArrow: [-1, 0],
};
const LINE_GEOMS = /^(line|straightConnector1|bentConnector\d|curvedConnector\d)$/;
const BIG_ARROW_GEOMS = /^(rightArrow|leftArrow|notchedRightArrow|stripedRightArrow|leftRightArrow)$/;

/** 回転・反転を考慮した図形の向き（単位ベクトル）。向きを持たない図形は null */
export function shapeDirection(s: PptxShape): [number, number] | null {
  const d = CALLOUT_DIR[s.geom];
  if (!d) return null;
  let [dx, dy] = d;
  if (s.flipH) dx = -dx;
  if (s.flipV) dy = -dy;
  const r = (s.rot * Math.PI) / 180;
  const rx = dx * Math.cos(r) - dy * Math.sin(r);
  const ry = dx * Math.sin(r) + dy * Math.cos(r);
  // + 0 で -0 を 0 にそろえる
  return [Math.round(rx * 1000) / 1000 + 0, Math.round(ry * 1000) / 1000 + 0];
}

const centerOf = (s: { x: number; y: number; w: number; h: number }) => ({ cx: s.x + s.w / 2, cy: s.y + s.h / 2 });
/** 見た目（回転後）の外接矩形どうしの重なり面積 */
const overlapArea = (a: PptxShape, b: PptxShape): number => rectOverlap(visualRect(a), visualRect(b));
const areaOf = (s: PptxShape) => { const r = visualRect(s); return Math.max(1, r.w * r.h); };

/** 「第1期」「Phase 2」などで始まる文字は時期ラベル */
export const PERIOD_RE = /^\s*(第\s*[0-9０-９一二三四五六七八九十]+\s*期|時期\s*[0-9０-９一二三四五六七八九十]+|(phase|period|stage)\s*[0-9]+)/i;

/** TEMer の pptx 出力が Box の上に置く種別バッジ（「BFP-1」「2nd EFP」「BFP-2 / OPP-1」など） */
const TYPE_BADGE_RE = /^\s*(P-2nd\s*EFP|2nd\s*EFP|P-EFP|EFP|BFP|OPP|SD|SG)\s*[-‐]?\s*[0-9]*\s*(\/.*)?$/i;
const BADGE_TYPES: Record<string, BoxType> = { 'p-2ndefp': 'P-2nd-EFP', '2ndefp': '2nd-EFP', 'p-efp': 'P-EFP', efp: 'EFP', bfp: 'BFP', opp: 'OPP' };
const TIME_LABEL_RE = /^\s*(非可逆的時間|不可逆的時間|irreversible\s+time)\s*$/i;

/**
 * Box 本文の先頭に書かれた種別（「BFP　…」「仮EFP　…」「第2等EFP　…」「必須通過点：…」）。
 * 区切り（空白・コロン・改行）か本文末まで続くものだけを種別とみなす（「BFPとは」は対象外）
 */
const TYPE_PREFIX_RE = /^\s*(仮)?\s*(P\s*-?|両極化)?\s*(第\s*[2２二]\s*等?(?:至点)?|2nd\s*-?)?\s*(EFP|BFP|OPP|等至点|分岐点|必須通過点)\s*[-‐]?\s*[0-9０-９]*\s*(?:[\s　:：]+|$)/i;

/**
 * 「仮」は暫定の意味（両極化ではない）なので種別は変えず、ラベルの頭に「（仮）」を残す
 */
export function detectTypePrefix(text: string): { type: BoxType; rest: string } | null {
  const m = text.match(TYPE_PREFIX_RE);
  if (!m) return null;
  const isTentative = !!m[1];
  const isP = !!m[2];
  const isSecond = !!m[3];
  const base = m[4].toUpperCase();
  let type: BoxType;
  if (base === 'BFP' || base === '分岐点') type = 'BFP';
  else if (base === 'OPP' || base === '必須通過点') type = 'OPP';
  else type = isSecond ? (isP ? 'P-2nd-EFP' : '2nd-EFP') : (isP ? 'P-EFP' : 'EFP');
  const rest = text.slice(m[0].length);
  return { type, rest: isTentative && rest.trim() ? `（仮）${rest}` : rest };
}

/**
 * Box の文字を「ラベル」と「説明」に分ける。
 * 主たる文字サイズより小さいラン（分析者がコード名などを小さく添えた部分）は説明へ回す
 */
export function splitBoxText(paragraphs: PptxRun[][], opts: { smallToDescription: boolean }): { label: string; description?: string; mainSize?: number } {
  const runs = paragraphs.flatMap((rs, i) => (i > 0 ? [{ text: '\n' } as PptxRun, ...rs] : rs));
  const bySize = new Map<number, number>();
  runs.forEach((r) => { if (r.size && r.text.trim()) bySize.set(r.size, (bySize.get(r.size) ?? 0) + r.text.length); });
  let dominant = 0;
  let best = -1;
  bySize.forEach((chars, size) => { if (chars > best || (chars === best && size > dominant)) { best = chars; dominant = size; } });
  const isSmall = (r: PptxRun) => opts.smallToDescription && dominant > 0 && r.size !== undefined && r.size < dominant * 0.95;
  const label = runs.filter((r) => !isSmall(r)).map((r) => r.text).join('').replace(/\n{2,}/g, '\n').trim();
  const desc = runs.filter((r) => isSmall(r)).map((r) => r.text.trim()).filter(Boolean).join(' ');
  const mainSize = dominant > 0 ? dominant : undefined;
  if (!label) return { label: desc, mainSize };   // 全部小さい → そのままラベルに
  return { label, description: desc || undefined, mainSize };
}

/** 図形 1 つの「見た目」から Box の種別を推測 */
export function guessBoxType(s: PptxShape): { type: BoxType; reason: string } {
  const prefix = detectTypePrefix(s.text);
  if (prefix) return { type: prefix.type, reason: '本文の先頭の種別名' };
  if (s.compound === 'dbl' || s.compound === 'thickThin' || s.compound === 'thinThick') return { type: 'EFP', reason: '二重線' };
  if (s.dash && s.dash !== 'solid') return { type: 'annotation', reason: '点線（潜在経験として）' };
  return { type: 'normal', reason: '' };
}

export interface ClassifyOptions {
  widthPt: number;
}

export function classifyShapes(slide: PptxSlide, opts: ClassifyOptions): ShapePlan[] {
  const plans = new Map<string, ShapePlan>();
  const set = (p: ShapePlan) => plans.set(p.key, p);

  // 時間の矢印（横に長い太矢印 / スライド幅の 4 割を超える矢印線）。
  // 矢印線は Box どうしをつなぐ長い Line のこともあるので、両端の近く（30pt）に Box が無いときだけ
  const isLong = (s: PptxShape) => visualRect(s).w >= opts.widthPt * 0.4;
  const boxLike = slide.shapes.filter((s) => s.kind === 'shape' && s.text && !s.isTextBox && (s.hasOutline || s.hasFill) && BOX_GEOMS.test(s.geom));
  const nearBox = (pt: [number, number]) => boxLike.some((b) => distToRect(pt[0], pt[1], visualRect(b)) <= 30);
  slide.shapes
    .filter((s) => s.kind === 'shape' && BIG_ARROW_GEOMS.test(s.geom) && isLong(s))
    .forEach((s) => set({ key: s.key, role: 'timeArrow', reason: '横に長い矢印' }));
  slide.shapes
    .filter((s) => (s.kind === 'connector' || LINE_GEOMS.test(s.geom)) && (s.headArrow || s.tailArrow) && isLong(s)
      && visualRect(s).h < visualRect(s).w * 0.1)
    .forEach((s) => {
      const { start, end } = lineEndpoints(s);
      if (!nearBox(start) && !nearBox(end)) set({ key: s.key, role: 'timeArrow', reason: '横に長い矢印線（両端に Box が無い）' });
    });

  // TEMer 自身の出力の SD/SG は図形名（「TEMer SD」「TEMer SG」）で見分ける。
  // 向きからの推測より確実で、四角形の SD/SG（形は Box と同じ）も SD/SG として戻せる
  const sdsgNameType = (name: string): 'sd' | 'sg' | null =>
    name === `${PPTX_SDSG_NAME_PREFIX}SD` ? 'sd' : name === `${PPTX_SDSG_NAME_PREFIX}SG` ? 'sg' : null;
  const namedSdsg = slide.shapes.filter((s) => s.kind === 'shape' && !plans.has(s.key) && sdsgNameType(s.name) !== null);
  namedSdsg.forEach((s) => set({ key: s.key, role: sdsgNameType(s.name)!, reason: 'TEMer の出力（図形の名前）' }));

  // SD / SG（向きを持つ吹き出し・矢印・五角形）
  const directedSdsg = slide.shapes.filter((s) => s.kind === 'shape' && !plans.has(s.key) && shapeDirection(s) !== null);
  const sdsgShapes = [...namedSdsg, ...directedSdsg];
  directedSdsg.forEach((s) => {
    const [dx, dy] = shapeDirection(s)!;
    // 横型の TEM 図: 下向き = SD（上から抑える）、上向き = SG（下から支える）
    // 縦型の TEM 図: 左向き = SD、右向き = SG（TEMer の画面・出力と同じ。Box の方を指す）
    if (dy > 0.5) set({ key: s.key, role: 'sd', reason: '下向きの矢印' });
    else if (dy < -0.5) set({ key: s.key, role: 'sg', reason: '上向きの矢印' });
    else if (dx < -0.5) set({ key: s.key, role: 'sd', reason: '左向きの矢印（縦型の SD）' });
    else if (dx > 0.5) set({ key: s.key, role: 'sg', reason: '右向きの矢印（縦型の SG）' });
    else set({ key: s.key, role: 'sd', reason: '向きが斜め（SD と仮定）' });
  });

  // 文字の無い SD/SG の図形には、重なっているテキストをラベルとして結びつける。
  // テキストごとに「自分の面積の何割がその図形に乗っているか」が最大の図形へ割り当てる
  // （横に長い吹き出しに 2 つ乗っていれば両方がその吹き出しのラベルになる）
  const emptyCallouts = sdsgShapes.filter((c) => !c.text);
  const textCandidates = slide.shapes.filter((s) => s.kind === 'shape' && !plans.has(s.key) && s.text && (s.isTextBox || !s.hasOutline));
  textCandidates.forEach((t) => {
    if (PERIOD_RE.test(t.text)) return;
    const area = areaOf(t);
    let best: PptxShape | null = null;
    let bestFrac = 0;
    emptyCallouts.forEach((c) => {
      const a = overlapArea(c, t);
      // テキストの半分以上が乗っている or 図形の 30% 以上を覆う
      const frac = a / area;
      if ((frac >= 0.5 || a >= areaOf(c) * 0.3) && frac > bestFrac) { best = c; bestFrac = frac; }
    });
    if (best) set({ key: t.key, role: 'sdsgLabel', labelOf: (best as PptxShape).key, reason: 'SD/SG の図形に重なる文字' });
  });

  slide.shapes.forEach((s) => {
    if (plans.has(s.key)) return;
    if (s.kind === 'table' || s.kind === 'picture') { set({ key: s.key, role: 'ignore', reason: s.kind === 'table' ? '表（背景の枠として）' : '画像' }); return; }
    const isLineLike = s.kind === 'connector' || LINE_GEOMS.test(s.geom);
    if (isLineLike) {
      if (s.headArrow || s.tailArrow) {
        const dashed = !!s.dash && s.dash !== 'solid';
        set({ key: s.key, role: 'line', lineType: dashed ? 'XLine' : 'RLine', reason: dashed ? '点線の矢印' : '実線の矢印' });
      } else {
        set({ key: s.key, role: 'ignore', reason: '矢じりの無い線（区切り線など）' });
      }
      return;
    }
    if (!s.text) { set({ key: s.key, role: 'ignore', reason: '文字の無い図形' }); return; }
    if (PERIOD_RE.test(s.text)) { set({ key: s.key, role: 'period', reason: '「第N期」で始まる' }); return; }
    if (TIME_LABEL_RE.test(s.text)) { set({ key: s.key, role: 'ignore', reason: '時間の矢印のラベル' }); return; }
    if (!s.isTextBox && (s.hasOutline || s.hasFill) && BOX_GEOMS.test(s.geom)) {
      const g = guessBoxType(s);
      // 枠に重なっていたテキストを合流した図形は、そのことを理由に出す（誤りなら役割を「メモ」にすれば文字は残る）
      const merged = s.mergedTexts ? `重なっていた文字（${s.mergedTexts} 個）を合流` : '';
      set({ key: s.key, role: 'box', boxType: g.type, reason: [g.reason, merged].filter(Boolean).join('・') || '枠のある文字' });
      return;
    }
    set({ key: s.key, role: 'note', reason: '枠の無い文字' });
  });

  // 凡例: 「凡例」「Legend」という見出し（枠の無い文字）を含む最小の空枠の中は、見本の SD/SG・矢印・
  // 項目名なので取り込まない。ただし枠の中に Box があれば凡例ではない（囲み枠・スイムレーン）とみなして触らない
  const inside = (s: PptxShape, r: { x: number; y: number; w: number; h: number }) => {
    const c = centerOf(visualRect(s));
    return c.cx >= r.x && c.cx <= r.x + r.w && c.cy >= r.y && c.cy <= r.y + r.h;
  };
  slide.shapes
    .filter((s) => plans.get(s.key)?.role === 'note' && /^\s*(凡例|legend)\s*$/i.test(s.text))
    .forEach((title) => {
      const { cx, cy } = centerOf(visualRect(title));
      const frame = slide.shapes
        .filter((f) => f.kind === 'shape' && !f.text && BOX_GEOMS.test(f.geom))
        .map((f) => ({ f, r: visualRect(f) }))
        .filter(({ r }) => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h)
        .sort((a, b) => a.r.w * a.r.h - b.r.w * b.r.h)[0];
      if (!frame) return;
      const members = slide.shapes.filter((s) => s.key !== frame.f.key && inside(s, frame.r));
      if (members.some((s) => plans.get(s.key)?.role === 'box')) return;
      [title, ...members].forEach((s) => set({ key: s.key, role: 'ignore', reason: '凡例' }));
    });

  // 種別バッジ（TEMer の pptx 出力が Box・SD/SG の外に置く短い文字）。
  // 近くの Box の種別に反映し、バッジ自体は取り込まない
  const boxes = slide.shapes.filter((s) => plans.get(s.key)?.role === 'box');
  const sdsgs = slide.shapes.filter((s) => ['sd', 'sg'].includes(plans.get(s.key)?.role ?? ''));
  slide.shapes.forEach((s) => {
    const p = plans.get(s.key);
    if (p?.role !== 'note' || s.text.length > 24) return;
    const m = s.text.match(TYPE_BADGE_RE);
    if (!m) return;
    const kind = m[1].replace(/\s+/g, '').toLowerCase();
    const { cx, cy } = centerOf(visualRect(s));
    if (kind === 'sd' || kind === 'sg') {
      // SD/SG の図形の近く（40pt）にあるときだけバッジとみなす。離れた「SD」という文字はメモのまま
      if (sdsgs.some((g) => distToRect(cx, cy, visualRect(g)) <= 40)) set({ key: s.key, role: 'ignore', reason: 'SD/SG の種別バッジ' });
      return;
    }
    let best: PptxShape | null = null;
    let bestD = 40;   // pt
    boxes.forEach((b) => {
      const d = distToRect(cx, cy, visualRect(b));
      if (d < bestD) { best = b; bestD = d; }
    });
    if (!best) return;
    const bp = plans.get((best as PptxShape).key)!;
    if ((bp.boxType ?? 'normal') === 'normal' && BADGE_TYPES[kind]) {
      // 理由は上書きせず書き足す（「重なっていた文字を合流」などを消さない）
      const prev = bp.reason && bp.reason !== '枠のある文字' ? bp.reason : '';
      set({ ...bp, boxType: BADGE_TYPES[kind], reason: [prev, '隣の種別バッジ'].filter(Boolean).join('・') });
    }
    set({ key: s.key, role: 'ignore', reason: '種別バッジ（隣の Box の種別に反映）' });
  });

  // サブラベル: Box・SD/SG のすぐ下（隙間 14pt 以内）にある短く小さな文字（協力者 ID・補足など）。
  // 2 行以内・文字サイズ 14pt 以下に限る（大きな見出しやメモを吸い込まない）
  const owners = slide.shapes.filter((s) => ['box', 'sd', 'sg'].includes(plans.get(s.key)?.role ?? ''));
  slide.shapes.forEach((s) => {
    if (plans.get(s.key)?.role !== 'note' || s.text.length > 40 || s.text.split('\n').length > 2) return;
    const sizes = s.paragraphs.flat().map((r) => r.size).filter((v): v is number => !!v);
    if (sizes.length > 0 && Math.max(...sizes) > 14) return;
    const r = visualRect(s);
    const cx = r.x + r.w / 2;
    let best: PptxShape | null = null;
    let bestGap = 14;
    owners.forEach((o) => {
      const or = visualRect(o);
      const gap = r.y - (or.y + or.h);
      if (gap >= -2 && gap < bestGap && cx >= or.x - 4 && cx <= or.x + or.w + 4) { best = o; bestGap = gap; }
    });
    if (best) set({ key: s.key, role: 'subLabel', labelOf: (best as PptxShape).key, reason: 'すぐ上の要素のサブラベル' });
  });

  return slide.shapes.map((s) => plans.get(s.key) ?? { key: s.key, role: 'ignore' });
}

// ----------------------------------------------------------------------------
// 3. build
// ----------------------------------------------------------------------------

export interface PptxBuildOptions {
  /** pt → px の倍率（既定 2） */
  scale: number;
  levelPx: number;
  /** 時間方向（横型の x）の開始位置 px。既存の図の後ろに足すときに使う */
  startTimePx: number;
  /** 小さい文字を Box の説明へ回す（既定 true） */
  smallToDescription: boolean;
  /** 元の文字サイズを Box に写す（既定 true） */
  keepFontSize: boolean;
  /** Line の端点と Box の距離の許容値（pt。既定 30） */
  snapDistancePt: number;
  existingBoxIds: string[];
  existingLineIds: string[];
  existingSdsgIds: string[];
  existingNoteIds: string[];
}

export const DEFAULT_PPTX_BUILD_OPTIONS: Omit<PptxBuildOptions, 'existingBoxIds' | 'existingLineIds' | 'existingSdsgIds' | 'existingNoteIds' | 'levelPx'> = {
  scale: 2,
  startTimePx: 0,
  smallToDescription: true,
  keepFontSize: true,
  snapDistancePt: 30,
};

export interface PptxBuildResult {
  boxes: Box[];
  lines: Line[];
  sdsg: SDSG[];
  periodLabels: PeriodLabel[];
  notes: Note[];
  /** 図形 key → 作った要素 ID（プレビューの対応表示用） */
  idByKey: Record<string, string>;
  warnings: string[];
}

/** 点と矩形の距離（内側なら 0） */
function distToRect(px: number, py: number, r: { x: number; y: number; w: number; h: number }): number {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.w));
  const dy = Math.max(r.y - py, 0, py - (r.y + r.h));
  return Math.hypot(dx, dy);
}

/** 線の両端（pt）。flipH / flipV で始点が変わる */
export function lineEndpoints(s: PptxShape): { start: [number, number]; end: [number, number] } {
  // 回転前の枠の中心からの相対位置で始点・終点を決め（反転を反映）、枠の中心まわりに回す
  const hx = (s.flipH ? 1 : -1) * (s.w / 2);
  const hy = (s.flipV ? 1 : -1) * (s.h / 2);
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const r = (s.rot * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const at = (dx: number, dy: number): [number, number] => [
    Math.round((cx + dx * cos - dy * sin) * 1000) / 1000,
    Math.round((cy + dx * sin + dy * cos) * 1000) / 1000,
  ];
  return { start: at(hx, hy), end: at(-hx, -hy) };
}

const shortText = (t: string, n = 16) => {
  const one = t.replace(/\s+/g, ' ').trim();
  return one.length > n ? `${one.slice(0, n)}…` : one;
};

export function buildFromPptx(slide: PptxSlide, plans: ShapePlan[], opts: PptxBuildOptions): PptxBuildResult {
  const warnings: string[] = [];
  const planBy = new Map(plans.map((p) => [p.key, p]));
  const shapeBy = new Map(slide.shapes.map((s) => [s.key, s]));
  const roleOf = (s: PptxShape) => planBy.get(s.key)?.role ?? 'ignore';
  const sc = opts.scale;
  // 配置・当たり判定は見た目（回転後）の外接矩形で行う
  const rects = new Map(slide.shapes.map((s) => [s.key, visualRect(s)]));
  const R = (s: PptxShape) => rects.get(s.key)!;

  if (slide.skipped && slide.skipped.length > 0) {
    warnings.push(`位置を持たない図形（プレースホルダーなど）${slide.skipped.length} 個は取り込めませんでした: ${slide.skipped.map((t) => `「${shortText(t)}」`).join('、')}`);
  }

  // 原点: Box・SD/SG・メモの最小座標を (startTimePx, 0) に合わせる
  const placed = slide.shapes.filter((s) => ['box', 'sd', 'sg', 'note'].includes(roleOf(s)));
  const minX = placed.length > 0 ? Math.min(...placed.map((s) => R(s).x)) : 0;
  const minY = placed.length > 0 ? Math.min(...placed.map((s) => R(s).y)) : 0;
  const px = (xPt: number) => opts.startTimePx + (xPt - minX) * sc;
  const py = (yPt: number) => (yPt - minY) * sc;

  // --- Box ---
  const boxes: Box[] = [];
  const boxShapes: Array<{ shape: PptxShape; box: Box }> = [];
  const usedBoxIds = [...opts.existingBoxIds];
  const idByKey: Record<string, string> = {};
  slide.shapes.forEach((s) => {
    const plan = planBy.get(s.key);
    if (plan?.role !== 'box') return;
    const split = splitBoxText(s.paragraphs, { smallToDescription: opts.smallToDescription });
    // 種別の接頭辞（「BFP　」など）はラベルから外す（種別バッジと二重になるため）
    const prefix = detectTypePrefix(split.label);
    const label = prefix && prefix.rest.trim() ? prefix.rest.trim() : split.label;
    const type = plan.boxType ?? 'normal';
    const id = genBoxIdByType(type, usedBoxIds);
    usedBoxIds.push(id);
    const mainSize = split.mainSize;
    const r = R(s);
    // 90 / 270 度回した図形は、文字の向きも縦横が入れ替わって見える
    const vertical = isQuarterTurned(s.rot) ? !s.vertical : s.vertical;
    const box: Box = {
      id, type, label,
      x: px(r.x), y: py(r.y),
      width: Math.max(10, r.w * sc), height: Math.max(10, r.h * sc),
      textOrientation: vertical ? 'vertical' : 'horizontal',
      ...(s.geom === 'ellipse' || s.geom === 'flowChartConnector' ? { shape: 'ellipse' as const } : {}),
      ...(split.description ? { description: split.description } : {}),
      ...(opts.keepFontSize && mainSize ? { style: { fontSize: Math.round(mainSize * sc * 10) / 10 } } : {}),
      autoFitBoxMode: 'none',
    };
    boxes.push(box);
    boxShapes.push({ shape: s, box });
    idByKey[s.key] = id;
  });

  const boxByShapeId = new Map(boxShapes.map((b) => [b.shape.id, b]));
  const nearestBox = (pt: [number, number]): { box: Box; dist: number } | null => {
    let best: { box: Box; dist: number } | null = null;
    boxShapes.forEach(({ shape, box }) => {
      const d = distToRect(pt[0], pt[1], R(shape));
      if (!best || d < best.dist) best = { box, dist: d };
    });
    return best;
  };

  // --- Line ---
  const lines: Line[] = [];
  const usedLineIds = [...opts.existingLineIds];
  const seenPairs = new Set<string>();
  slide.shapes.forEach((s) => {
    const plan = planBy.get(s.key);
    if (plan?.role !== 'line') return;
    let { start, end } = lineEndpoints(s);
    let stId = s.stCxnId, enId = s.endCxnId;
    // 矢じりが始点側だけにあるなら向きを逆に
    if (s.headArrow && !s.tailArrow) { [start, end] = [end, start]; [stId, enId] = [enId, stId]; }
    const pick = (pt: [number, number], cxnId: string | undefined) => {
      if (cxnId && boxByShapeId.has(cxnId)) return { box: boxByShapeId.get(cxnId)!.box, dist: 0 };
      const n = nearestBox(pt);
      return n && n.dist <= opts.snapDistancePt ? n : null;
    };
    const from = pick(start, stId);
    const to = pick(end, enId);
    const where = `矢印（${Math.round(start[0])},${Math.round(start[1])} → ${Math.round(end[0])},${Math.round(end[1])} pt）`;
    if (!from || !to) {
      warnings.push(`${where}: ${!from ? '始点' : '終点'}の近くに Box が見つからないため取り込みませんでした`);
      return;
    }
    if (from.box.id === to.box.id) {
      warnings.push(`${where}: 両端が同じ Box「${shortText(from.box.label)}」になるため取り込みませんでした`);
      return;
    }
    const pair = `${from.box.id}>${to.box.id}`;
    if (seenPairs.has(pair)) {
      warnings.push(`${where}: 「${shortText(from.box.label)}」→「${shortText(to.box.label)}」は既にあるため重複を省きました`);
      return;
    }
    seenPairs.add(pair);
    const type = plan.lineType ?? 'RLine';
    const id = genLineIdByType(type, usedLineIds);
    usedLineIds.push(id);
    lines.push({ id, type, from: from.box.id, to: to.box.id, connectionMode: 'center-to-center', shape: 'straight' });
    idByKey[s.key] = id;
  });

  // --- SD / SG ---
  const sdsg: SDSG[] = [];
  const usedSdsgIds = [...opts.existingSdsgIds];
  // ラベルが複数あるときは図の上の並び（上から下、同じ高さなら左から右）で連ねる
  const labelShapes = new Map<string, PptxShape[]>();
  plans.forEach((p) => {
    const sh = shapeBy.get(p.key);
    if (p.role === 'sdsgLabel' && p.labelOf && sh) labelShapes.set(p.labelOf, [...(labelShapes.get(p.labelOf) ?? []), sh]);
  });
  const labelFor = new Map<string, string>();
  labelShapes.forEach((list, k) => {
    const sorted = [...list].sort((a, b) => (Math.abs(a.y - b.y) > 4 ? a.y - b.y : a.x - b.x));
    labelFor.set(k, sorted.map((s) => s.text).filter(Boolean).join('\n'));
  });
  plans.forEach((p) => {
    if (p.role === 'sdsgLabel' && (!p.labelOf || !['sd', 'sg'].includes(planBy.get(p.labelOf)?.role ?? ''))) {
      warnings.push(`「${shortText(shapeBy.get(p.key)?.text ?? '')}」: どの SD/SG のラベルか決まらないため使いませんでした`);
    }
  });
  slide.shapes.forEach((s) => {
    const role = roleOf(s);
    if (role !== 'sd' && role !== 'sg') return;
    const type = role === 'sd' ? 'SD' : 'SG';
    const label = (s.text || labelFor.get(s.key) || '').replace(/\s+$/g, '');
    const sr = R(s);
    if (!label) warnings.push(`${type}（${Math.round(sr.x)},${Math.round(sr.y)} pt）: ラベルになる文字が見つかりませんでした（空のまま取り込みます）`);
    // 紐付け先: 時間方向（x）で最も近い Box。x 範囲に入る Box があれば、その中で縦に近いもの
    const { cx, cy } = centerOf(sr);
    let target: { shape: PptxShape; box: Box } | null = null;
    let bestScore = Infinity;
    boxShapes.forEach((b) => {
      const br = R(b.shape);
      const bc = centerOf(br);
      const inside = cx >= br.x && cx <= br.x + br.w;
      const score = (inside ? 0 : 1e6) + Math.abs(bc.cx - cx) * 10 + Math.abs(bc.cy - cy);
      if (score < bestScore) { bestScore = score; target = b; }
    });
    if (!target) {
      warnings.push(`${type}「${shortText(label)}」: 紐付ける Box が無いため取り込みませんでした`);
      return;
    }
    const t = target as { shape: PptxShape; box: Box };
    const id = genSDSGIdByType(type, usedSdsgIds);
    usedSdsgIds.push(id);
    const bc = centerOf(R(t.shape));
    sdsg.push({
      id, type, label,
      attachedTo: t.box.id, attachedType: 'box',
      timeOffset: Math.round((cx - bc.cx) * sc),
      itemOffset: Math.round((cy - bc.cy) * sc),
      width: Math.max(20, Math.round(sr.w * sc)),
      height: Math.max(20, Math.round(sr.h * sc)),
    });
    idByKey[s.key] = id;
  });

  // --- サブラベル（Box・SD/SG の下の文字） ---
  plans.forEach((p) => {
    if (p.role !== 'subLabel') return;
    const text = (shapeBy.get(p.key)?.text ?? '').replace(/\n/g, ' ');
    const ownerId = p.labelOf ? idByKey[p.labelOf] : undefined;
    const target = boxes.find((b) => b.id === ownerId) ?? sdsg.find((g) => g.id === ownerId);
    if (!target) {
      warnings.push(`「${shortText(text)}」: どの Box・SD/SG のサブラベルか決まらないため使いませんでした`);
      return;
    }
    target.subLabel = target.subLabel ? `${target.subLabel} ${text}` : text;
  });

  // --- 時期ラベル ---
  const periodLabels: PeriodLabel[] = [];
  slide.shapes
    .filter((s) => roleOf(s) === 'period')
    .sort((a, b) => R(a).x - R(b).x)
    .forEach((s) => {
      // ID は既存の時期ラベルと衝突しないよう、手で追加するときと同じ生成器を使う
      const id = genPeriodId();
      periodLabels.push({ id, position: Math.round((px(centerOf(R(s)).cx) / opts.levelPx) * 100) / 100, label: s.text.replace(/\n/g, ' ') });
      idByKey[s.key] = id;
    });

  // --- メモ ---
  const notes: Note[] = [];
  let noteN = 0;
  opts.existingNoteIds.forEach((id) => { const m = id.match(/^Note(\d+)$/); if (m) noteN = Math.max(noteN, Number(m[1])); });
  slide.shapes.filter((s) => roleOf(s) === 'note').forEach((s) => {
    const id = `Note${++noteN}`;
    const r = R(s);
    notes.push({ id, x: px(r.x), y: py(r.y), width: Math.max(40, r.w * sc), height: Math.max(24, r.h * sc), text: s.text, style: 'note' });
    idByKey[s.key] = id;
  });

  if (boxes.length === 0) warnings.push('Box が 1 つもありません。図形の役割を確認してください');
  const unlinked = boxes.filter((b) => !lines.some((l) => l.from === b.id || l.to === b.id));
  if (boxes.length > 1 && unlinked.length > 0) {
    warnings.push(`矢印でつながっていない Box が ${unlinked.length} 個あります（元の図に矢印が無い場合は取り込み後に引いてください）`);
  }
  return { boxes, lines, sdsg, periodLabels, notes, idByKey, warnings };
}
