// ============================================================================
// SD/SG の五角形（画面・SVG 出力で共用）
// - 矢印の向き: 横型 SD=下 / SG=上、縦型 SD=左 / SG=右（いずれも Box の方を指す）
// - rectRatio = 矢印方向の長さのうち矩形部分の比率（残りが三角）
// 以前は SVG 出力だけが首付きの矢印で、縦型の向きも画面と逆だった（2026-10-09 統一）
// ============================================================================

export interface ShapePt { x: number; y: number }

/** (x, y, w, h) の枠に収まる五角形の頂点（時計回り） */
export function sdsgPentagonPoints(
  x: number, y: number, w: number, h: number,
  isH: boolean, isSD: boolean, rectRatio: number,
): ShapePt[] {
  const r = Math.max(0.05, Math.min(0.95, rectRatio));
  if (isH) {
    if (isSD) {
      // 下向き: 矩形が上、三角が下
      const rectBottom = y + h * r;
      return [
        { x, y }, { x: x + w, y }, { x: x + w, y: rectBottom },
        { x: x + w / 2, y: y + h }, { x, y: rectBottom },
      ];
    }
    // 上向き: 三角が上、矩形が下
    const rectTop = y + h * (1 - r);
    return [
      { x: x + w / 2, y }, { x: x + w, y: rectTop }, { x: x + w, y: y + h },
      { x, y: y + h }, { x, y: rectTop },
    ];
  }
  if (isSD) {
    // 左向き: 三角が左、矩形が右
    const rectLeft = x + w * (1 - r);
    return [
      { x: rectLeft, y }, { x: x + w, y }, { x: x + w, y: y + h },
      { x: rectLeft, y: y + h }, { x, y: y + h / 2 },
    ];
  }
  // 右向き: 矩形が左、三角が右
  const rectRight = x + w * r;
  return [
    { x, y }, { x: rectRight, y }, { x: x + w, y: y + h / 2 },
    { x: rectRight, y: y + h }, { x, y: y + h },
  ];
}

/**
 * PowerPoint のホームベース（右向き五角形）を何度回せば画面の向きになるか。
 * 横型 SD=下(90) / SG=上(270)、縦型 SD=左(180) / SG=右(0)
 */
export function sdsgPptRotation(isH: boolean, isSD: boolean): number {
  if (isH) return isSD ? 90 : 270;
  return isSD ? 180 : 0;
}

// ----------------------------------------------------------------------------
// 種別ラベル（SD / SG）とサブラベルの配置（画面・SVG・PPTX で共用）
// - 種別ラベルは図形の外側（Box と反対側）: 横型 SD=上 / SG=下、縦型 SD=右 / SG=左
// - サブラベルは横型=下 / 縦型=右
// 横型 SG・縦型 SD では両者が同じ側に来て重なっていた（2026-10-09）。そのときだけ、
// サブラベルを種別ラベルの外側へずらす
// ----------------------------------------------------------------------------

/** 種別ラベルの行の高さ（font-size に対する比）。画面でもこの値を明示して寸法を確定させる */
export const SDSG_TYPE_TAG_LINE_HEIGHT = 1.4;
/** 図形とラベルのあいだ（px） */
export const SDSG_LABEL_GAP = 6;

/** 種別ラベルが図形の下（横型）/ 右（縦型）＝サブラベルと同じ側に来るか */
export function sdsgTypeTagOnSubLabelSide(isH: boolean, isSD: boolean): boolean {
  return isH ? !isSD : isSD;
}

/**
 * サブラベルを外側へずらす量（px）。重ならない向きなら 0。
 * 種別ラベルの厚み = 行の高さ + padding（画面の typeTag は 2px 4px。横書きは上下 2px、
 * 縦書きは左右 4px が厚み方向）+ 枠線、さらに 2px あける
 */
export function sdsgSubLabelShift(opts: {
  isH: boolean;
  isSD: boolean;
  typeTagVisible: boolean;
  typeFontSize: number;
  typeBorderWidth?: number;
}): number {
  if (!opts.typeTagVisible || !sdsgTypeTagOnSubLabelSide(opts.isH, opts.isSD)) return 0;
  const padding = opts.isH ? 4 : 8;
  const border = (opts.typeBorderWidth ?? 0) * 2;
  return opts.typeFontSize * SDSG_TYPE_TAG_LINE_HEIGHT + padding + border + 2;
}

/** PPTX 出力で SD/SG の図形に付ける名前の接頭辞（例「TEMer SD」）。取り込みで TEMer 自身の出力を見分ける */
export const PPTX_SDSG_NAME_PREFIX = 'TEMer ';
