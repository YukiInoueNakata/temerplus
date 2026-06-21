// ============================================================================
// gen-transcript-demo.mjs - Phase 4「インタビューデータ連動」のデモ用 .tem 生成
//   node webApp/scripts/gen-transcript-demo.mjs
//   生成先: webApp/sample-tem/transcript_demo.tem  (version 0.4)
//
// 内容: 転職をめぐるキャリア選択の小さな TEM 図（5 Box / 4 Line / 1 期）と、
//       協力者 A のインタビュー逐語録（1 Transcript / 7 段落）を含む。
//       各 Box は逐語録の特定の引用範囲（charStart..charEnd）に sourceRefs で
//       リンクしている。char オフセットは引用文字列を本文から indexOf して算出
//       するため、常に quoteText === text.slice(charStart, charEnd) が成立する。
// ============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTDIR = resolve(__dirname, '../sample-tem');
mkdirSync(OUTDIR, { recursive: true });

// 生成を決定的にするための固定タイムスタンプ（new Date() は使わない）
const STAMP = '2026-06-22T00:00:00.000Z';

// 設定は最小サブセット。読込時に hydrateDocument が DEFAULT_SETTINGS で補完する。
const DEFAULT_SETTINGS = {
  layout: 'horizontal',
  levelStep: 50,
  paperSize: 'A4-landscape',
  ui: { fontSize: 11 },
  locale: 'ja',
  showFrame: false,
  showRulers: false,
};

const PARTICIPANT_ID = 'P_A';
const TRANSCRIPT_ID = 'T_A_1';

// --- 逐語録の段落（本文） ---------------------------------------------------
const RAW_PARAGRAPHS = [
  { speaker: 'Int', text: '今日はお時間ありがとうございます。まず、転職を考え始めたきっかけから教えていただけますか。' },
  { speaker: 'A',   text: 'そうですね、入社三年目くらいから、今の仕事に少しずつ違和感を覚えるようになって。毎日同じ作業の繰り返しで、自分が成長している実感が持てなかったんです。' },
  { speaker: 'A',   text: 'それでも辞めるのは怖くて、本当に転職すべきか、ずっと迷っていました。給料は安定していましたし、同僚にも恵まれていたので。' },
  { speaker: 'Int', text: '迷っている中で、何か転機はありましたか。' },
  { speaker: 'A',   text: 'はい、思い切って直属の上司に相談したんです。そこで初めて自分の本音を言葉にできて、上司も親身に聞いてくれました。あの相談がなければ、今でも決められなかったと思います。' },
  { speaker: 'A',   text: '最終的には、新しい分野に挑戦したいという気持ちが勝って、転職を決意しました。今は本当にやってよかったと感じています。' },
  { speaker: 'A',   text: 'もちろん、現職にとどまるという選択肢も最後まで考えていました。安定を捨てる不安は大きかったので。' },
];

const paragraphs = RAW_PARAGRAPHS.map((p, i) => ({
  id: `para_${i + 1}`,
  index: i,
  speaker: p.speaker,
  text: p.text,
}));

// paragraphId と引用文字列から SourceRef を生成（オフセットは indexOf で算出）
let refSeq = 0;
function makeRef(paragraphId, quote) {
  const para = paragraphs.find((p) => p.id === paragraphId);
  if (!para) throw new Error(`paragraph not found: ${paragraphId}`);
  const charStart = para.text.indexOf(quote);
  if (charStart < 0) throw new Error(`quote not found in ${paragraphId}: ${quote}`);
  refSeq += 1;
  return {
    id: `ref_${refSeq}`,
    transcriptId: TRANSCRIPT_ID,
    paragraphId,
    charStart,
    charEnd: charStart + quote.length,
    quoteText: quote,
    createdAt: STAMP,
  };
}

// --- Box（キャリア選択の径路） ----------------------------------------------
const boxes = [
  {
    id: 'B_start', type: 'normal', label: '現職への違和感', x: 100, y: 220, width: 110, height: 60,
    description: '入社三年目頃から感じ始めた、現職への違和感・成長実感の欠如。',
    sourceRefs: [makeRef('para_2', '今の仕事に少しずつ違和感を覚えるように')],
  },
  {
    id: 'B_bfp', type: 'BFP', label: '転職するか迷う', x: 320, y: 220, width: 110, height: 60,
    description: '転職すべきか否かを迷う分岐点。安定 vs 挑戦の葛藤。',
    sourceRefs: [makeRef('para_3', '本当に転職すべきか、ずっと迷っていました')],
  },
  {
    id: 'B_opp', type: 'OPP', label: '上司への相談', x: 540, y: 220, width: 110, height: 60,
    description: '決断に至る必須通過点。直属の上司への相談で本音を言語化。',
    sourceRefs: [makeRef('para_5', '思い切って直属の上司に相談した')],
  },
  {
    id: 'B_efp', type: 'EFP', label: '転職を決意', x: 770, y: 220, width: 110, height: 70,
    description: '新分野への挑戦を選び、転職を決意した等至点。',
    sourceRefs: [makeRef('para_6', '転職を決意しました')],
  },
  {
    id: 'B_pefp', type: 'P-EFP', label: '現職にとどまる', x: 540, y: 380, width: 110, height: 70,
    description: '両極化等至点。最後まで検討された「現職にとどまる」選択肢。',
    sourceRefs: [makeRef('para_7', '現職にとどまるという選択肢も最後まで考えていました')],
  },
];

const lines = [
  { id: 'L1', type: 'RLine', from: 'B_start', to: 'B_bfp', connectionMode: 'center-to-center', shape: 'straight' },
  { id: 'L2', type: 'RLine', from: 'B_bfp', to: 'B_opp', connectionMode: 'center-to-center', shape: 'straight' },
  { id: 'L3', type: 'RLine', from: 'B_opp', to: 'B_efp', connectionMode: 'center-to-center', shape: 'straight' },
  { id: 'L4', type: 'XLine', from: 'B_bfp', to: 'B_pefp', connectionMode: 'center-to-center', shape: 'straight' },
];

const sheet = {
  id: 'sheet_demo_transcript',
  name: '協力者A 転職の径路',
  type: 'individual',
  order: 0,
  boxes,
  lines,
  sdsg: [],
  notes: [],
  comments: [],
  periodLabels: [],
};

const transcript = {
  id: TRANSCRIPT_ID,
  participantId: PARTICIPANT_ID,
  sessionNumber: 1,
  title: '協力者A 第1回インタビュー',
  source: 'manual',
  importedAt: STAMP,
  paragraphs,
  metadata: { speakerOfInterest: 'A', interviewerName: 'Int' },
};

const doc = {
  version: '0.4',
  sheets: [sheet],
  activeSheetId: sheet.id,
  participants: [{ id: PARTICIPANT_ID, pseudonym: 'A' }],
  settings: DEFAULT_SETTINGS,
  metadata: {
    title: '原文連動デモ（協力者A 転職の径路）',
    author: 'TEMer サンプル',
    createdAt: STAMP,
    modifiedAt: STAMP,
    description: 'Phase 4 インタビューデータ連動のデモ。Box をクリックして「原文参照」から逐語録の該当箇所へジャンプできる。',
  },
  history: [],
  transcripts: [transcript],
};

const out = resolve(OUTDIR, 'transcript_demo.tem');
writeFileSync(out, JSON.stringify(doc, null, 2));
console.log(`Generated ${out.replace(/\\/g, '/')}`);
console.log(`  ${boxes.length} boxes / ${lines.length} lines / 1 transcript / ${paragraphs.length} paragraphs / ${refSeq} sourceRefs`);
