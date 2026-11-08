// ============================================================================
// CSV インポート用ユーティリティ
// - papaparse でパース、自動ヘッダ検出、列マッピング
// - Box / Line / SDSG / 時期ラベルの 4 エンティティに対応
// ============================================================================

import Papa from 'papaparse';
import type { Box, BoxType, Line, LineType, LineShape, SDSG, SDSGType, PeriodLabel, TextOrientation } from '../types';
import { decodeCsvBytes } from './tabularFile';
import i18n from '../i18n';

export type CsvFieldKind =
  | 'ignore'
  | 'label'
  | 'type'
  | 'timeLevel'
  | 'itemLevel'
  | 'id'
  | 'subLabel'
  | 'description'
  | 'width'
  | 'height';

// 表示名は画面の言語で毎回引く（getter）。呼び出し側はキーの順だけを使う
export const FIELD_LABELS: Record<CsvFieldKind, string> = {
  get ignore() { return i18n.t('csvImport:field.ignore'); },
  get label() { return i18n.t('csvImport:field.label'); },
  get type() { return i18n.t('csvImport:field.type'); },
  timeLevel: 'Time Level',
  itemLevel: 'Item Level',
  id: 'ID',
  get subLabel() { return i18n.t('csvImport:field.sublabel'); },
  get description() { return i18n.t('csvImport:field.description'); },
  get width() { return i18n.t('csvImport:field.width'); },
  get height() { return i18n.t('csvImport:field.height'); },
};

/** 種別キーワード辞書（日英両対応。小文字で比較） */
export const TYPE_DICT: Record<string, BoxType> = {
  // 英名（そのまま）
  'normal': 'normal',
  'bfp': 'BFP',
  'efp': 'EFP',
  'p-efp': 'P-EFP',
  'pefp': 'P-EFP',
  'p_efp': 'P-EFP',
  'opp': 'OPP',
  'annotation': 'annotation',
  '2nd-efp': '2nd-EFP',
  '2ndefp': '2nd-EFP',
  'p-2nd-efp': 'P-2nd-EFP',
  // 日本語
  '通常': 'normal', // i18n-ok 利用者のファイルの値と照合
  'その他': 'other', // i18n-ok 利用者のファイルの値と照合
  'other': 'other',
  '経験': 'normal', // i18n-ok 利用者のファイルの値と照合
  'イベント': 'normal', // i18n-ok 利用者のファイルの値と照合
  '出来事': 'normal', // i18n-ok 利用者のファイルの値と照合
  '分岐点': 'BFP', // i18n-ok 利用者のファイルの値と照合
  '等至点': 'EFP', // i18n-ok 利用者のファイルの値と照合
  '両極化等至点': 'P-EFP', // i18n-ok 利用者のファイルの値と照合
  '両極化': 'P-EFP', // i18n-ok 利用者のファイルの値と照合
  '必須通過点': 'OPP', // i18n-ok 利用者のファイルの値と照合
  '潜在経験': 'annotation', // i18n-ok 利用者のファイルの値と照合
  '想定': 'annotation', // i18n-ok 利用者のファイルの値と照合
  '第二等至点': '2nd-EFP', // i18n-ok 利用者のファイルの値と照合
  '両極化第二等至点': 'P-2nd-EFP', // i18n-ok 利用者のファイルの値と照合する
  // 正式な表記（2026-11-08 ユーザー決定）。上の古い表記も前のファイルのために残す
  '両極化した等至点': 'P-EFP', // i18n-ok 利用者のファイルの値と照合
  '第 2 等至点': '2nd-EFP', // i18n-ok 利用者のファイルの値と照合
  '第2等至点': '2nd-EFP', // i18n-ok 利用者のファイルの値と照合
  '両極化した第 2 等至点': 'P-2nd-EFP', // i18n-ok 利用者のファイルの値と照合
  '両極化した第2等至点': 'P-2nd-EFP', // i18n-ok 利用者のファイルの値と照合
  'セカンド等至点': '2nd-EFP', // i18n-ok 利用者のファイルの値と照合（正式な表記。2026-11-08）
  '両極化したセカンド等至点': 'P-2nd-EFP', // i18n-ok 利用者のファイルの値と照合
  // 英語の用語名（terms.csv の英語）。MAXQDA の取り込みが部分一致で引くので、長い語（それを含む語）を先に置く
  'polarized second equifinality point': 'P-2nd-EFP',
  'second equifinality point': '2nd-EFP',
  'polarized equifinality point': 'P-EFP',
  'equifinality point': 'EFP',
  'bifurcation point': 'BFP',
  'obligatory passage point': 'OPP',
  'latent experience': 'annotation',
};

export function mapBoxType(raw: string): BoxType {
  const key = (raw ?? '').trim().toLowerCase();
  if (!key) return 'normal';
  if (TYPE_DICT[key]) return TYPE_DICT[key];
  // 日本語は lowercase しても同じなので直接引く
  if (TYPE_DICT[raw.trim()]) return TYPE_DICT[raw.trim()];
  return 'normal';
}

// ----------------------------------------------------------------------------
// パース
// ----------------------------------------------------------------------------

export interface ParsedCsv {
  rows: string[][];        // 2 次元生データ
  probableHeader: boolean; // 1 行目がヘッダと推定されるか
  delimiter: string;
}

export function parseCsvText(text: string): ParsedCsv {
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: 'greedy',
    delimiter: '',           // 自動判定
  });
  const rows = (result.data ?? []).map((r) => r.map((c) => (c ?? '').toString()));
  const delim = (result.meta as { delimiter?: string }).delimiter ?? ',';
  // ヘッダ推定: 1 行目に非数値のセルがあればヘッダ
  let probableHeader = false;
  if (rows.length > 0) {
    const first = rows[0];
    const allNonNumeric = first.every((c) => c !== '' && !/^-?\d+(?:\.\d+)?$/.test(c.trim()));
    const hasHeaderKeyword = first.some((c) => /^(label|type|id|time|item|sub|description|種別|ラベル|時間|位置|説明|サブ)/i.test(c.trim())); // i18n-ok 利用者の見出しと照合
    probableHeader = allNonNumeric || hasHeaderKeyword;
  }
  return { rows, probableHeader, delimiter: delim };
}

export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  // Shift_JIS の CSV（日本語版 Excel の保存）も読む
  const { text } = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
  // BOM 除去
  const clean = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  return parseCsvText(clean);
}

// ----------------------------------------------------------------------------
// 列名からの自動マッピング推定
// ----------------------------------------------------------------------------

export function guessFieldKind(header: string): CsvFieldKind {
  const h = header.trim().toLowerCase();
  if (!h) return 'ignore';
  if (/^(label|ラベル|名前|name)$/.test(h)) return 'label'; // i18n-ok 利用者の見出しと照合
  if (/^(type|種別|種類|kind)$/.test(h)) return 'type'; // i18n-ok 利用者の見出しと照合
  if (/^(time|time[_ ]?level|時間|時間レベル|timelevel)$/i.test(h)) return 'timeLevel'; // i18n-ok 利用者の見出しと照合
  if (/^(item|item[_ ]?level|項目|項目レベル|itemlevel)$/i.test(h)) return 'itemLevel'; // i18n-ok 利用者の見出しと照合
  if (/^(id|識別)$/i.test(h)) return 'id'; // i18n-ok 利用者の見出しと照合
  if (/^(sub|sub[_ ]?label|subtitle|サブ|サブラベル)$/i.test(h)) return 'subLabel'; // i18n-ok 利用者の見出しと照合
  if (/^(desc|description|説明)$/i.test(h)) return 'description'; // i18n-ok 利用者の見出しと照合
  if (/^(width|w|幅)$/i.test(h)) return 'width'; // i18n-ok 利用者の見出しと照合
  if (/^(height|h|高さ)$/i.test(h)) return 'height'; // i18n-ok 利用者の見出しと照合
  return 'ignore';
}

// ----------------------------------------------------------------------------
// Box 配列生成
// ----------------------------------------------------------------------------

export interface ImportOptions {
  mapping: CsvFieldKind[];               // 列ごとのフィールド割当（列数と同じ長さ）
  hasHeader: boolean;                    // 1 行目を飛ばす
  defaultType: BoxType;                  // type 列がない/空の場合
  defaultWidth: number;
  defaultHeight: number;
  defaultFontSize: number;
  defaultTextOrientation?: TextOrientation; // 通常 Box 挿入と揃えるため layout 由来で渡す
  // 挿入位置計算
  startTimeLevel: number;                // timeLevel 列がない場合の開始値
  baseItemLevel: number;                 // itemLevel 列がない場合の値
  // 後続の自動接続
  autoConnect: boolean;
  connectLineType: 'RLine' | 'XLine';
  // 既存 ID との衝突時の扱い: 新 ID 採番
  existingIds: Set<string>;
  // レイアウト方向（Level → px 変換用）
  levelPx: number;                       // 通常 100
}

export interface ImportResult {
  boxes: Box[];
  lines: Line[];          // autoConnect 時の順次接続
  errors: string[];       // スキップ/警告
}

/**
 * パース済み rows から Box 配列を生成する
 */
export function buildBoxesFromRows(rows: string[][], opts: ImportOptions): ImportResult {
  const boxes: Box[] = [];
  const lines: Line[] = [];
  const errors: string[] = [];
  const mappingIndex: Partial<Record<CsvFieldKind, number>> = {};
  opts.mapping.forEach((k, i) => {
    if (k !== 'ignore') mappingIndex[k] = i;
  });

  const data = opts.hasHeader ? rows.slice(1) : rows;
  const localIds = new Set<string>(opts.existingIds);
  const typeCounter: Partial<Record<BoxType, number>> = {};

  const uniqueId = (base: string): string => {
    if (!localIds.has(base)) {
      localIds.add(base);
      return base;
    }
    let n = 2;
    while (localIds.has(`${base}_${n}`)) n++;
    const id = `${base}_${n}`;
    localIds.add(id);
    return id;
  };

  const autoIdFor = (type: BoxType): string => {
    const prefix = type === 'normal' ? 'Item'
      : type === 'BFP' ? 'BFP'
      : type === 'EFP' ? 'EFP'
      : type === 'P-EFP' ? 'P_EFP'
      : type === 'OPP' ? 'OPP'
      : type === 'other' ? 'Other'
      : type === 'annotation' ? 'Latent'
      : type === '2nd-EFP' ? 'EFP2'
      : 'P_EFP2';
    typeCounter[type] = (typeCounter[type] ?? 0) + 1;
    return uniqueId(`${prefix}${typeCounter[type]}`);
  };

  const cell = (row: string[], kind: CsvFieldKind): string | undefined => {
    const i = mappingIndex[kind];
    if (i == null) return undefined;
    return row[i];
  };

  data.forEach((row, rowIdx) => {
    const labelRaw = cell(row, 'label');
    const label = (labelRaw ?? '').trim();
    if (!label) {
      errors.push(i18n.t('csvImport:error.nolabel', { row: rowIdx + 1 + (opts.hasHeader ? 1 : 0) }));
      return;
    }

    // type
    const typeRaw = cell(row, 'type');
    const type = typeRaw ? mapBoxType(typeRaw) : opts.defaultType;

    // ID
    const idRaw = cell(row, 'id');
    const id = idRaw ? uniqueId(idRaw.trim()) : autoIdFor(type);

    // timeLevel / itemLevel
    const tlRaw = cell(row, 'timeLevel');
    const ilRaw = cell(row, 'itemLevel');
    const timeLevel = tlRaw && tlRaw.trim() !== ''
      ? Number(tlRaw)
      : opts.startTimeLevel + boxes.length;
    const itemLevel = ilRaw && ilRaw.trim() !== ''
      ? Number(ilRaw)
      : opts.baseItemLevel;
    if (!isFinite(timeLevel) || !isFinite(itemLevel)) {
      errors.push(i18n.t('csvImport:error.levelnan', { row: rowIdx + 1 }));
      return;
    }

    // width / height
    const wRaw = cell(row, 'width');
    const hRaw = cell(row, 'height');
    const width = wRaw ? Math.max(10, Number(wRaw)) : opts.defaultWidth;
    const height = hRaw ? Math.max(10, Number(hRaw)) : opts.defaultHeight;

    // 座標（ユーザ座標: Level → px、item は layout 依存だがここでは storage y = -itemLevel * LEVEL_PX、
    //       x = timeLevel * LEVEL_PX という単純対応でインポート。レイアウト方向による変換は呼び出し側で）
    const x = timeLevel * opts.levelPx;
    const y = -itemLevel * opts.levelPx;

    const subLabel = cell(row, 'subLabel')?.trim() || undefined;
    const description = cell(row, 'description')?.trim() || undefined;

    const b: Box = {
      id,
      type,
      label,
      x,
      y,
      width,
      height,
      ...(opts.defaultTextOrientation ? { textOrientation: opts.defaultTextOrientation } : {}),
      ...(subLabel ? { subLabel } : {}),
      ...(description ? { description } : {}),
      style: { fontSize: opts.defaultFontSize },
    };
    boxes.push(b);
  });

  // 順次接続
  if (opts.autoConnect && boxes.length >= 2) {
    const linePrefix = opts.connectLineType === 'XLine' ? 'XL_' : 'RL_';
    for (let i = 0; i < boxes.length - 1; i++) {
      lines.push({
        id: `${linePrefix}csv_${i + 1}`,
        type: opts.connectLineType,
        from: boxes[i].id,
        to: boxes[i + 1].id,
        connectionMode: 'center-to-center',
        shape: 'straight',
      });
    }
  }

  return { boxes, lines, errors };
}

// ============================================================================
// Line インポート
// ============================================================================

export type LineCsvFieldKind = 'ignore' | 'id' | 'from' | 'to' | 'type' | 'shape' | 'label' | 'description';

export const LINE_FIELD_LABELS: Record<LineCsvFieldKind, string> = {
  get ignore() { return i18n.t('csvImport:field.ignore'); },
  id: 'ID',
  from: 'From',
  to: 'To',
  get type() { return i18n.t('csvImport:line.type'); },
  get shape() { return i18n.t('csvImport:line.shape'); },
  get label() { return i18n.t('csvImport:field.label'); },
  get description() { return i18n.t('csvImport:field.description'); },
};

export function guessLineFieldKind(header: string): LineCsvFieldKind {
  const h = header.trim().toLowerCase();
  if (!h) return 'ignore';
  if (/^(id|識別)$/i.test(h)) return 'id'; // i18n-ok 利用者の見出しと照合
  if (/^(from|始点|起点)$/i.test(h)) return 'from'; // i18n-ok 利用者の見出しと照合
  if (/^(to|終点)$/i.test(h)) return 'to'; // i18n-ok 利用者の見出しと照合
  if (/^(type|種別|種類|kind)$/i.test(h)) return 'type'; // i18n-ok 利用者の見出しと照合
  if (/^(shape|形状)$/i.test(h)) return 'shape'; // i18n-ok 利用者の見出しと照合
  if (/^(label|ラベル|名前|name)$/i.test(h)) return 'label'; // i18n-ok 利用者の見出しと照合
  if (/^(desc|description|説明)$/i.test(h)) return 'description'; // i18n-ok 利用者の見出しと照合
  return 'ignore';
}

const LINE_TYPE_DICT: Record<string, LineType> = {
  rline: 'RLine', solid: 'RLine', '実線': 'RLine', '実線矢印': 'RLine', // i18n-ok 利用者のファイルの値と照合
  xline: 'XLine', dashed: 'XLine', dotted: 'XLine', '点線': 'XLine', '点線矢印': 'XLine', '破線': 'XLine', // i18n-ok 同上
  'solid path': 'RLine', 'dashed path': 'XLine', // 英語の用語名（terms.csv の line.*）
  'solid arrow': 'RLine', 'dashed arrow': 'XLine', 'dotted arrow': 'XLine', // 前の英語の用語名（2026-11-08 まで）
};
const LINE_SHAPE_DICT: Record<string, LineShape> = {
  straight: 'straight', '直線': 'straight', // i18n-ok 利用者のファイルの値と照合
  elbow: 'elbow', l: 'elbow', 'l字': 'elbow', '折れ線': 'elbow', // i18n-ok 同上
  curve: 'curve', '曲線': 'curve', bezier: 'curve', // i18n-ok 同上
};

export function mapLineType(raw: string): LineType {
  const key = (raw ?? '').trim().toLowerCase();
  return LINE_TYPE_DICT[key] ?? 'RLine';
}

export function mapLineShape(raw: string): LineShape {
  const key = (raw ?? '').trim().toLowerCase();
  return LINE_SHAPE_DICT[key] ?? 'straight';
}

export interface LineImportOptions {
  mapping: LineCsvFieldKind[];
  hasHeader: boolean;
  defaultType: LineType;
  defaultShape: LineShape;
  existingIds: Set<string>;
  validBoxIds: Set<string>;          // from/to の妥当性チェック用
}

export interface LineImportResult {
  lines: Line[];
  errors: string[];
}

export function buildLinesFromRows(rows: string[][], opts: LineImportOptions): LineImportResult {
  const lines: Line[] = [];
  const errors: string[] = [];
  const mappingIndex: Partial<Record<LineCsvFieldKind, number>> = {};
  opts.mapping.forEach((k, i) => {
    if (k !== 'ignore') mappingIndex[k] = i;
  });
  const data = opts.hasHeader ? rows.slice(1) : rows;
  const localIds = new Set<string>(opts.existingIds);
  let counter = 0;

  const uniqueId = (base: string): string => {
    if (!localIds.has(base)) { localIds.add(base); return base; }
    let n = 2;
    while (localIds.has(`${base}_${n}`)) n++;
    const id = `${base}_${n}`;
    localIds.add(id);
    return id;
  };

  const cell = (row: string[], kind: LineCsvFieldKind): string | undefined => {
    const i = mappingIndex[kind];
    return i == null ? undefined : row[i];
  };

  data.forEach((row, idx) => {
    const rowNum = idx + 1 + (opts.hasHeader ? 1 : 0);
    const from = (cell(row, 'from') ?? '').trim();
    const to = (cell(row, 'to') ?? '').trim();
    if (!from || !to) {
      errors.push(i18n.t('csvImport:error.line.noends', { row: rowNum }));
      return;
    }
    if (!opts.validBoxIds.has(from)) {
      errors.push(i18n.t('csvImport:error.line.nofrom', { row: rowNum, id: from }));
      return;
    }
    if (!opts.validBoxIds.has(to)) {
      errors.push(i18n.t('csvImport:error.line.noto', { row: rowNum, id: to }));
      return;
    }
    const typeRaw = cell(row, 'type');
    const type = typeRaw ? mapLineType(typeRaw) : opts.defaultType;
    const shapeRaw = cell(row, 'shape');
    const shape = shapeRaw ? mapLineShape(shapeRaw) : opts.defaultShape;
    const idRaw = cell(row, 'id');
    counter++;
    const id = idRaw ? uniqueId(idRaw.trim()) : uniqueId(`${type === 'XLine' ? 'XL' : 'RL'}_csv_${counter}`);
    const label = cell(row, 'label')?.trim() || undefined;
    const description = cell(row, 'description')?.trim() || undefined;
    lines.push({
      id, type, from, to,
      connectionMode: 'center-to-center',
      shape,
      ...(label ? { label } : {}),
      ...(description ? { description } : {}),
    });
  });
  return { lines, errors };
}

// ============================================================================
// SDSG インポート
// ============================================================================

export type SDSGCsvFieldKind =
  | 'ignore' | 'id' | 'type' | 'label'
  | 'attachedTo' | 'attachedTo2' | 'anchorMode'
  | 'spaceMode' | 'subLabel' | 'description';

export const SDSG_FIELD_LABELS: Record<SDSGCsvFieldKind, string> = {
  get ignore() { return i18n.t('csvImport:field.ignore'); },
  id: 'ID',
  get type() { return i18n.t('csvImport:sdsg.type'); },
  get label() { return i18n.t('csvImport:field.label'); },
  get attachedTo() { return i18n.t('csvImport:sdsg.attachedto'); },
  get attachedTo2() { return i18n.t('csvImport:sdsg.attachedto2'); },
  get anchorMode() { return i18n.t('csvImport:sdsg.anchormode'); },
  get spaceMode() { return i18n.t('csvImport:sdsg.spacemode'); },
  get subLabel() { return i18n.t('csvImport:field.sublabel'); },
  get description() { return i18n.t('csvImport:field.description'); },
};

export function guessSDSGFieldKind(header: string): SDSGCsvFieldKind {
  const h = header.trim().toLowerCase();
  if (!h) return 'ignore';
  if (/^(id|識別)$/i.test(h)) return 'id'; // i18n-ok 利用者の見出しと照合
  if (/^(type|種別|種類|kind)$/i.test(h)) return 'type'; // i18n-ok 利用者の見出しと照合
  if (/^(label|ラベル|名前|name)$/i.test(h)) return 'label'; // i18n-ok 利用者の見出しと照合
  if (/^(attached.?to2|attachedto2|対象2|対象 ?2)$/i.test(h)) return 'attachedTo2'; // i18n-ok 利用者の見出しと照合
  if (/^(attached.?to|attachedto|対象|紐付け|紐付け対象)$/i.test(h)) return 'attachedTo'; // i18n-ok 利用者の見出しと照合
  if (/^(anchor|anchormode|アンカー|アンカー方式)$/i.test(h)) return 'anchorMode'; // i18n-ok 利用者の見出しと照合
  if (/^(space|spacemode|配置|配置モード|モード)$/i.test(h)) return 'spaceMode'; // i18n-ok 利用者の見出しと照合
  if (/^(sub|sub[_ ]?label|サブ|サブラベル)$/i.test(h)) return 'subLabel'; // i18n-ok 利用者の見出しと照合
  if (/^(desc|description|説明)$/i.test(h)) return 'description'; // i18n-ok 利用者の見出しと照合
  return 'ignore';
}

const SDSG_TYPE_DICT: Record<string, SDSGType> = {
  sd: 'SD', '社会的方向': 'SD', '社会的方向づけ': 'SD', // i18n-ok 利用者のファイルの値と照合
  sg: 'SG', '社会的助勢': 'SG', '社会的ガイド': 'SG', '社会的ガイダンス': 'SG', '社会的支援': 'SG', // i18n-ok 同上（正式は社会的助勢。旧称も読む）
  'social direction': 'SD', 'social guidance': 'SG', // 英語の用語名（terms.csv の SD・SG）
};

export function mapSDSGType(raw: string): SDSGType {
  const key = (raw ?? '').trim().toLowerCase();
  return SDSG_TYPE_DICT[key] ?? (SDSG_TYPE_DICT[raw.trim()] ?? 'SD');
}

export interface SDSGImportOptions {
  mapping: SDSGCsvFieldKind[];
  hasHeader: boolean;
  existingIds: Set<string>;
  validBoxIds: Set<string>;
  validLineIds: Set<string>;
}

export interface SDSGImportResult {
  sdsgs: SDSG[];
  errors: string[];
}

export function buildSDSGsFromRows(rows: string[][], opts: SDSGImportOptions): SDSGImportResult {
  const sdsgs: SDSG[] = [];
  const errors: string[] = [];
  const mappingIndex: Partial<Record<SDSGCsvFieldKind, number>> = {};
  opts.mapping.forEach((k, i) => {
    if (k !== 'ignore') mappingIndex[k] = i;
  });
  const data = opts.hasHeader ? rows.slice(1) : rows;
  const localIds = new Set<string>(opts.existingIds);
  let sdCount = 0, sgCount = 0;

  const uniqueId = (base: string): string => {
    if (!localIds.has(base)) { localIds.add(base); return base; }
    let n = 2;
    while (localIds.has(`${base}_${n}`)) n++;
    const id = `${base}_${n}`;
    localIds.add(id);
    return id;
  };

  const cell = (row: string[], kind: SDSGCsvFieldKind): string | undefined => {
    const i = mappingIndex[kind];
    return i == null ? undefined : row[i];
  };

  const resolveAttachedType = (id: string): 'box' | 'line' | null => {
    if (opts.validBoxIds.has(id)) return 'box';
    if (opts.validLineIds.has(id)) return 'line';
    return null;
  };

  data.forEach((row, idx) => {
    const rowNum = idx + 1 + (opts.hasHeader ? 1 : 0);
    const attachedTo = (cell(row, 'attachedTo') ?? '').trim();
    if (!attachedTo) {
      errors.push(i18n.t('csvImport:error.sdsg.noattached', { row: rowNum }));
      return;
    }
    const attachedType = resolveAttachedType(attachedTo);
    if (!attachedType) {
      errors.push(i18n.t('csvImport:error.sdsg.attachednotfound', { row: rowNum, id: attachedTo }));
      return;
    }
    const typeRaw = cell(row, 'type');
    const type = typeRaw ? mapSDSGType(typeRaw) : 'SD';
    const idRaw = cell(row, 'id');
    let id: string;
    if (idRaw) {
      id = uniqueId(idRaw.trim());
    } else {
      if (type === 'SD') { sdCount++; id = uniqueId(`SD${sdCount}`); }
      else { sgCount++; id = uniqueId(`SG${sgCount}`); }
    }
    const label = cell(row, 'label')?.trim() || type;
    const at2Raw = (cell(row, 'attachedTo2') ?? '').trim();
    const attachedTo2 = at2Raw || undefined;
    if (attachedTo2 && !resolveAttachedType(attachedTo2)) {
      errors.push(i18n.t('csvImport:error.sdsg.attached2notfound', { row: rowNum, id: attachedTo2 }));
    }
    const anchorRaw = (cell(row, 'anchorMode') ?? '').trim().toLowerCase();
    const anchorMode: 'single' | 'between' | undefined = anchorRaw === 'between'
      ? 'between'
      : anchorRaw === 'single'
        ? 'single'
        : (attachedTo2 ? 'between' : undefined);
    const spaceRaw = (cell(row, 'spaceMode') ?? '').trim().toLowerCase().replace(/_/g, '-');
    const spaceMode: 'attached' | 'band-top' | 'band-bottom' | undefined =
      spaceRaw === 'band-top' || spaceRaw === 'top' ? 'band-top'
      : spaceRaw === 'band-bottom' || spaceRaw === 'bottom' ? 'band-bottom'
      : spaceRaw === 'attached' ? 'attached'
      : undefined;
    const subLabel = cell(row, 'subLabel')?.trim() || undefined;
    const description = cell(row, 'description')?.trim() || undefined;
    sdsgs.push({
      id, type, label,
      attachedTo, attachedType,
      ...(attachedTo2 && resolveAttachedType(attachedTo2) ? { attachedTo2 } : {}),
      ...(anchorMode ? { anchorMode } : {}),
      ...(spaceMode ? { spaceMode } : {}),
      itemOffset: 0,
      timeOffset: 0,
      ...(subLabel ? { subLabel } : {}),
      ...(description ? { description } : {}),
    });
  });
  return { sdsgs, errors };
}

// ============================================================================
// 時期ラベル インポート
// ============================================================================

export type PeriodLabelCsvFieldKind = 'ignore' | 'id' | 'position' | 'label';

export const PERIOD_LABEL_FIELD_LABELS: Record<PeriodLabelCsvFieldKind, string> = {
  get ignore() { return i18n.t('csvImport:field.ignore'); },
  id: 'ID',
  get position() { return i18n.t('csvImport:period.position'); },
  get label() { return i18n.t('csvImport:field.label'); },
};

export function guessPeriodLabelFieldKind(header: string): PeriodLabelCsvFieldKind {
  const h = header.trim().toLowerCase();
  if (!h) return 'ignore';
  if (/^(id|識別)$/i.test(h)) return 'id'; // i18n-ok 利用者の見出しと照合
  if (/^(position|pos|time|時間|位置)$/i.test(h)) return 'position'; // i18n-ok 利用者の見出しと照合
  if (/^(label|ラベル|名前|name|時期)$/i.test(h)) return 'label'; // i18n-ok 利用者の見出しと照合
  return 'ignore';
}

export interface PeriodLabelImportOptions {
  mapping: PeriodLabelCsvFieldKind[];
  hasHeader: boolean;
  existingIds: Set<string>;
}

export interface PeriodLabelImportResult {
  periodLabels: PeriodLabel[];
  errors: string[];
}

export function buildPeriodLabelsFromRows(
  rows: string[][],
  opts: PeriodLabelImportOptions,
): PeriodLabelImportResult {
  const periodLabels: PeriodLabel[] = [];
  const errors: string[] = [];
  const mappingIndex: Partial<Record<PeriodLabelCsvFieldKind, number>> = {};
  opts.mapping.forEach((k, i) => {
    if (k !== 'ignore') mappingIndex[k] = i;
  });
  const data = opts.hasHeader ? rows.slice(1) : rows;
  const localIds = new Set<string>(opts.existingIds);
  let counter = 0;

  const uniqueId = (base: string): string => {
    if (!localIds.has(base)) { localIds.add(base); return base; }
    let n = 2;
    while (localIds.has(`${base}_${n}`)) n++;
    const id = `${base}_${n}`;
    localIds.add(id);
    return id;
  };

  const cell = (row: string[], kind: PeriodLabelCsvFieldKind): string | undefined => {
    const i = mappingIndex[kind];
    return i == null ? undefined : row[i];
  };

  data.forEach((row, idx) => {
    const rowNum = idx + 1 + (opts.hasHeader ? 1 : 0);
    const label = (cell(row, 'label') ?? '').trim();
    if (!label) {
      errors.push(i18n.t('csvImport:error.nolabel', { row: rowNum }));
      return;
    }
    const posRaw = (cell(row, 'position') ?? '').trim();
    const position = posRaw === '' ? NaN : Number(posRaw);
    if (!isFinite(position)) {
      errors.push(i18n.t('csvImport:error.period.positionnan', { row: rowNum }));
      return;
    }
    const idRaw = cell(row, 'id');
    counter++;
    const id = idRaw ? uniqueId(idRaw.trim()) : uniqueId(`PL_csv_${counter}`);
    periodLabels.push({ id, position, label });
  });
  return { periodLabels, errors };
}
