// ============================================================================
// 図要素の矩形収集
// - Box / SD・SG / ラベル類 / 時期ラベル / 時間軸ラベル / 凡例 の世界座標での矩形を返す
// - fitBounds（全体表示の bbox）と overlapDetect（重なり検出）の共通土台
//   ※ SD/SG の位置計算は band / between / attached の 3 モードがあり分岐が多いので、
//     両者で二重に実装せずここに集約する
// ============================================================================

import type { Sheet, ProjectSettings, LayoutDirection, Box, SDSG } from '../types';
import { computeSDSGBandLayout, sdsgBandKey, computeBandRowAssignments, computeSDSGBandPosition } from './sdsgSpaceLayout';
import { resolveBetweenEndpoint } from './sdsgBetween';
import { computeTimeArrow } from './timeArrow';
import { computePeriodLabels } from './periodLabels';
import { computeLegendItems, computeLegendColumns } from './legend';
import { computeBoxDisplay } from './typeDisplay';
import { computeLinePath, sampleCurveToSegments, type Pt } from './linePath';
import { canvasMeasurer, measureWrapped, type TextMeasurer } from './textMeasure';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 要素のどの部分か。重なりの報告で「何と何が当たったか」を言うために使う */
export type ElementPart =
  | 'box'            // Box の本体矩形
  | 'boxLabel'       // Box 内の本文テキスト
  | 'subLabel'       // Box / SD・SG のサブラベル（枠の外に出る）
  | 'typeLabel'      // 種別バッジ（BFP-2 等。枠の外に出る）
  | 'sdsg'           // SD/SG の本体矩形
  | 'periodLabel'    // 時期ラベル
  | 'timeArrowLabel' // 非可逆的時間のラベル
  | 'legend';        // 凡例

export interface ElementRect {
  /** 元の要素 ID（Box / SDSG の ID。凡例や時間軸は固定文字列） */
  id: string;
  part: ElementPart;
  rect: Rect;
  /** 表示テキスト（報告メッセージ用） */
  text?: string;
  /**
   * boxLabel のみ: 枠からのはみ出し量（px）。0 なら収まっている。
   * テキストのはみ出し検出で使う。
   */
  overflow?: { x: number; y: number };
}

export interface LineSegments {
  id: string;
  points: Pt[];
}

const rectOf = (x: number, y: number, width: number, height: number): Rect => ({ x, y, width, height });

// ----------------------------------------------------------------------------
// SD/SG の矩形（band / between / attached）
// ----------------------------------------------------------------------------

/**
 * シート内の全 SD/SG の矩形を返す。位置が決まらないものは含めない。
 * （fitBounds が持っていたロジックをそのまま移してきたもの）
 */
export function collectSDSGRects(
  sheet: Sheet,
  layout: LayoutDirection,
  settings: ProjectSettings,
): Array<{ sdsg: SDSG; rect: Rect }> {
  const out: Array<{ sdsg: SDSG; rect: Rect }> = [];
  const isH = layout === 'horizontal';
  const bandEnabled = settings.sdsgSpace?.enabled;
  const boxById = new Map(sheet.boxes.map((b) => [b.id, b]));
  const lineById = new Map(sheet.lines.map((l) => [l.id, l]));

  // band モード事前計算（有効時のみ）
  const bandEntries: Record<'top' | 'bottom', Array<{ id: string; timeStart: number; timeEnd: number; rowOverride?: number }>> = { top: [], bottom: [] };
  if (bandEnabled) {
    sheet.sdsg.forEach((sg) => {
      const bk = sdsgBandKey(sg);
      if (!bk) return;
      let tS: number, tE: number;
      if (sg.anchorMode === 'between' && sg.attachedTo2) {
        const ep1 = resolveBetweenEndpoint(sg.attachedTo, boxById, lineById, isH);
        const ep2 = resolveBetweenEndpoint(sg.attachedTo2, boxById, lineById, isH);
        if (!ep1 || !ep2) return;
        const mode = sg.betweenMode ?? 'edge-to-edge';
        const left = ep1.timeStart <= ep2.timeStart ? ep1 : ep2;
        const right = ep1.timeStart <= ep2.timeStart ? ep2 : ep1;
        if (mode === 'edge-to-edge') { tS = left.timeStart; tE = right.timeStart + right.timeSize; }
        else { tS = left.timeStart + left.timeSize / 2; tE = right.timeStart + right.timeSize / 2; }
      } else {
        const attached = sheet.boxes.find((b) => b.id === sg.attachedTo);
        if (!attached) return;
        const centerT = isH ? attached.x + attached.width / 2 : attached.y + attached.height / 2;
        const timeAxisSize = isH
          ? (sg.spaceWidth ?? sg.width ?? 70)
          : (sg.spaceHeight ?? sg.height ?? 40);
        tS = centerT - timeAxisSize / 2;
        tE = centerT + timeAxisSize / 2;
      }
      bandEntries[bk].push({ id: sg.id, timeStart: tS, timeEnd: tE, rowOverride: sg.spaceRowOverride });
    });
  }
  const topRowsAll = bandEnabled ? computeBandRowAssignments(bandEntries.top) : new Map<string, number>();
  const bottomRowsAll = bandEnabled ? computeBandRowAssignments(bandEntries.bottom) : new Map<string, number>();
  const topRows = bandEnabled && settings.sdsgSpace?.autoArrange ? topRowsAll : new Map<string, number>();
  const bottomRows = bandEnabled && settings.sdsgSpace?.autoArrange ? bottomRowsAll : new Map<string, number>();
  const topTotalRows = Math.max(1, ...Array.from(topRowsAll.values()).map((v) => v + 1));
  const bottomTotalRows = Math.max(1, ...Array.from(bottomRowsAll.values()).map((v) => v + 1));
  const bandLayout = bandEnabled
    ? computeSDSGBandLayout(sheet, layout, settings, { top: topTotalRows, bottom: bottomTotalRows })
    : {};

  sheet.sdsg.forEach((sg) => {
    // --- band モード ---
    const bk = sdsgBandKey(sg);
    const band = bk === 'top' ? bandLayout.topBand : bk === 'bottom' ? bandLayout.bottomBand : undefined;
    if (bandEnabled && bk && band) {
      const entry = bandEntries[bk].find((e) => e.id === sg.id);
      if (entry) {
        const rowMap = bk === 'top' ? topRows : bottomRows;
        const totalRows = bk === 'top' ? topTotalRows : bottomTotalRows;
        const rowIdx = rowMap.get(sg.id) ?? 0;
        const timeAnchor = (entry.timeStart + entry.timeEnd) / 2;
        const timeWidth = Math.max(10, entry.timeEnd - entry.timeStart);
        const bandSettings = bk === 'top' ? settings.sdsgSpace?.bands.top : settings.sdsgSpace?.bands.bottom;
        const pos = computeSDSGBandPosition(band, layout, timeAnchor, timeWidth, rowIdx, totalRows, sg, bk,
          { shrinkToFitRow: bandSettings?.shrinkToFitRow !== false });
        out.push({ sdsg: sg, rect: rectOf(pos.x, pos.y, pos.width, pos.height) });
        return;
      }
    }

    // --- between モード ---
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
        const x = anchorX - w / 2 + (isH ? (sg.timeOffset ?? 0) : (sg.itemOffset ?? 0));
        const y = anchorY - h / 2 + (isH ? (sg.itemOffset ?? 0) : (sg.timeOffset ?? 0));
        out.push({ sdsg: sg, rect: rectOf(x, y, w, h) });
        return;
      }
    }

    // --- attached モード ---
    const attachedBox = sheet.boxes.find((b) => b.id === sg.attachedTo);
    let ax = 0, ay = 0;
    if (attachedBox) {
      ax = attachedBox.x + attachedBox.width / 2;
      ay = attachedBox.y + attachedBox.height / 2;
    } else {
      const attachedLine = sheet.lines.find((l) => l.id === sg.attachedTo);
      if (attachedLine) {
        const fromBox = sheet.boxes.find((b) => b.id === attachedLine.from);
        const toBox = sheet.boxes.find((b) => b.id === attachedLine.to);
        if (fromBox && toBox) {
          ax = (fromBox.x + fromBox.width / 2 + toBox.x + toBox.width / 2) / 2;
          ay = (fromBox.y + fromBox.height / 2 + toBox.y + toBox.height / 2) / 2;
        }
      }
    }
    const timeOff = sg.timeOffset ?? 0;
    const itemOff = sg.itemOffset ?? 0;
    const w = sg.width ?? 70;
    const h = sg.height ?? 40;
    const x = ax - w / 2 + (isH ? timeOff : itemOff);
    const y = ay - h / 2 + (isH ? itemOff : timeOff);
    out.push({ sdsg: sg, rect: rectOf(x, y, w, h) });
  });

  return out;
}

// ----------------------------------------------------------------------------
// 付属ラベル（種別バッジ / サブラベル）の矩形
// BoxNode / SDSGNode の CSS 配置規則をそのまま写す:
//   横型: 種別バッジ = 枠の上・中央揃え / サブラベル = 枠の下・中央揃え
//   縦型: 種別バッジ = 枠の左・上下中央   / サブラベル = 枠の右・上下中央
//   いずれも枠から 6px 離す
// ----------------------------------------------------------------------------

const GAP = 6;

function attachedLabelRect(
  base: Rect,
  size: { width: number; height: number },
  side: 'type' | 'sub',
  layout: LayoutDirection,
  offset: { alongTime: number; alongItem: number },
): Rect {
  if (layout === 'horizontal') {
    const x = base.x + base.width / 2 - size.width / 2 + offset.alongTime;
    const y = side === 'type'
      ? base.y - GAP - size.height - offset.alongItem
      : base.y + base.height + GAP + offset.alongItem;
    return rectOf(x, y, size.width, size.height);
  }
  const y = base.y + base.height / 2 - size.height / 2 + offset.alongTime;
  const x = side === 'type'
    ? base.x - GAP - size.width - offset.alongItem
    : base.x + base.width + GAP + offset.alongItem;
  return rectOf(x, y, size.width, size.height);
}

// ----------------------------------------------------------------------------
// 全要素の矩形
// ----------------------------------------------------------------------------

export function collectElementRects(
  sheet: Sheet,
  layout: LayoutDirection,
  settings: ProjectSettings,
  measure: TextMeasurer = canvasMeasurer,
): ElementRect[] {
  const out: ElementRect[] = [];
  const isH = layout === 'horizontal';
  const typeVisibility = settings.typeLabelVisibility as Record<string, boolean | undefined> | undefined;

  // --- Box 本体 / 本文 / 種別バッジ / サブラベル ---
  sheet.boxes.forEach((b) => {
    out.push({ id: b.id, part: 'box', rect: rectOf(b.x, b.y, b.width, b.height), text: b.label });

    // 本文（枠内。padding 4px を引いた内側に収まるべき）
    // 描画は white-space: pre-wrap なので幅で自動折返しされる。折返しを考慮せずに
    // 測ると、日本語のように文字単位で折り返せるテキストを全部「はみ出し」と
    // 誤検出してしまうため、必ず内側の幅で折り返してから比べる。
    const fontSize = b.style?.fontSize ?? settings.defaultFontSize ?? 13;
    const innerW = Math.max(0, b.width - 8);
    const innerH = Math.max(0, b.height - 8);
    const wrapped = measureWrapped(b.label ?? '', innerW, {
      fontSize,
      bold: b.style?.bold,
      fontFamily: b.style?.fontFamily ?? settings.defaultFont,
    }, measure);

    // 自動調整が効いている方向は、描画側が枠を広げる / 文字を縮めるので対象外にする
    //   autoFitText      : Box に収まるまで文字サイズを下げる → はみ出さない
    //   width-fixed      : 幅は固定で高さが自動拡張 → 縦のはみ出しは起きない
    //   height-fixed     : 高さ固定で幅が自動拡張 → 横のはみ出しは起きない
    const autoFitText = b.autoFitText ?? settings.defaultAutoFitText ?? false;
    const fitMode = autoFitText ? 'none' : (b.autoFitBoxMode ?? settings.defaultAutoFitBoxMode ?? 'none');
    const ignoreX = autoFitText || fitMode === 'height-fixed';
    const ignoreY = autoFitText || fitMode === 'width-fixed';

    out.push({
      id: b.id,
      part: 'boxLabel',
      rect: rectOf(b.x + 4, b.y + 4, Math.min(wrapped.width, innerW), wrapped.height),
      text: b.label,
      overflow: {
        x: ignoreX ? 0 : wrapped.overflowX,
        y: ignoreY ? 0 : Math.max(0, wrapped.height - innerH),
      },
    });

    // 種別バッジ
    const typeShown = b.type !== 'normal' && b.type !== 'annotation'
      && (typeVisibility ? typeVisibility[b.type] !== false : true);
    if (typeShown) {
      const text = computeBoxDisplay(sheet.boxes, b, layout);
      if (text) {
        const fs = b.typeLabelFontSize ?? 11;
        const m = measure(text, { fontSize: fs, bold: b.typeLabelBold !== false });
        out.push({
          id: b.id,
          part: 'typeLabel',
          // padding: 2px 4px
          rect: attachedLabelRect(
            rectOf(b.x, b.y, b.width, b.height),
            { width: m.width + 8, height: m.height + 4 },
            'type', layout, { alongTime: 0, alongItem: 0 },
          ),
          text,
        });
      }
    }

    // サブラベル
    const subText = b.subLabel ?? b.participantId ?? '';
    if (subText) {
      const fs = b.subLabelFontSize ?? 10;
      const m = measure(subText, { fontSize: fs });
      const offTime = b.subLabelOffsetX ?? 0;
      const offItem = b.subLabelOffsetY ?? 0;
      out.push({
        id: b.id,
        part: 'subLabel',
        rect: attachedLabelRect(
          rectOf(b.x, b.y, b.width, b.height),
          { width: m.width + 8, height: m.height },
          'sub', layout,
          { alongTime: isH ? offTime : offItem, alongItem: isH ? offItem : offTime },
        ),
        text: subText,
      });
    }
  });

  // --- SD/SG 本体とサブラベル ---
  collectSDSGRects(sheet, layout, settings).forEach(({ sdsg, rect }) => {
    out.push({ id: sdsg.id, part: 'sdsg', rect, text: sdsg.label });
    const subText = sdsg.subLabel ?? '';
    if (!subText) return;
    const fs = sdsg.subLabelFontSize ?? 10;
    const m = measure(subText, { fontSize: fs });
    const offTime = sdsg.subLabelOffsetX ?? 0;
    const offItem = sdsg.subLabelOffsetY ?? 0;
    out.push({
      id: sdsg.id,
      part: 'subLabel',
      rect: attachedLabelRect(
        rect, { width: m.width + 8, height: m.height }, 'sub', layout,
        { alongTime: isH ? offTime : offItem, alongItem: isH ? offItem : offTime },
      ),
      text: subText,
    });
  });

  // --- 時間軸ラベル ---
  if (settings.timeArrow) {
    const arrow = computeTimeArrow(sheet, layout, settings.timeArrow, settings.sdsgSpace, settings.typeLabelVisibility);
    if (arrow && settings.timeArrow.label) {
      const fs = settings.timeArrow.fontSize ?? 14;
      const m = measure(settings.timeArrow.label, { fontSize: fs, bold: settings.timeArrow.labelBold });
      out.push({
        id: 'timeArrow',
        part: 'timeArrowLabel',
        rect: rectOf(arrow.labelX - m.width / 2, arrow.labelY - m.height / 2, m.width, m.height),
        text: settings.timeArrow.label,
      });
    }
  }

  // --- 時期ラベル ---
  if (settings.periodLabels && sheet.periodLabels.length > 0) {
    const geom = computePeriodLabels(sheet, layout, settings.periodLabels, settings.timeArrow, settings.sdsgSpace, settings.typeLabelVisibility);
    if (geom) {
      const fs = settings.periodLabels.fontSize ?? 13;
      geom.items.forEach((it, i) => {
        const m = measure(it.label ?? '', { fontSize: fs });
        out.push({
          id: `period-${i}`,
          part: 'periodLabel',
          rect: rectOf(it.x - m.width / 2, it.y - m.height / 2, m.width, m.height),
          text: it.label,
        });
      });
    }
  }

  // --- 凡例（fitBounds と同じ近似） ---
  if (settings.legend && settings.legend.alwaysVisible) {
    const items = computeLegendItems(sheet, settings.legend, settings.locale);
    if (items.length > 0) {
      const lg = settings.legend;
      const cols = computeLegendColumns(lg, layout, items.length);
      const rows = Math.ceil(items.length / cols);
      const showDesc = lg.showDescriptions === true;
      const titleH = lg.showTitle !== false ? (lg.titleFontSize ?? lg.fontSize * 1.15) * 1.4 + 6 : 0;
      const textRowH = lg.fontSize * (showDesc ? 2 : 1) * 1.4 + 4;
      const rowH = Math.max(textRowH, (lg.sampleHeight ?? 18) + 4);
      const approxH = titleH + rows * rowH + 20;
      const approxW = Math.max(lg.minWidth, ((lg.sampleWidth ?? 32) + 80) * cols) + 16;
      out.push({
        id: 'legend',
        part: 'legend',
        rect: rectOf(lg.position.x, lg.position.y, approxW, approxH),
        text: lg.title,
      });
    }
  }

  return out;
}

/** Line の折れ線（曲線はサンプリングして折れ線に落とす） */
export function collectLineSegments(sheet: Sheet, layout: LayoutDirection): LineSegments[] {
  const boxById = new Map<string, Box>(sheet.boxes.map((b) => [b.id, b]));
  const out: LineSegments[] = [];
  sheet.lines.forEach((l) => {
    const from = boxById.get(l.from);
    const to = boxById.get(l.to);
    if (!from || !to) return;
    const path = computeLinePath(l, from, to, layout);
    const points = path.kind === 'curve' ? sampleCurveToSegments(path) : path.points;
    if (points.length >= 2) out.push({ id: l.id, points });
  });
  return out;
}
