// ============================================================================
// MAXQDA「コード付きセグメント」の取り込み
//
// MAXQDA の書き出しは 1 行 = 1 つの「コード × セグメント」。同じセグメントに複数の
// コードが付いていれば行が分かれ、コード列には常に 1 つしか入らない。そのため
//   1. 行を (文書グループ, 文書名, 開始, 終了) で集約して「セグメント」に戻す（dedupe）
//   2. セグメント → 逐語録の段落（tags に全コード）
//   3. 利用者が選んだコード → Box / SD・SG / 時期ラベル（原文参照つき）
// の 3 段で TEM 図の材料にする。
//
// ここは純関数だけ（store に触らない）。UI は ImportWizardDialog が担う。
// ============================================================================

import type { Box, BoxType, Paragraph, SDSG, SourceRef, Transcript, PeriodLabel } from '../types';
import { genParagraphId, genTranscriptId } from '../store/defaults';
import { mapBoxType, TYPE_DICT } from './csvImport';

// ----------------------------------------------------------------------------
// 列の役割
// ----------------------------------------------------------------------------

export type MaxqdaRole =
  | 'ignore'
  | 'docGroup'   // 文書グループ
  | 'docName'    // 文書名（→ 逐語録 1 本）
  | 'code'       // コード（階層は "親\子"）
  | 'start'      // 開始（段落番号 / ページ / 時刻）
  | 'end'        // 終了
  | 'segment'    // セグメント本文
  | 'weight'     // 重み
  | 'comment'    // コメント
  | 'area'       // 領域
  | 'coverage'   // 範囲（%）
  | 'codedBy'    // コード付けした人
  | 'created'    // 作成日
  | 'color';     // 色

export const MAXQDA_ROLE_LABELS: Record<MaxqdaRole, string> = {
  ignore: '（無視）',
  docGroup: '文書グループ',
  docName: '文書名（逐語録）',
  code: 'コード',
  start: '開始',
  end: '終了',
  segment: 'セグメント本文',
  weight: '重み',
  comment: 'コメント',
  area: '領域',
  coverage: '範囲 (%)',
  codedBy: 'コード付けした人',
  created: '作成日',
  color: '色',
};

/** MAXQDA の日英の標準列名からの推測 */
export function guessMaxqdaRole(header: string): MaxqdaRole {
  const h = header.trim().toLowerCase();
  if (!h) return 'ignore';
  if (/^(文書グループ|document group|dokumentgruppe)$/.test(h)) return 'docGroup';
  if (/^(文書名|document name|document|dokumentname|文書)$/.test(h)) return 'docName';
  if (/^(コード|code|kode)$/.test(h)) return 'code';
  if (/^(開始|beginning|begin|start|anfang)$/.test(h)) return 'start';
  if (/^(終了|end|ende)$/.test(h)) return 'end';
  if (/^(セグメント|segment|text|本文|preview|プレビュー)$/.test(h)) return 'segment';
  if (/^(重み|weight|weight score|gewicht)$/.test(h)) return 'weight';
  if (/^(コメント|comment|kommentar)$/.test(h)) return 'comment';
  if (/^(領域|area|fläche)$/.test(h)) return 'area';
  if (/^(範囲|範囲 ?\(%\)|coverage|coverage ?%|abdeckungsgrad)$/.test(h)) return 'coverage';
  if (/^(コード付けした人|created by|coded by|erstellt von|作成者)$/.test(h)) return 'codedBy';
  if (/^(作成日|created|erstellt|作成日時)$/.test(h)) return 'created';
  if (/^(色|color|colour|farbe)$/.test(h)) return 'color';
  return 'ignore';
}

// ----------------------------------------------------------------------------
// セグメントへの集約（dedupe）
// ----------------------------------------------------------------------------

export interface MaxqdaSegment {
  key: string;
  docGroup: string;
  docName: string;
  start: string;
  end: string;
  /** 並び順のヒント（開始が数値ならその値、そうでなければ最初に現れた行番号） */
  order: number;
  text: string;
  /** このセグメントに付いていた全コード（階層つきの完全名、重複なし、出現順） */
  codes: string[];
  /** コードごとの付随情報（重み・コメント）。必要なら Box の説明に使う */
  codeMeta: Record<string, { weight?: string; comment?: string; color?: string }>;
  rowIndexes: number[];
}

export type DedupeKeyMode = 'range' | 'text';

export interface DedupeOptions {
  mapping: MaxqdaRole[];
  hasHeader: boolean;
  /** 集約キー。'range' = (グループ, 文書, 開始, 終了) の完全一致（既定）/ 'text' = (グループ, 文書, 本文) */
  keyMode?: DedupeKeyMode;
}

export interface DedupeResult {
  segments: MaxqdaSegment[];
  /** 文書名の出現順 */
  docNames: string[];
  warnings: string[];
}

function indexOfRole(mapping: MaxqdaRole[], role: MaxqdaRole): number {
  return mapping.indexOf(role);
}

const cell = (row: string[], idx: number): string => (idx >= 0 ? (row[idx] ?? '').trim() : '');

export function dedupeSegments(rows: string[][], opts: DedupeOptions): DedupeResult {
  const m = opts.mapping;
  const iGroup = indexOfRole(m, 'docGroup');
  const iDoc = indexOfRole(m, 'docName');
  const iCode = indexOfRole(m, 'code');
  const iStart = indexOfRole(m, 'start');
  const iEnd = indexOfRole(m, 'end');
  const iSeg = indexOfRole(m, 'segment');
  const iWeight = indexOfRole(m, 'weight');
  const iComment = indexOfRole(m, 'comment');
  const iColor = indexOfRole(m, 'color');
  const keyMode: DedupeKeyMode = opts.keyMode ?? 'range';
  const warnings: string[] = [];

  if (iDoc < 0) warnings.push('「文書名」の列が未指定です。全行を 1 つの逐語録として扱います');
  if (iSeg < 0) warnings.push('「セグメント本文」の列が未指定です。段落の本文が空になります');
  if (iCode < 0) warnings.push('「コード」の列が未指定です。タグ・Box は作られません');
  if (keyMode === 'range' && (iStart < 0 || iEnd < 0)) {
    warnings.push('「開始」「終了」の列が無いため、本文の一致でセグメントを集約します');
  }

  const data = opts.hasHeader ? rows.slice(1) : rows;
  const byKey = new Map<string, MaxqdaSegment>();
  const docNames: string[] = [];

  data.forEach((row, i) => {
    const docGroup = cell(row, iGroup);
    const docName = cell(row, iDoc) || '（文書名なし）';
    const start = cell(row, iStart);
    const end = cell(row, iEnd);
    const text = cell(row, iSeg);
    const code = cell(row, iCode);
    if (!text && !code) return;   // 空行相当

    const useRange = keyMode === 'range' && iStart >= 0 && iEnd >= 0;
    const key = useRange
      ? `${docGroup}\u0000${docName}\u0000${start}\u0000${end}`
      : `${docGroup}\u0000${docName}\u0000${text}`;

    let seg = byKey.get(key);
    if (!seg) {
      const startNum = Number(start);
      seg = {
        key, docGroup, docName, start, end,
        order: Number.isFinite(startNum) && start !== '' ? startNum : i + 1_000_000,
        text, codes: [], codeMeta: {}, rowIndexes: [],
      };
      byKey.set(key, seg);
      if (!docNames.includes(docName)) docNames.push(docName);
    }
    // 同じ範囲でも本文が長い方（欠けが少ない方）を採用
    if (text.length > seg.text.length) seg.text = text;
    if (code && !seg.codes.includes(code)) seg.codes.push(code);
    if (code) {
      const meta = seg.codeMeta[code] ?? {};
      const w = cell(row, iWeight); const c = cell(row, iComment); const col = cell(row, iColor);
      if (w) meta.weight = w;
      if (c) meta.comment = c;
      if (col) meta.color = col;
      seg.codeMeta[code] = meta;
    }
    seg.rowIndexes.push(i + (opts.hasHeader ? 2 : 1));  // 1 始まりの元の行番号
  });

  const segments = Array.from(byKey.values()).sort((a, b) => {
    const d = docNames.indexOf(a.docName) - docNames.indexOf(b.docName);
    if (d !== 0) return d;
    return a.order - b.order;
  });
  return { segments, docNames, warnings };
}

// ----------------------------------------------------------------------------
// コードの集計と階層
// ----------------------------------------------------------------------------

const HIERARCHY_SEPARATORS = ['\\', '>', '/', '＞'];

/** "親\子\孫" → { parents: ['親','子'], leaf: '孫' } */
export function splitCodePath(code: string): { parents: string[]; leaf: string } {
  let parts: string[] = [code];
  for (const sep of HIERARCHY_SEPARATORS) {
    if (code.includes(sep)) { parts = code.split(sep); break; }
  }
  const trimmed = parts.map((p) => p.trim()).filter((p) => p.length > 0);
  if (trimmed.length === 0) return { parents: [], leaf: code.trim() };
  return { parents: trimmed.slice(0, -1), leaf: trimmed[trimmed.length - 1] };
}

export interface CodeSummary {
  code: string;
  leaf: string;
  parents: string[];
  count: number;           // 付いているセグメント数
  docCount: number;        // 出現する文書数
  /** 親コードや葉の語から推測した種別（例: "分岐点" → BFP）。無ければ undefined */
  suggestedType?: BoxType;
  suggestedAction: CodeAction;
}

export type CodeAction = 'tag' | 'box' | 'sd' | 'sg' | 'period';

export const CODE_ACTION_LABELS: Record<CodeAction, string> = {
  tag: 'タグのみ',
  box: 'Box にする',
  sd: 'SD にする',
  sg: 'SG にする',
  period: '時期ラベルにする',
};

/** 語から種別を推測する。TYPE_DICT（CSV 取り込みの辞書）を再利用 */
function guessTypeFromWords(words: string[]): BoxType | undefined {
  for (const w of words) {
    const lower = w.trim().toLowerCase();
    if (TYPE_DICT[lower]) return TYPE_DICT[lower];
    // 部分一致（「第1分岐点」「BFP: 進学」のような書き方）
    for (const [k, v] of Object.entries(TYPE_DICT)) {
      if (k.length >= 2 && lower.includes(k)) return v;
    }
  }
  return undefined;
}

function guessActionFromWords(words: string[]): CodeAction | undefined {
  const joined = words.join(' ').toLowerCase();
  if (/(^|[^a-z])sd([^a-z]|$)|社会的方向づけ|社会的方向付け/.test(joined)) return 'sd';
  if (/(^|[^a-z])sg([^a-z]|$)|社会的ガイド|社会的助勢/.test(joined)) return 'sg';
  if (/時期|期間|period|phase|フェーズ|第[0-9一二三四五六七八九十]+期/.test(joined)) return 'period';
  return undefined;
}

export function summarizeCodes(segments: MaxqdaSegment[]): CodeSummary[] {
  const map = new Map<string, { count: number; docs: Set<string> }>();
  segments.forEach((s) => {
    s.codes.forEach((c) => {
      const e = map.get(c) ?? { count: 0, docs: new Set<string>() };
      e.count += 1;
      e.docs.add(s.docName);
      map.set(c, e);
    });
  });
  return Array.from(map.entries()).map(([code, e]) => {
    const { parents, leaf } = splitCodePath(code);
    const words = [...parents, leaf];
    const suggestedType = guessTypeFromWords(parents.length > 0 ? parents : [leaf]) ?? guessTypeFromWords([leaf]);
    const action = guessActionFromWords(words);
    return {
      code, leaf, parents,
      count: e.count, docCount: e.docs.size,
      suggestedType,
      suggestedAction: action ?? (suggestedType ? 'box' : 'tag'),
    };
  }).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code, 'ja'));
}

// ----------------------------------------------------------------------------
// 取り込み結果の組み立て
// ----------------------------------------------------------------------------

export interface CodePlan {
  code: string;
  action: CodeAction;
  boxType?: BoxType;        // action === 'box' のとき。未指定なら normal
}

export interface BuildOptions {
  plans: CodePlan[];
  /** 文書名 → 協力者 ID。未指定なら文書名をそのまま participantId に */
  participantIdFor?: (docName: string) => string | undefined;
  levelPx: number;          // 通常 100
  defaultWidth: number;
  defaultHeight: number;
  /** 文書ごとに Item 軸を 1 段ずつ変える（既定 true） */
  stackDocuments?: boolean;
  /** 既存 ID と衝突しないように */
  existingBoxIds: Set<string>;
  existingSdsgIds: Set<string>;
}

export interface BuildResult {
  transcripts: Transcript[];
  boxes: Box[];
  sdsg: SDSG[];
  periodLabels: PeriodLabel[];
  /** Box / SD・SG → 段落 の原文参照（store の addSourceRef で登録する） */
  sourceRefs: Array<{ target: { type: 'box' | 'sdsg'; id: string }; ref: Omit<SourceRef, 'id' | 'createdAt'> }>;
  warnings: string[];
}

function nextId(prefix: string, used: Set<string>): string {
  let n = 1;
  used.forEach((id) => {
    const m = id.match(new RegExp(`^${prefix}(\\d+)$`));
    if (m) n = Math.max(n, parseInt(m[1], 10) + 1);
  });
  const id = `${prefix}${n}`;
  used.add(id);
  return id;
}

export function buildFromSegments(dedupe: DedupeResult, opts: BuildOptions): BuildResult {
  const warnings: string[] = [...dedupe.warnings];
  const planByCode = new Map(opts.plans.map((p) => [p.code, p]));
  const stack = opts.stackDocuments !== false;

  // 1. 文書ごとに逐語録（段落 = セグメント、tags = 全コード）
  const transcripts: Transcript[] = [];
  const paragraphByKey = new Map<string, { transcriptId: string; paragraph: Paragraph }>();
  dedupe.docNames.forEach((docName) => {
    // 本文の無いセグメント（時期ラベルだけのコード等）は段落にしない
    const segs = dedupe.segments.filter((s) => s.docName === docName && s.text.length > 0);
    const tId = genTranscriptId();
    const paragraphs: Paragraph[] = segs.map((s, i) => {
      const p: Paragraph = {
        id: genParagraphId(),
        index: i,
        text: s.text,
        tags: s.codes.length > 0 ? [...s.codes] : undefined,
        note: s.start || s.end ? `MAXQDA ${s.start}${s.end && s.end !== s.start ? `–${s.end}` : ''}` : undefined,
      };
      paragraphByKey.set(s.key, { transcriptId: tId, paragraph: p });
      return p;
    });
    transcripts.push({
      id: tId,
      participantId: opts.participantIdFor?.(docName) ?? docName,
      title: docName,
      source: 'xlsx',
      importedAt: new Date().toISOString(),
      paragraphs,
    });
  });

  // 2. 選ばれたコード → 図要素
  const boxes: Box[] = [];
  const sdsg: SDSG[] = [];
  const periodLabels: PeriodLabel[] = [];
  const sourceRefs: BuildResult['sourceRefs'] = [];
  const usedBox = new Set(opts.existingBoxIds);
  const usedSdsg = new Set(opts.existingSdsgIds);
  const periodSeen = new Set<string>();

  dedupe.docNames.forEach((docName, docIdx) => {
    const segs = dedupe.segments.filter((s) => s.docName === docName);
    const itemLevelY = stack ? docIdx * opts.levelPx * 1.5 : 0;
    let timeIdx = 0;
    let lastBoxIdInDoc: string | undefined;
    segs.forEach((s) => {
      // 本文の無いセグメントは段落を持たない → 原文参照は付けられない（時期ラベルだけは作れる）
      const para = paragraphByKey.get(s.key);
      const refFor = (): Omit<SourceRef, 'id' | 'createdAt'> | null => (para ? {
        transcriptId: para.transcriptId,
        paragraphId: para.paragraph.id,
        charStart: 0,
        charEnd: s.text.length,
        quoteText: s.text,
      } : null);
      let placedBoxHere = false;
      s.codes.forEach((code) => {
        const plan = planByCode.get(code);
        if (!plan || plan.action === 'tag') return;
        const { leaf } = splitCodePath(code);
        if (plan.action !== 'period' && !para) {
          warnings.push(`「${code}」（${docName}）: セグメント本文が無いため Box / SD・SG にできませんでした`);
          return;
        }
        if (plan.action === 'box') {
          const type = plan.boxType ?? 'normal';
          const prefix = type === 'normal' ? 'Item' : type === 'other' ? 'Other' : type.replace(/-/g, '_');
          const id = nextId(prefix, usedBox);
          const x = timeIdx * opts.levelPx;
          const box: Box = {
            id, type, label: leaf,
            x, y: itemLevelY,
            width: opts.defaultWidth, height: opts.defaultHeight,
            participantId: opts.participantIdFor?.(docName) ?? docName,
            description: s.codeMeta[code]?.comment || undefined,
          } as Box;
          boxes.push(box);
          sourceRefs.push({ target: { type: 'box', id }, ref: refFor()! });
          lastBoxIdInDoc = id;
          placedBoxHere = true;
        } else if (plan.action === 'sd' || plan.action === 'sg') {
          const type = plan.action === 'sd' ? 'SD' : 'SG';
          const id = nextId(type, usedSdsg);
          // 直前の Box（無ければこのセグメントの Box）に紐付ける
          const attachedTo = lastBoxIdInDoc;
          if (!attachedTo) {
            warnings.push(`「${code}」（${docName}）: 紐付ける Box がまだ無いため SD/SG を作れませんでした。先に Box になるコードを選んでください`);
            return;
          }
          const sg: SDSG = {
            id, type, label: leaf,
            attachedTo, attachedType: 'box',
            itemOffset: type === 'SD' ? -(opts.defaultHeight + 60) : opts.defaultHeight + 60,
            timeOffset: 0,
          } as SDSG;
          sdsg.push(sg);
          sourceRefs.push({ target: { type: 'sdsg', id }, ref: refFor()! });
        } else if (plan.action === 'period') {
          if (!periodSeen.has(leaf)) {
            periodSeen.add(leaf);
            periodLabels.push({ id: `P_${periodLabels.length + 1}`, position: timeIdx, label: leaf });
          }
        }
      });
      if (placedBoxHere) timeIdx += 1;
    });
  });

  return { transcripts, boxes, sdsg, periodLabels, sourceRefs, warnings };
}

// 再エクスポート（ウィザードが種別の選択肢を出すとき用）
export { mapBoxType };
