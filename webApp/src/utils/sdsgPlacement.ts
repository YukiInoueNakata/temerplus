// ============================================================================
// 帯に置かない SD/SG（Box・Line に付ける／2 つの間に置く）の位置と、ラベルを含めた広がり
//
// 画面（Canvas）・書き出し・重なりの検査（elementRects）・時間の矢印（timeArrow）・時期ラベル（periodLabels）が
// 同じ計算を使うために 1 か所にまとめた（2026-11-08）。
// それまで時間の矢印と時期ラベルは「付けた Box の左上の角＋ずらし量」で SD/SG の位置を見積もっていたが、
// 画面は「付けた Box の中心＋ずらし量」で描いており、Line に付けたもの・間に置いたものは数えていなかった。
// そのため、下に置いた SG に時間の矢印が重なっていた（神崎・鈴木 2021 のデモ。ユーザー指摘）。
//
// このモジュールは timeArrow・periodLabels・sdsgSpaceLayout を読み込まない（読み込むと呼び出しが輪になる）。
// ============================================================================
import type { Sheet, SDSG, Box, Line, LayoutDirection, TypeLabelVisibilityMap } from '../types';
import { resolveBetweenEndpoint } from './sdsgBetween';
import { sdsgSubLabelShift, SDSG_TYPE_TAG_LINE_HEIGHT, SDSG_LABEL_GAP } from './sdsgShape';

export interface PlacementRect { x: number; y: number; width: number; height: number }

/** 帯に置く SD/SG か（帯の機能が有効かどうかは呼び出し側で判断する） */
export function isBandSDSG(sg: SDSG): boolean {
  return sg.spaceMode === 'band-top' || sg.spaceMode === 'band-bottom';
}

/**
 * 帯に置かない SD/SG の本体の矩形（画面と同じ計算）。位置が決まらないときは null。
 * - 間に置く（anchorMode='between'）: 2 つの端の間。時間の方向の長さは 2 つの端で決まる
 * - Box に付ける: Box の中心＋ずらし量
 * - Line に付ける: Line の両端の Box の中心どうしの中点＋ずらし量
 */
export function nonBandSDSGRect(
  sg: SDSG,
  sheet: Sheet,
  layout: LayoutDirection,
  maps?: { boxById: Map<string, Box>; lineById: Map<string, Line> },
): PlacementRect | null {
  const isH = layout === 'horizontal';
  const boxById = maps?.boxById ?? new Map(sheet.boxes.map((b) => [b.id, b]));
  const lineById = maps?.lineById ?? new Map(sheet.lines.map((l) => [l.id, l]));
  const timeOff = sg.timeOffset ?? 0;
  const itemOff = sg.itemOffset ?? 0;

  if (sg.anchorMode === 'between' && sg.attachedTo2) {
    const ep1 = resolveBetweenEndpoint(sg.attachedTo, boxById, lineById, isH);
    const ep2 = resolveBetweenEndpoint(sg.attachedTo2, boxById, lineById, isH);
    if (ep1 && ep2) {
      const mode = sg.betweenMode ?? 'edge-to-edge';
      const left = ep1.timeStart <= ep2.timeStart ? ep1 : ep2;
      const right = ep1.timeStart <= ep2.timeStart ? ep2 : ep1;
      let startPos: number, endPos: number;
      if (mode === 'edge-to-edge') {
        startPos = left.timeStart;
        endPos = right.timeStart + right.timeSize;
      } else {
        startPos = left.timeStart + left.timeSize / 2;
        endPos = right.timeStart + right.timeSize / 2;
      }
      const timeCenter = (startPos + endPos) / 2;
      const timeSpan = Math.max(10, Math.abs(endPos - startPos));
      const itemCenter = (ep1.itemCenter + ep2.itemCenter) / 2;
      const w = isH ? timeSpan : (sg.width ?? 70);
      const h = isH ? (sg.height ?? 40) : timeSpan;
      const anchorX = isH ? timeCenter : itemCenter;
      const anchorY = isH ? itemCenter : timeCenter;
      return {
        x: anchorX - w / 2 + (isH ? timeOff : itemOff),
        y: anchorY - h / 2 + (isH ? itemOff : timeOff),
        width: w,
        height: h,
      };
    }
    // 端が見つからないときは attached と同じ扱いに落とす（画面と同じ）
  }

  let ax: number, ay: number;
  const box = boxById.get(sg.attachedTo);
  if (box) {
    ax = box.x + box.width / 2;
    ay = box.y + box.height / 2;
  } else {
    const line = lineById.get(sg.attachedTo);
    const from = line ? boxById.get(line.from) : undefined;
    const to = line ? boxById.get(line.to) : undefined;
    if (!from || !to) return null;
    ax = (from.x + from.width / 2 + to.x + to.width / 2) / 2;
    ay = (from.y + from.height / 2 + to.y + to.height / 2) / 2;
  }
  const w = sg.width ?? 70;
  const h = sg.height ?? 40;
  return {
    x: ax - w / 2 + (isH ? timeOff : itemOff),
    y: ay - h / 2 + (isH ? itemOff : timeOff),
    width: w,
    height: h,
  };
}

/** サブラベルの行の高さの倍率（画面の line-height に近い値。見積もり用） */
const SUBLABEL_LINE_HEIGHT = 1.4;

/**
 * 帯に置かない SD/SG の、種別ラベル（SD / SG の文字）とサブラベルを含めた広がり（ストレージ座標の矩形）。
 * 文字の幅は測らずに見積もる（時間の矢印・時期ラベルを SD/SG に重ねないための余裕の計算に使う）。
 * 置き方は elementRects の種別ラベル・サブラベルの矩形と同じ:
 *   横型: SD の種別ラベルは上、SG は下。サブラベルはどちらも下（SG は種別ラベルの外側）
 *   縦型: SD の種別ラベルは右、SG は左。サブラベルはどちらも右（SD は種別ラベルの外側）
 */
export function nonBandSDSGExtent(
  sg: SDSG,
  rect: PlacementRect,
  layout: LayoutDirection,
  typeLabelVisibility?: TypeLabelVisibilityMap,
): PlacementRect {
  const isH = layout === 'horizontal';
  const isSD = sg.type === 'SD';
  let minX = rect.x, maxX = rect.x + rect.width, minY = rect.y, maxY = rect.y + rect.height;

  const typeShown = typeLabelVisibility ? typeLabelVisibility[sg.type] !== false : true;
  const typeFs = sg.typeLabelFontSize ?? 11;
  const typeBorder = sg.typeLabelBorderColor ? (sg.typeLabelBorderWidth ?? 0) : 0;
  if (typeShown) {
    const thick = typeFs * SDSG_TYPE_TAG_LINE_HEIGHT + (isH ? 4 : 8) + typeBorder * 2;
    if (isH) {
      if (isSD) minY = Math.min(minY, rect.y - SDSG_LABEL_GAP - thick);
      else maxY = Math.max(maxY, rect.y + rect.height + SDSG_LABEL_GAP + thick);
    } else {
      if (isSD) maxX = Math.max(maxX, rect.x + rect.width + SDSG_LABEL_GAP + thick);
      else minX = Math.min(minX, rect.x - SDSG_LABEL_GAP - thick);
    }
  }

  const subText = sg.subLabel ?? '';
  if (subText) {
    const fs = sg.subLabelFontSize ?? 10;
    const lines = subText.split('\n');
    const textH = lines.length * fs * SUBLABEL_LINE_HEIGHT;
    // 全角を 1 字 = fs と見て、いちばん長い行の幅を見積もる（半角は 0.6 字）
    const lineW = (s: string) => [...s].reduce((n, c) => n + (/[\u0000-ÿ]/.test(c) ? 0.6 : 1), 0) * fs;
    const textW = Math.max(...lines.map(lineW)) + 8;
    const shift = sdsgSubLabelShift({ isH, isSD, typeTagVisible: typeShown, typeFontSize: typeFs, typeBorderWidth: typeBorder });
    if (isH) {
      const top = rect.y + rect.height + SDSG_LABEL_GAP + (sg.subLabelOffsetY ?? 0) + shift;
      maxY = Math.max(maxY, top + textH);
      minY = Math.min(minY, top);
    } else {
      const left = rect.x + rect.width + SDSG_LABEL_GAP + (sg.subLabelOffsetX ?? 0) + shift;
      maxX = Math.max(maxX, left + textW);
      minX = Math.min(minX, left);
    }
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** 帯に置かない SD/SG の広がり（ラベルを含む）をすべて xs・ys に足す（時間の矢印・時期ラベルの外枠の計算用） */
export function pushNonBandSDSGExtents(
  sheet: Sheet,
  layout: LayoutDirection,
  xs: number[],
  ys: number[],
  typeLabelVisibility?: TypeLabelVisibilityMap,
  opts?: { bandEnabled?: boolean },
): void {
  const maps = { boxById: new Map(sheet.boxes.map((b) => [b.id, b])), lineById: new Map(sheet.lines.map((l) => [l.id, l])) };
  sheet.sdsg.forEach((sg) => {
    // 帯の機能が有効なら、帯に置くものは帯の計算（呼び出し側）に任せる。無効なら帯の指定があっても付けた位置に描かれる
    if (isBandSDSG(sg) && opts?.bandEnabled !== false) return;
    const rect = nonBandSDSGRect(sg, sheet, layout, maps);
    if (!rect) return;
    const e = nonBandSDSGExtent(sg, rect, layout, typeLabelVisibility);
    xs.push(e.x, e.x + e.width);
    ys.push(e.y, e.y + e.height);
  });
}
