# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright"]
# ///
"""
同梱のデモ（.tem）の Box の大きさを、アプリの自動調整（既定は幅を固定して高さを文字に合わせる）が落ち着いた値に書き戻す（2026-11-10）。

  cd webApp && npx vite --port 5288 --strictPort --open false     # 別の窓で開発サーバー（--open false でブラウザを開かない）
  uv run scripts/settle-demo-sizes.py sample-tem/fictional_piano_demo.tem sample-tem/fictional_piano_demo_en.tem

なぜ: スクリプトで見積もった高さがアプリの文字の測り方と合わないと、デモを開いた直後に自動調整が Box を直し、
何も変えていないのに「未保存」になる（英語のデモで起きた）。
手順: 自分専用の Chromium（画面を出さない）で 1 本ずつ開き、落ち着くまで待って Box の x・y・幅・高さを読み、ファイルに書き戻す。
書き戻した後にもう一度開いて「未保存」にならないことを確かめ、なれば終了コード 1（fail-loud）
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = 'http://localhost:5288/'


def open_doc(p, raw: str) -> None:
    p.goto(URL + '@vite/client')
    p.evaluate("""async () => { localStorage.clear(); await new Promise(r => { const q = indexedDB.deleteDatabase('keyval-store'); q.onsuccess = q.onerror = q.onblocked = () => r(); }); }""")
    p.goto(URL)
    p.get_by_role('heading', level=3).first.wait_for(timeout=10000)
    p.evaluate("""async (raw) => {
      const { useTEMStore } = await import('/src/store/store.ts');
      useTEMStore.getState().loadDocument(JSON.parse(raw));
    }""", raw)
    p.keyboard.press('Escape')   # 起動の案内を閉じる
    p.wait_for_timeout(2000)


def main() -> int:
    files = [Path(a) for a in sys.argv[1:]]
    if not files:
        print(__doc__); return 2
    for _ in range(60):
        try:
            urllib.request.urlopen(URL, timeout=1); break
        except Exception:
            time.sleep(1)
    else:
        print('開発サーバーに届かない', file=sys.stderr); return 1
    bad = 0
    with sync_playwright() as pw:
        b = pw.chromium.launch(headless=True)
        for f in files:
            p = b.new_page(viewport={'width': 1600, 'height': 1000})
            raw = f.read_text(encoding='utf-8')
            open_doc(p, raw)
            boxes = p.evaluate("""async () => {
              const { useTEMStore } = await import('/src/store/store.ts');
              const d = useTEMStore.getState().doc;
              return d.sheets.flatMap((s) => s.boxes.map((b) => ({ sheet: s.id, id: b.id, x: b.x, y: b.y, width: b.width, height: b.height })));
            }""")
            doc = json.loads(raw)
            changed = 0
            by = {(x['sheet'], x['id']): x for x in boxes}
            for sh in doc['sheets']:
                for bx in sh['boxes']:
                    n = by.get((sh['id'], bx['id']))
                    if n and any(round(bx[k], 2) != round(n[k], 2) for k in ('x', 'y', 'width', 'height')):
                        for k in ('x', 'y', 'width', 'height'):
                            bx[k] = round(n[k], 2)
                        changed += 1
            if changed:
                f.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
            p.close()
            # 確かめ: もう一度開いて「未保存」にならないか
            p = b.new_page(viewport={'width': 1600, 'height': 1000})
            open_doc(p, f.read_text(encoding='utf-8'))
            dirty = p.evaluate("async () => (await import('/src/store/store.ts')).useTEMStore.getState().dirty")
            p.close()
            print(f'{f.name}: 書き戻した Box {changed} 個・開き直して未保存={dirty}')
            if dirty:
                bad += 1
        b.close()
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
