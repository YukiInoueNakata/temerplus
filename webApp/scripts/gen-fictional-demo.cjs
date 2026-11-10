// 架空の例「社会人がピアノを再開する」のデモの図（.tem）を日英で作る（2026-11-10）
//   node scripts/gen-fictional-demo.cjs   （webApp で）→ sample-tem/fictional_piano_demo.tem・fictional_piano_demo_en.tem
//   作り直したら、続けて uv run scripts/settle-demo-sizes.py sample-tem/fictional_piano_demo*.tem で Box の大きさを
//   アプリの自動調整に合わせる（合わないと、開いた直後に自動調整が直して「未保存」になる。2026-11-10 英語のデモで起きた）
// - 人物・出来事はすべて作り話で、実在の事例や他の論文の図に基づかない（以前のデモは神崎・鈴木 2021 の図の再現で、
//   論文の図に他の論文の図を載せることになるため替えた。2026-11-10 ユーザー「架空の例をデモにしよう」）
// - EFP・P-EFP・BFP・OPP・潜在経験・SD・SG・時期ラベル・実線と点線の径路がひととおり出る
// - 点線の径路でしかつながらない Box は潜在経験（2026-11-10 ユーザー指摘）。最初の Box は通常（「いきなり OPP」はおかしい）
// - 凡例は自動の置き方（時間の矢印の右下・右端をそろえる）。日本語は縦書きの Box、英語は横書きの横長の Box
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'sample-tem');

// [id, 種別, 日本語, 英語, Time_Level, Item_Level]
const B = [
  ['Item0', 'normal', '子どもの頃にピアノを習う', 'Takes piano lessons as a child', 1, 0],
  ['Item1', 'normal', '受験を機にレッスンをやめる', 'Stops lessons for entrance exams', 2, 0],
  ['OPP1', 'OPP', '就職して一人暮らしを始める', 'Starts work and lives alone', 3, 0],
  ['BFP1', 'BFP', '同僚の演奏会を聴きに行く', "Goes to a colleague's concert", 4, 0],
  ['Item2', 'normal', '電子ピアノを買う', 'Buys a digital piano', 5, 1],
  ['Latent1', 'annotation', '忙しさを理由に見送る', 'Puts it off, citing a busy schedule', 5, -1.2],
  ['Item4', 'normal', '大人向けの教室に通い始める', 'Starts an adult piano class', 6, 1],
  ['BFP2', 'BFP', '教室の発表会に誘われる', 'Invited to the class recital', 7, 1],
  ['Item5', 'normal', '発表会に出ると決める', 'Decides to play in the recital', 8, 2],
  ['Latent2', 'annotation', '聴く側にとどまる', 'Stays in the audience', 8, 0],
  ['EFP1', 'EFP', '自分のペースでピアノを続ける', 'Keeps playing the piano at own pace', 9.2, 2],
  ['P_EFP1', 'P-EFP', 'ピアノから離れる', 'Gives up the piano', 9.2, -1.2],
];

// [from, to, 実線(R)か点線(X)か]
const L = [
  ['Item0', 'Item1', 'R'], ['Item1', 'OPP1', 'R'], ['OPP1', 'BFP1', 'R'],
  ['BFP1', 'Item2', 'R'], ['BFP1', 'Latent1', 'X'],
  ['Item2', 'Item4', 'R'], ['Latent1', 'P_EFP1', 'X'],
  ['Item4', 'BFP2', 'R'], ['BFP2', 'Item5', 'R'], ['BFP2', 'Latent2', 'X'],
  ['Item5', 'EFP1', 'R'], ['Latent2', 'P_EFP1', 'X'],
];

// SD は上から（itemOffset が負）、SG は下から
const SDSG = [
  ['SD1', 'SD', '残業の多い職場', 'Long overtime at work', 'BFP1'],
  ['SD2', 'SD', '人前で弾く不安', 'Nervous about playing in public', 'BFP2'],
  ['SG1', 'SG', '同僚のすすめ', "Colleague's encouragement", 'BFP1'],
  ['SG2', 'SG', '講師の励まし', "Teacher's support", 'BFP2'],
];

const PERIODS = [
  [1, '第1期: 中断', 'Period 1: Interruption'],
  [3.5, '第2期: 再開の模索', 'Period 2: Seeking to resume'],
  [6.5, '第3期: 続ける', 'Period 3: Continuing'],
];

function build(lang) {
  const ja = lang === 'ja';
  const T = ja ? 92 : 150;     // Time_Level 1 つ分（px）
  const I = 110;               // Item_Level 1 つ分（px。上が正）
  const boxes = B.map(([id, type, lj, le, t, i]) => {
    const label = ja ? lj : le;
    // 日本語: 縦書き・幅 60、高さは字数に合わせて 1 列に収める。英語: 横書き・幅 120、高さは行数に合わせる
    const w = ja ? 60 : 120;
    const h = ja ? Math.max(100, label.length * 14 + 36) : Math.max(56, Math.ceil(label.length / 16) * 17 + 22);
    return {
      id, type, label,
      x: Math.round(t * T - w / 2 + 30), y: Math.round(-i * I - h / 2),
      width: w, height: h, textOrientation: ja ? 'vertical' : 'horizontal',
    };
  });
  const lines = L.map(([from, to, k]) => ({
    id: `${k}L_${from}_${to}`, type: k === 'R' ? 'RLine' : 'XLine', from, to,
    connectionMode: 'center-to-center', shape: 'straight',
  }));
  const tallest = (id) => boxes.find((b) => b.id === id).height / 2;
  const sdsg = SDSG.map(([id, type, lj, le, at]) => ({
    id, type, label: ja ? lj : le, attachedTo: at, attachedType: 'box',
    itemOffset: (type === 'SD' ? -1 : 1) * (tallest(at) + 70), timeOffset: 0,
    width: ja ? 100 : 130, height: 50,
  }));
  const periodLabels = PERIODS.map(([position, lj, le], k) => ({ id: `P_${k + 1}`, position, label: ja ? lj : le }));
  const now = '2026-11-10T00:00:00.000Z';
  return {
    version: '0.3',
    sheets: [{
      id: 'Sheet1', name: ja ? '協力者A（架空）' : 'Participant A (fictional)', type: 'individual', order: 0,
      boxes, lines, sdsg, notes: [], comments: [], periodLabels,
    }],
    activeSheetId: 'Sheet1',
    participants: [{ id: 'Part_A', pseudonym: ja ? '協力者A（架空）' : 'Participant A (fictional)' }],
    // 書いていない設定は読み込み時にアプリの既定値で補う。図の言語・時間の矢印の文字・凡例の題・凡例の置き方だけ書く
    settings: {
      layout: 'horizontal',
      locale: lang,
      timeArrow: { label: ja ? '非可逆的時間' : 'Irreversible Time' },
      legend: { title: ja ? '凡例' : 'Legend', placement: 'auto', position: { x: 0, y: 400 } },
    },
    metadata: {
      title: ja ? '架空の例: ピアノの再開' : 'Fictional example: Returning to the piano',
      author: '', createdAt: now, modifiedAt: now,
    },
    history: [],
  };
}

for (const lang of ['ja', 'en']) {
  const out = path.join(OUT_DIR, lang === 'ja' ? 'fictional_piano_demo.tem' : 'fictional_piano_demo_en.tem');
  fs.writeFileSync(out, JSON.stringify(build(lang), null, 2) + '\n');
  console.log('書いた: ' + out);
}
