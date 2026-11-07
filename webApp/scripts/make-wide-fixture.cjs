// 神崎・鈴木 (2021) 詳細版のシートを横に N 個つないだ、極端に横長のテスト用 .tem を作る（2026-11-07）
// 使い方: node make_wide.cjs <元の.tem> <出力.tem> [N=4]
const fs = require('fs');
const [src, out, nArg] = process.argv.slice(2);
const N = Number(nArg || 4);
const d = JSON.parse(fs.readFileSync(src, 'utf8'));
const base = d.sheets.find((s) => s.boxes.length > 10);
const maxX = Math.max(...base.boxes.map((b) => b.x + b.width));
const minX = Math.min(...base.boxes.map((b) => b.x));
const step = Math.ceil((maxX - minX + 200) / 100) * 100; // Level 単位でずらす
const sheet = { ...base, id: 'WIDE', name: `横長テスト（詳細版 × ${N}）`, boxes: [], lines: [], sdsg: [], notes: [], comments: [], periodLabels: [] };
for (let k = 0; k < N; k++) {
  const sfx = `_${k + 1}`;
  const dx = k * step;
  base.boxes.forEach((b) => sheet.boxes.push({ ...b, id: b.id + sfx, x: b.x + dx, sourceRefs: undefined }));
  base.lines.forEach((l) => sheet.lines.push({ ...l, id: l.id + sfx, from: l.from + sfx, to: l.to + sfx, controlPoints: undefined }));
  base.sdsg.forEach((s) => sheet.sdsg.push({ ...s, id: s.id + sfx, attachedTo: s.attachedTo + sfx }));
  base.periodLabels.forEach((p) => sheet.periodLabels.push({ ...p, id: p.id + sfx, position: p.position + dx / 100, label: `${k + 1} 巡目 ${p.label}` }));
  // つなぎ: 前の巡の最後の EFP から次の巡の最初の Box へ点線
  if (k > 0) sheet.lines.push({ id: `LINK${sfx}`, type: 'XLine', from: `EFP2_A_${k}`, to: `A_1_1${sfx}`, connectionMode: 'center-to-center', shape: 'straight' });
}
const outDoc = { ...d, sheets: [sheet], activeSheetId: 'WIDE', metadata: { ...d.metadata, title: `横長テスト（神崎・鈴木 2021 × ${N}）` } };
fs.writeFileSync(out, JSON.stringify(outDoc, null, 2));
console.log('boxes', sheet.boxes.length, 'lines', sheet.lines.length, 'width', maxX - minX + (N - 1) * step);
