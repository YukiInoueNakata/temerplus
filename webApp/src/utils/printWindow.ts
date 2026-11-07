// 印刷用の窓を、クリックの直後（await の前）に開く。
// Safari は、画像を作り終えた後など、クリックから時間がたってからの window.open をポップアップとして止める
// （2026-11-07 Mac の確認で、Safari では印刷そのものができなかった）。
// 依存を持たせず、画面の側から待たずに呼べるようにしてある。中身は printDiagram（printing.ts）が書き込む。

export function openPrintWindow(): Window | null {
  const win = window.open('', '_blank', 'width=960,height=720');
  if (win) {
    win.document.open();
    win.document.write(
      '<!doctype html><meta charset="utf-8"><title>TEMer 印刷の準備中</title>'
      + '<p style="font-family:sans-serif;padding:16px">印刷の準備をしています…</p>',
    );
    win.document.close();
  }
  return win;
}
