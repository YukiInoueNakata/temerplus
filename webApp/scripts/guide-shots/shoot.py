# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright"]
# ///
"""
はじめてのガイド（docs/getting-started.*.md）と README の画面の写真を撮り直す。

  cd webApp && npx vite --port 5288 --strictPort --no-open   # 別の窓で開発サーバーを起動しておく（--no-open: vite.config の open: true のままだと、起動のたびにユーザーのブラウザにタブが増える）
  uv run scripts/guide-shots/shoot.py [--lang ja|en|both] [--url http://localhost:5288/]

- 自分専用の Chromium（画面を出さない）を、何も保存していない状態から起動して、ガイドの手順どおりに操作して撮る
- 押す場所は赤い枠、画面の各部は赤い丸の番号で示す（撮る直前に重ねて描き、撮ったら消す）
- 大きさは 1600×1000。日本語は docs/images/getting-started/<名前>.png、英語は <名前>-en.png
- README の画像も撮る（docs/images/screenshot.png と screenshot-en.png。枠なし）
- 途中で画面が想定と違ったら止まる（どの手順で止まったかを出す）

2026-11-08: 画面の英語化・Box の手直し・切片化のあとに作った（以前の写真は手で撮っていた）
"""
from __future__ import annotations

import argparse
import sys
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import Page, Locator, sync_playwright

ROOT = Path(__file__).resolve().parents[3]          # リポジトリの最上位
OUT = ROOT / "docs" / "images" / "getting-started"
README_OUT = ROOT / "docs" / "images"
W, H = 1600, 1000

# 画面の文字（翻訳の表と同じもの）。ボタンは名前で探す
L = {
    "ja": {
        "demo": "デモファイルを開く", "empty": "空ファイルから作成",
        "tab_file": "ファイル", "tab_insert": "挿入", "tab_help": "ヘルプ",
        "normal": "通常", "opp": "必須通過点", "rline": "実線径路", "save": "保存",
        "export": "出力...", "include": "含める", "content_title": "出力に含める要素の確認", "report": "論文レポート",
        "report_export_tab": "出力", "generate": "レポートを生成...",
        "wizard": "起動ウィザード", "changelog": "更新情報",
        "label1": "高校に入学する", "label2": "大学に進む",
    },
    "en": {
        "demo": "Open English demo", "empty": "Start from an empty file",
        "tab_file": "File", "tab_insert": "Insert", "tab_help": "Help",
        "normal": "Normal", "opp": "Obligatory passage point", "rline": "Solid path", "save": "Save",
        "export": "Export...", "include": "Include", "content_title": "Elements to include in the output", "report": "Paper report",
        "report_export_tab": "Export", "generate": "Generate report...",
        "wizard": "Startup wizard", "changelog": "What's new",
        "label1": "Enters high school", "label2": "Goes on to university",
    },
}

OVERLAY_JS = """
(items) => {
  for (const it of items) {
    const pad = it.pad ?? 4;
    const f = document.createElement('div');
    f.className = '__guide_overlay';
    Object.assign(f.style, {
      position: 'fixed', left: (it.x - pad) + 'px', top: (it.y - pad) + 'px',
      width: (it.w + pad * 2) + 'px', height: (it.h + pad * 2) + 'px',
      border: '3px solid #e02020', borderRadius: '4px', boxSizing: 'border-box',
      pointerEvents: 'none', zIndex: 2147483647,
    });
    document.body.appendChild(f);
    if (it.n != null) {
      const c = document.createElement('div');
      c.className = '__guide_overlay';
      c.textContent = String(it.n);
      const size = 28;
      Object.assign(c.style, {
        position: 'fixed', left: Math.min(window.innerWidth - size - 2, it.x + it.w + pad - size / 2) + 'px',
        top: Math.max(2, it.y - pad - size / 2) + 'px', width: size + 'px', height: size + 'px',
        borderRadius: '50%', background: '#e02020', color: '#fff', font: 'bold 16px sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2147483647,
      });
      document.body.appendChild(c);
    }
  }
}
"""


class Shooter:
    def __init__(self, page: Page, lang: str):
        self.p = page
        self.lang = lang
        self.t = L[lang]

    def box(self, target: Locator | str) -> dict:
        loc = self.p.locator(target) if isinstance(target, str) else target
        loc.first.wait_for(state="visible", timeout=8000)
        bb = loc.first.bounding_box()
        if not bb:
            raise RuntimeError(f"位置が取れない: {target}")
        return {"x": bb["x"], "y": bb["y"], "w": bb["width"], "h": bb["height"]}

    def shot(self, name: str, frames: list[dict] | None = None) -> None:
        self.p.wait_for_timeout(350)
        if frames:
            self.p.evaluate(OVERLAY_JS, frames)
        suffix = "" if self.lang == "ja" else "-en"
        path = OUT / f"{name}{suffix}.png"
        self.p.screenshot(path=str(path))
        self.p.evaluate("() => document.querySelectorAll('.__guide_overlay').forEach(e => e.remove())")
        print(f"  撮った: {path.relative_to(ROOT)}")

    def btn(self, name: str) -> Locator:
        """名前が name で終わるボタン（アイコンの文字が前に付く）"""
        import re
        return self.p.get_by_role("button", name=re.compile(re.escape(name) + r"$")).first


def run(lang: str, url: str) -> None:
    t = L[lang]
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(locale="ja-JP" if lang == "ja" else "en-US", viewport={"width": W, "height": H})
        p = ctx.new_page()
        p.on("dialog", lambda d: d.accept() if d.type == "beforeunload" else d.dismiss())
        s = Shooter(p, lang)

        def fresh() -> None:
            p.goto(url + "@vite/client")
            p.evaluate(f"""async () => {{ localStorage.clear(); localStorage.setItem('temer.uiLanguage', '{lang}');
              await new Promise(r => {{ const q = indexedDB.deleteDatabase('keyval-store'); q.onsuccess = q.onerror = q.onblocked = () => r(); }}); }}""")
            p.goto(url)
            p.get_by_role("heading", level=3).first.wait_for(timeout=10000)

        step = "準備"
        try:
            # --- 2. デモの図を見る ---
            step = "01 案内でデモを開く"
            fresh()
            card = p.get_by_text(t["demo"], exact=True).first
            s.shot("app-01-wizard-demo", [s.box(card.locator("xpath=ancestor::*[contains(@style,'cursor')][1]"))])
            card.click(); p.wait_for_timeout(1500)
            step = "02 画面の各部"
            p.locator("button[title]").filter(has_text="⛶").first.click() if False else None
            frames = [{**s.box(".ribbon"), "n": 1, "pad": 0}, {**s.box(".canvas-main"), "n": 2, "pad": -2},
                      {**s.box(".property-panel"), "n": 3, "pad": -2}, {**s.box(".panel-collapsed.left"), "n": 4, "pad": 0},
                      {**s.box(".sheet-tabs"), "n": 5, "pad": 0}]
            # README の画像（枠なし）
            p.wait_for_timeout(300)
            readme = README_OUT / ("screenshot.png" if lang == "ja" else "screenshot-en.png")
            p.screenshot(path=str(readme)); print(f"  撮った: {readme.relative_to(ROOT)}")
            s.shot("app-02-overview", frames)

            # --- 3. 新しい図を描く ---
            step = "10 空ファイルから作成"
            fresh()
            card = p.get_by_text(t["empty"], exact=True).first
            s.shot("app-10-wizard-empty", [s.box(card.locator("xpath=ancestor::*[contains(@style,'cursor')][1]"))])
            card.click(); p.wait_for_timeout(600)
            step = "11 挿入タブの通常"
            p.get_by_role("button", name=t["tab_insert"], exact=True).click()
            s.shot("app-11-insert-normal", [s.box(s.btn(t["normal"]))])
            step = "12 Box が増えた"
            s.btn(t["normal"]).click(); p.wait_for_timeout(500)
            box1 = p.locator(".react-flow__node-box").last
            id1 = box1.get_attribute("data-id")
            s.shot("app-12-box-added", [s.box(box1)])
            step = "13 文字を書き換える"
            s.shot("app-13-edit-label", [s.box(box1)])
            p.keyboard.press("Enter"); p.wait_for_timeout(300)
            p.keyboard.press("Control+a"); p.keyboard.type(t["label1"]); p.wait_for_timeout(200)
            step = "14 書き込んだ"
            p.locator(".react-flow__pane").click(position={"x": 60, "y": 60}); p.wait_for_timeout(400)
            box1 = p.locator(f'.react-flow__node[data-id="{id1}"]')
            s.shot("app-14-typed", [s.box(box1)])
            step = "15 必須通過点を足す"
            box1.click(); p.wait_for_timeout(200)
            s.shot("app-15-insert-opp", [s.box(s.btn(t["opp"]))])
            s.btn(t["opp"]).click(); p.wait_for_timeout(500)
            box2 = p.locator(".react-flow__node-box").last
            id2 = box2.get_attribute("data-id")
            p.keyboard.press("Enter"); p.wait_for_timeout(300)
            p.keyboard.press("Control+a"); p.keyboard.type(t["label2"])
            p.locator(".react-flow__pane").click(position={"x": 60, "y": 60}); p.wait_for_timeout(400)
            step = "16 2 つの Box を選ぶ"
            p.locator(f'.react-flow__node[data-id="{id1}"]').click()
            p.keyboard.down("Shift"); p.locator(f'.react-flow__node[data-id="{id2}"]').click(); p.keyboard.up("Shift")
            p.wait_for_timeout(500)
            s.shot("app-16-select-two", [s.box(f'.react-flow__node[data-id="{id1}"]'), s.box(f'.react-flow__node[data-id="{id2}"]')])
            step = "17 実線径路"
            s.shot("app-17-arrow-button", [s.box(s.btn(t["rline"]))])
            step = "18 矢印でつながった"
            s.btn(t["rline"]).click(); p.wait_for_timeout(500)
            p.locator(".react-flow__pane").click(position={"x": 60, "y": 60}); p.wait_for_timeout(300)
            # 矢印は短いと位置が取りにくいので、2 つの Box と矢印をまとめて囲む
            b1 = s.box(f'.react-flow__node[data-id="{id1}"]'); b2 = s.box(f'.react-flow__node[data-id="{id2}"]')
            x0, y0 = min(b1["x"], b2["x"]), min(b1["y"], b2["y"])
            x1, y1 = max(b1["x"] + b1["w"], b2["x"] + b2["w"]), max(b1["y"] + b1["h"], b2["y"] + b2["h"])
            s.shot("app-18-arrow-added", [{"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0, "pad": 8}])

            # --- 4. 保存する ---
            step = "20 保存"
            s.shot("app-20-save", [s.box(p.locator(".ribbon-btn-primary").first)])

            # --- 5. 画像や PowerPoint にする（デモの図で） ---
            step = "30 出力"
            fresh()
            p.get_by_text(t["demo"], exact=True).first.click(); p.wait_for_timeout(1500)
            p.get_by_role("button", name=t["tab_file"], exact=True).click()
            s.shot("app-30-file-export", [s.box(s.btn(t["export"]))])
            step = "31 出力の画面"
            s.btn(t["export"]).click(); p.wait_for_timeout(2500)
            modal = p.locator(".modal").last
            method = modal.locator("select").first
            # 「出力に含める要素の確認」の欄の全体（見出しとすべての選択を含むいちばん内側の枠）
            content = modal.locator("div").filter(has_text=t["content_title"]).filter(has=p.locator("input[type=radio]")).last
            s.shot("app-31-export-dialog", [{**s.box(method), "n": 1}, {**s.box(content), "n": 2}])
            step = "32 保存のボタン"
            radios = modal.get_by_label(t["include"], exact=True)
            for i in range(radios.count()):
                radios.nth(i).check()
            p.wait_for_timeout(300)
            save = modal.get_by_role("button", name=__import__("re").compile("PNG")).last
            s.shot("app-32-export-save", [s.box(save)])
            p.keyboard.press("Escape"); p.wait_for_timeout(300)
            if p.locator(".modal").count():
                p.locator(".modal .modal-close").last.click(); p.wait_for_timeout(300)

            # --- 6. 論文用のレポート ---
            step = "40 論文レポート"
            p.get_by_role("button", name=t["tab_file"], exact=True).click()
            s.shot("app-40-report-button", [s.box(s.btn(t["report"]))])
            step = "41 論文用レポートの画面"
            s.btn(t["report"]).click(); p.wait_for_timeout(1200)
            modal = p.locator(".modal").last
            tab = modal.get_by_role("button", name=t["report_export_tab"], exact=True).first
            if not tab.count():
                tab = modal.get_by_text(t["report_export_tab"], exact=True).first
            s.shot("app-41-report-dialog", [s.box(tab)])
            step = "42 レポートを生成"
            tab.click(); p.wait_for_timeout(500)
            s.shot("app-42-report-generate", [s.box(modal.get_by_role("button", name=t["generate"]).first)])
            p.locator(".modal .modal-close").last.click(); p.wait_for_timeout(300)

            # --- 7. 困ったとき ---
            step = "50 ヘルプ"
            p.get_by_role("button", name=__import__("re").compile("^" + t["tab_help"])).first.click(); p.wait_for_timeout(300)
            s.shot("app-50-help", [{**s.box(s.btn(t["wizard"])), "n": 1},
                                   {**s.box(p.get_by_role("button", name=__import__("re").compile(t["changelog"])).first), "n": 2}])
        except Exception as e:  # 止まった手順を出す（fail-loud）
            p.screenshot(path=str(OUT / f"_failed-{lang}.png"))
            print(f"失敗（{lang}）: 手順「{step}」: {e}", file=sys.stderr)
            browser.close()
            sys.exit(1)
        browser.close()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["ja", "en", "both"], default="both")
    ap.add_argument("--url", default="http://localhost:5288/")
    a = ap.parse_args()
    for _ in range(60):
        try:
            urllib.request.urlopen(a.url, timeout=1); break
        except Exception:
            time.sleep(1)
    else:
        print(f"開発サーバーに届かない: {a.url}", file=sys.stderr); sys.exit(1)
    for lang in (["ja", "en"] if a.lang == "both" else [a.lang]):
        print(f"[{lang}]")
        run(lang, a.url)


if __name__ == "__main__":
    main()
