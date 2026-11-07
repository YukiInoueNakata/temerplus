// ============================================================================
// エクスポート用 印刷レイアウト変換層
// - 元 doc を deep copy して、印刷用の調整（全体スケール・文字サイズ・枠線等）
//   を適用する
// - 元 doc は不変
// - プレビューと実エクスポートで同じ変換関数を共有
// ============================================================================

import { produce } from 'immer';
import type {
  TEMDocument,
  Box,
  Line,
  SDSG,
  Note,
  ProjectSettings,
  Sheet,
} from '../types';
import { computeContentBounds } from './fitBounds';
import { getBoxPreset } from './boxPreset';

// 描画側の既定値（BoxNode・SDSGNode・NoteNode と同じ）。倍率を掛けるときに未指定を補う
const DEF_TYPE_LABEL_FS = 11;
const DEF_SUB_LABEL_FS = 10;
const DEF_ID_FS = 9;
const DEF_SDSG_W = 70;
const DEF_SDSG_H = 40;
const DEF_NOTE_FS = 13; // NoteNode: min(defaultFontSize, NOTE_DEFAULT_FONT_SIZE + 1)
import { getPaperPx, type PaperSizeKey } from './paperSizes';

export type FitMode = 'manual' | 'fit-width' | 'fit-height' | 'fit-both' | 'fit-short';

export interface ExportTransform {
  // フィット制御
  fitMode: FitMode;
  paperSize: PaperSizeKey;
  paperMarginRatio: number;        // 0.05 = 用紙の内側 5% を余白に
  globalScale: number;             // manual 時に使用

  // Box / Line の微調整
  fontSizeDelta: number;
  fontSizeScale: number;
  boxBorderWidthDelta: number;
  lineStrokeWidthDelta: number;
  // Box サイズは不変、中心間距離のみ拡縮（x/y 独立）
  // 横のみ圧縮 / 縦のみ伸長 等が可能。後方互換のため boxGapScale も残す
  boxGapScaleH: number;
  boxGapScaleV: number;
  /** @deprecated boxGapScaleH/V に置き換え。値が指定されていれば H/V の両方に適用 */
  boxGapScale?: number;

  // 補助要素
  typeLabelFontSizeDelta: number;
  subLabelFontSizeDelta: number;
  timeArrowFontSizeDelta: number;
  timeArrowStrokeDelta: number;
  legendFontSizeDelta: number;
  periodLabelFontSizeDelta: number;
  periodLabelStrokeDelta: number;  // 時期区分の境界線の太さ ±

  // 下限ガード
  minFontSize: number;
  minBorderWidth: number;
  // 用紙内中央へ自動配置（要素 bbox の中心を用紙の短辺中央に合わせる）
  autoCenterOnPaper?: boolean;

  // 位置シフト（autoCenterOnPaper の結果からさらに追加で Box / SDSG / 時期ラベル / 凡例を平行移動）
  offsetX: number;                                // world px 単位
  offsetY: number;                                // world px 単位

  // ページ分割（長辺方向分割）
  pageCount: number;                              // 1 = 分割なし
  pageSplitMode: 'overlap' | 'duplicate';         // 既定 overlap
  pageOverlapPx: number;                          // 各ページの隣接側 padding（両モードで有効）
  showContinuationMarkers: boolean;               // duplicate モード時「→続」マーカー表示
}

export const DEFAULT_EXPORT_TRANSFORM: ExportTransform = {
  fitMode: 'manual',
  paperSize: 'A4-landscape',
  paperMarginRatio: 0.05,
  globalScale: 1.0,
  fontSizeDelta: 0,
  fontSizeScale: 1,
  boxBorderWidthDelta: 0,
  lineStrokeWidthDelta: 0,
  boxGapScaleH: 1,
  boxGapScaleV: 1,
  typeLabelFontSizeDelta: 0,
  subLabelFontSizeDelta: 0,
  timeArrowFontSizeDelta: 0,
  timeArrowStrokeDelta: 0,
  legendFontSizeDelta: 0,
  periodLabelFontSizeDelta: 0,
  periodLabelStrokeDelta: 0,
  minFontSize: 6,
  minBorderWidth: 0.5,
  autoCenterOnPaper: true,
  offsetX: 0,
  offsetY: 0,
  pageCount: 1,
  pageSplitMode: 'overlap',
  pageOverlapPx: 50,
  showContinuationMarkers: true,
};

// ----------------------------------------------------------------------------
// フィット倍率の計算
// ----------------------------------------------------------------------------

export function computeFitScale(
  bbox: { width: number; height: number },
  paperSize: PaperSizeKey,
  fitMode: FitMode,
  paperMarginRatio: number,
  customPaperWidth?: number,
  customPaperHeight?: number,
  layout?: 'horizontal' | 'vertical',
): number {
  if (fitMode === 'manual') return 1; // 呼び出し元で globalScale を使う
  const paper = getPaperPx(paperSize, customPaperWidth, customPaperHeight);
  const m = paperMarginRatio ?? 0.05;
  const innerW = Math.max(1, paper.width * (1 - m * 2));
  const innerH = Math.max(1, paper.height * (1 - m * 2));
  const sx = innerW / Math.max(1, bbox.width);
  const sy = innerH / Math.max(1, bbox.height);
  if (fitMode === 'fit-width') return sx;
  if (fitMode === 'fit-height') return sy;
  if (fitMode === 'fit-short') {
    // 短辺フィット：横型レイアウト→y(短辺)に合わせる、縦型→x(短辺)に合わせる
    // 長辺方向は pageCount で分割される前提
    return layout === 'vertical' ? sx : sy;
  }
  return Math.min(sx, sy); // fit-both
}

// ----------------------------------------------------------------------------
// 変換適用
// ----------------------------------------------------------------------------

export function applyExportTransform(
  doc: TEMDocument,
  xf: ExportTransform,
): { doc: TEMDocument; effectiveScale: number; bbox: { x: number; y: number; width: number; height: number } | null } {
  const sheet = doc.sheets.find((s) => s.id === doc.activeSheetId);
  const bounds = sheet ? computeContentBounds(sheet, doc.settings.layout, doc.settings) : null;

  // 1) 全体スケール（座標・サイズ）
  const fitScale = bounds
    ? computeFitScale(bounds, xf.paperSize, xf.fitMode, xf.paperMarginRatio, undefined, undefined, doc.settings.layout)
    : 1;
  const effectiveScale = xf.fitMode === 'manual' ? xf.globalScale : fitScale;

  // 中心基準で Box gap を広げる（x/y 独立）
  // 後方互換: boxGapScale が指定されていれば H/V の両方に適用
  const boxGapH = xf.boxGapScale != null && xf.boxGapScale !== 1 ? xf.boxGapScale : xf.boxGapScaleH;
  const boxGapV = xf.boxGapScale != null && xf.boxGapScale !== 1 ? xf.boxGapScale : xf.boxGapScaleV;

  const newDoc = produce(doc, (d) => {
    // 各シート
    for (const sh of d.sheets) {
      // 中心を求めて Box 間距離の倍率を適用（Box サイズは据え置き、x/y 独立）
      if ((boxGapH !== 1 || boxGapV !== 1) && sh.boxes.length > 0) {
        const xs: number[] = [];
        const ys: number[] = [];
        sh.boxes.forEach((b) => {
          xs.push(b.x + b.width / 2);
          ys.push(b.y + b.height / 2);
        });
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        sh.boxes.forEach((b) => {
          const bcx = b.x + b.width / 2;
          const bcy = b.y + b.height / 2;
          const ncx = cx + (bcx - cx) * boxGapH;
          const ncy = cy + (bcy - cy) * boxGapV;
          b.x = ncx - b.width / 2;
          b.y = ncy - b.height / 2;
        });
        // 時期ラベル位置も連動（Time 軸 = layout により x or y）
        const isH = d.settings.layout === 'horizontal';
        const periodGap = isH ? boxGapH : boxGapV;
        const periodCenter = isH ? cx : cy;
        sh.periodLabels.forEach((p) => {
          // position は Level 値 → px 換算で中心からの距離をスケール
          p.position = (periodCenter + (p.position * 100 - periodCenter) * periodGap) / 100;
        });
      }

      // 2) 全体スケール: 座標・大きさ・文字の大きさを同じ倍率で（SDSG / 時期ラベル / メモ / 曲線の制御点も）。
      //    以前は位置と大きさだけを縮めて文字を縮めず、「両方に収める」で文字が枠からあふれた
      //    （2026-11-07 Mac の確認で発見。メモと制御点は縮めも寄せもしていなかった）
      if (effectiveScale !== 1) {
        sh.boxes.forEach((b) => transformBox(b, effectiveScale, d.settings));
        sh.sdsg.forEach((sg) => transformSDSG(sg, effectiveScale));
        (sh.notes ?? []).forEach((n) => transformNote(n, effectiveScale, d.settings));
        sh.lines.forEach((l) => transformLine(l, effectiveScale));
        // 時期ラベル position（Level 値）は座標スケールに合わせて乗算
        sh.periodLabels.forEach((p) => {
          p.position = p.position * effectiveScale;
        });
      }

      // 3) Box 微調整
      sh.boxes.forEach((b) => applyBoxAdjust(b, d.settings, xf));
      // 4) Line 微調整
      sh.lines.forEach((l) => applyLineAdjust(l, xf));
      // 5) SDSG 微調整
      sh.sdsg.forEach((sg) => applySDSGAdjust(sg, xf));
    }

    // 6) Project settings（凡例スケールも含む）
    applyProjectAdjust(d, xf, effectiveScale);
  });

  // bounds を effectiveScale 適用後に再計算
  const newSheet0 = newDoc.sheets.find((s) => s.id === newDoc.activeSheetId);
  let newBounds = newSheet0
    ? computeContentBounds(newSheet0, newDoc.settings.layout, newDoc.settings)
    : null;

  // 用紙中心へ自動配置（Box / SDSG / 時期ラベルをシフト）
  let finalDoc = newDoc;
  if (xf.autoCenterOnPaper && newBounds) {
    const paper = getPaperPx(xf.paperSize);
    const isH = newDoc.settings.layout === 'horizontal';
    const nPages = Math.max(1, xf.pageCount ?? 1);
    const overlap = Math.max(0, xf.pageOverlapPx ?? 0);
    // ストリップ全長 = paperLong + (N-1) * (paperLong - overlap)
    const totalH = isH
      ? paper.width + (nPages - 1) * (paper.width - overlap)
      : paper.width;
    const totalV = isH
      ? paper.height
      : paper.height + (nPages - 1) * (paper.height - overlap);
    const targetCx = isH ? totalH / 2 : 0;
    const targetCy = isH ? 0 : totalV / 2;
    const bCx = newBounds.x + newBounds.width / 2;
    const bCy = newBounds.y + newBounds.height / 2;
    const ox = targetCx - bCx;
    const oy = targetCy - bCy;
    if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
      finalDoc = produce(newDoc, (d) => {
        for (const sh of d.sheets) {
          shiftSheet(sh, ox, oy);
          sh.periodLabels.forEach((p) => {
            p.position += (isH ? ox : oy) / 100; // LEVEL_PX = 100
          });
        }
        // 凡例位置も同じだけシフト（メインウィンドウと印刷プレビューで同じ相対位置になるよう）
        d.settings.legend.position.x += ox;
        d.settings.legend.position.y += oy;
      });
      const finalSheet = finalDoc.sheets.find((s) => s.id === finalDoc.activeSheetId);
      newBounds = finalSheet
        ? computeContentBounds(finalSheet, finalDoc.settings.layout, finalDoc.settings)
        : newBounds;
    }
  }

  // 追加の位置シフト (offsetX / offsetY)
  const offX = xf.offsetX ?? 0;
  const offY = xf.offsetY ?? 0;
  if (offX !== 0 || offY !== 0) {
    finalDoc = produce(finalDoc, (d) => {
      for (const sh of d.sheets) {
        shiftSheet(sh, offX, offY);
        sh.periodLabels.forEach((p) => {
          p.position += (newDoc.settings.layout === 'horizontal' ? offX : offY) / 100;
        });
      }
      d.settings.legend.position.x += offX;
      d.settings.legend.position.y += offY;
    });
    const finalSheet = finalDoc.sheets.find((s) => s.id === finalDoc.activeSheetId);
    newBounds = finalSheet
      ? computeContentBounds(finalSheet, finalDoc.settings.layout, finalDoc.settings)
      : newBounds;
  }

  return { doc: finalDoc, effectiveScale, bbox: newBounds };
}

/** Box の本文の文字の大きさ（Box 個別 → テーマ → 既定）。描画側の resolveBoxVisuals と同じ順 */
function boxFontSize(b: Box, settings: ProjectSettings): number {
  return b.style?.fontSize ?? getBoxPreset(b.type, settings).fontSize ?? settings.defaultFontSize ?? 13;
}

const mul = (v: number | undefined, s: number) => (v == null ? v : v * s);

function transformBox(b: Box, scale: number, settings: ProjectSettings) {
  b.x *= scale;
  b.y *= scale;
  b.width *= scale;
  b.height *= scale;
  b.style = { ...(b.style ?? {}), fontSize: boxFontSize(b, settings) * scale };
  b.typeLabelFontSize = (b.typeLabelFontSize ?? DEF_TYPE_LABEL_FS) * scale;
  b.subLabelFontSize = (b.subLabelFontSize ?? DEF_SUB_LABEL_FS) * scale;
  b.idFontSize = (b.idFontSize ?? DEF_ID_FS) * scale;
  b.subLabelOffsetX = mul(b.subLabelOffsetX, scale);
  b.subLabelOffsetY = mul(b.subLabelOffsetY, scale);
  b.idOffsetX = mul(b.idOffsetX, scale);
  b.idOffsetY = mul(b.idOffsetY, scale);
}

function transformSDSG(sg: SDSG, scale: number) {
  // 大きさの指定が無い SD/SG は既定の 70×40 で描かれるので、既定値に倍率を掛けて持たせる
  sg.width = (sg.width ?? DEF_SDSG_W) * scale;
  sg.height = (sg.height ?? DEF_SDSG_H) * scale;
  sg.spaceWidth = mul(sg.spaceWidth, scale);
  sg.spaceHeight = mul(sg.spaceHeight, scale);
  sg.timeOffset = (sg.timeOffset ?? 0) * scale;
  sg.itemOffset = (sg.itemOffset ?? 0) * scale;
  sg.style = { ...(sg.style ?? {}), fontSize: (sg.style?.fontSize ?? 11) * scale };
  sg.typeLabelFontSize = (sg.typeLabelFontSize ?? DEF_TYPE_LABEL_FS) * scale;
  sg.subLabelFontSize = (sg.subLabelFontSize ?? DEF_SUB_LABEL_FS) * scale;
  sg.idFontSize = (sg.idFontSize ?? DEF_ID_FS) * scale;
  sg.labelOffsetX = mul(sg.labelOffsetX, scale);
  sg.labelOffsetY = mul(sg.labelOffsetY, scale);
  sg.subLabelOffsetX = mul(sg.subLabelOffsetX, scale);
  sg.subLabelOffsetY = mul(sg.subLabelOffsetY, scale);
  sg.idOffsetX = mul(sg.idOffsetX, scale);
  sg.idOffsetY = mul(sg.idOffsetY, scale);
}

function transformNote(n: Note, scale: number, settings: ProjectSettings) {
  n.x *= scale;
  n.y *= scale;
  n.width *= scale;
  n.height *= scale;
  n.fontSize = (n.fontSize ?? Math.min(settings.defaultFontSize ?? 13, DEF_NOTE_FS)) * scale;
}

function transformLine(l: Line, scale: number) {
  // 曲線の制御点は図の座標そのもの
  if (l.controlPoints) l.controlPoints = l.controlPoints.map((p) => ({ x: p.x * scale, y: p.y * scale }));
  l.idFontSize = (l.idFontSize ?? DEF_ID_FS) * scale;
  l.idOffsetX = mul(l.idOffsetX, scale);
  l.idOffsetY = mul(l.idOffsetY, scale);
}

/** 用紙の中央に寄せる・位置をずらすときに、図の座標を持つものをまとめて動かす */
function shiftSheet(sh: Sheet, dx: number, dy: number) {
  sh.boxes.forEach((b) => { b.x += dx; b.y += dy; });
  (sh.notes ?? []).forEach((n) => { n.x += dx; n.y += dy; });
  sh.lines.forEach((l) => {
    if (l.controlPoints) l.controlPoints = l.controlPoints.map((p) => ({ x: p.x + dx, y: p.y + dy }));
  });
}

function applyBoxAdjust(b: Box, settings: ProjectSettings, xf: ExportTransform) {
  const curFS = boxFontSize(b, settings);
  const newFS = Math.max(xf.minFontSize, curFS * xf.fontSizeScale + xf.fontSizeDelta);
  const curTypeFS = b.typeLabelFontSize ?? 11;
  const curSubFS = b.subLabelFontSize ?? 10;
  b.style = { ...(b.style ?? {}), fontSize: newFS };
  b.typeLabelFontSize = Math.max(xf.minFontSize, curTypeFS + xf.typeLabelFontSizeDelta);
  b.subLabelFontSize = Math.max(xf.minFontSize, curSubFS + xf.subLabelFontSizeDelta);
  // 枠線太さ: 個別に上書きせず style.borderColor は保持、
  // 描画側（BoxNode/exportPPT 等）は BOX_RENDER_SPECS.borderWidth を参照するため、
  // 共通の変更は Project 側で吸収する（後述 applyProjectAdjust 参照）
}

function applyLineAdjust(l: Line, xf: ExportTransform) {
  const cur = l.style?.strokeWidth ?? 1.5;
  l.style = {
    ...(l.style ?? {}),
    strokeWidth: Math.max(xf.minBorderWidth, cur + xf.lineStrokeWidthDelta),
  };
}

function applySDSGAdjust(sg: SDSG, xf: ExportTransform) {
  const curFS = sg.style?.fontSize ?? 11;
  sg.style = {
    ...(sg.style ?? {}),
    fontSize: Math.max(xf.minFontSize, curFS * xf.fontSizeScale + xf.fontSizeDelta),
  };
  if (sg.subLabelFontSize != null) {
    sg.subLabelFontSize = Math.max(xf.minFontSize, sg.subLabelFontSize + xf.subLabelFontSizeDelta);
  }
  if (sg.typeLabelFontSize != null) {
    sg.typeLabelFontSize = Math.max(xf.minFontSize, sg.typeLabelFontSize + xf.typeLabelFontSizeDelta);
  }
}

function applyProjectAdjust(d: TEMDocument, xf: ExportTransform, effectiveScale: number) {
  // 時間矢印・時期区分の文字も図と同じ倍率で縮める
  if (effectiveScale !== 1) {
    d.settings.timeArrow.fontSize *= effectiveScale;
    d.settings.periodLabels.fontSize *= effectiveScale;
  }
  // 時間矢印
  d.settings.timeArrow.fontSize = Math.max(
    xf.minFontSize,
    d.settings.timeArrow.fontSize + xf.timeArrowFontSizeDelta,
  );
  d.settings.timeArrow.strokeWidth = Math.max(
    xf.minBorderWidth,
    d.settings.timeArrow.strokeWidth + xf.timeArrowStrokeDelta,
  );
  // 凡例: 全体スケールと fontSizeDelta を適用
  const leg = d.settings.legend;
  if (effectiveScale !== 1) {
    leg.position.x *= effectiveScale;
    leg.position.y *= effectiveScale;
    leg.fontSize = leg.fontSize * effectiveScale;
    if (leg.titleFontSize != null) leg.titleFontSize = leg.titleFontSize * effectiveScale;
    leg.minWidth = leg.minWidth * effectiveScale;
    if (leg.width != null) leg.width = leg.width * effectiveScale;
    if (leg.height != null) leg.height = leg.height * effectiveScale;
    leg.sampleWidth = leg.sampleWidth * effectiveScale;
    leg.sampleHeight = leg.sampleHeight * effectiveScale;
  }
  leg.fontSize = Math.max(xf.minFontSize, leg.fontSize + xf.legendFontSizeDelta);
  if (leg.titleFontSize != null) {
    leg.titleFontSize = Math.max(xf.minFontSize, leg.titleFontSize + xf.legendFontSizeDelta);
  }
  // SD/SG 配置 band: 座標スケールに合わせて Level 単位の設定も乗算
  if (d.settings.sdsgSpace && effectiveScale !== 1) {
    d.settings.sdsgSpace.bands.top.heightLevel *= effectiveScale;
    d.settings.sdsgSpace.bands.top.offsetLevel *= effectiveScale;
    d.settings.sdsgSpace.bands.bottom.heightLevel *= effectiveScale;
    d.settings.sdsgSpace.bands.bottom.offsetLevel *= effectiveScale;
  }
  // 時期区分
  d.settings.periodLabels.fontSize = Math.max(
    xf.minFontSize,
    d.settings.periodLabels.fontSize + xf.periodLabelFontSizeDelta,
  );
  d.settings.periodLabels.dividerStrokeWidth = Math.max(
    xf.minBorderWidth,
    d.settings.periodLabels.dividerStrokeWidth + xf.periodLabelStrokeDelta,
  );
}

