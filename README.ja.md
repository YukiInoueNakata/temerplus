# TEMer Plus

[![Deploy](https://github.com/YukiInoueNakata/temerplus/actions/workflows/deploy.yml/badge.svg)](https://github.com/YukiInoueNakata/temerplus/actions/workflows/deploy.yml)
[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/License-PolyForm_Noncommercial_1.0.0-blue.svg)](./LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24051875.svg)](https://doi.org/10.5281/zenodo.24051875)

[English](README.md) | 日本語

TEA（複線径路等至性アプローチ）で用いる、**複線径路等至性モデリング（TEM）の図を描くためのツール**です。
ブラウザで動くので、**インストールもアカウントの登録もいりません**。

**TEMer Plus を開く: https://yukiinouenakata.github.io/temerplus/**

経験の Box と、TEM に固有の点（分岐点・必須通過点・等至点・両極化した等至点など）を置き、
実現した径路・実現しなかった径路でつなぎ、非可逆的時間に沿って社会的方向づけ（SD）・
社会的助勢（SG）を加えて、**PNG / SVG / PDF / PPTX** や **論文用のレポート（Word）** に
出力できます。図のデータは手元のブラウザの中だけで処理され、サーバーへは送られません。

構成: **React + TypeScript + Vite + React Flow**（GitHub Pages で公開している静的な Web アプリ）

![TEMer Plus の画面: 上にリボン、中央に TEM の図、右にプロパティ。](docs/images/screenshot.png)

## なぜ作ったか

TEM の図には独自の決まりがあります。Box の種類を枠の線で示し、実現した径路と実現しなかった径路を
描き分け、社会的方向づけ・社会的助勢・時期区分を置き、非可逆的時間を一方向に流します。
これまでは PowerPoint や Illustrator で手で描くことが多く、表記をそろえること、分析が進むたびに
Box を並べ替えること、論文で表記の決まりを報告することに手間がかかっていました。
TEMer Plus は、これらの要素を構造を持ったデータ（種類、時間軸・項目軸の上の位置、Box どうしの
つながり）として扱います。そのため表記がそろい、配置を組み替えやすく、同じデータから図と
論文の方法の節の材料を作れます。同じ作者による Excel VBA 版の TEMer の後継で、TEM を使う
研究者への調査をもとに機能を決めました。TEA・TEM を使う研究者や学生（TEM の図を初めて描く人を
含む）を想定しています。

## 機能

- **TEM の要素** — Box の種類（通常の経験・潜在経験・分岐点・等至点・両極化した等至点・必須通過点・
  セカンド等至点・その他）、実線と点線の径路、SD・SG（Box や矢印に付ける・Box の間・帯に置く）、
  時期ラベル、非可逆的時間の矢印、自動で作る凡例。横型と縦型。1 つのファイルに複数の図（シート）。
- **編集** — 表の形で編集するデータシート、整列・間隔の道具、元に戻す・やり直し、図の上のメモと記号、
  Box スタイルのテーマ（線種を実在性だけに使う簡素化方式を含む）。
- **取り込み** — CSV・Excel（MAXQDA のコード付きセグメントを含む）、PowerPoint（.pptx）で描いた TEM 図、
  Box と結びつけられるインタビューの逐語録。
- **出力** — PNG・SVG・PDF・PPTX・印刷（画像は約 300dpi）。含める要素の確認、用紙への収め方、
  Box の間で区切る複数ページの出力。記号体系の宣言・表記方針・図・各要素の説明をまとめた
  論文用のレポート（Word）。CSV の書き出し。
- **ファイル** — 図は `.tem`（JSON）のファイルに保存。保存していない変更はブラウザの中に自動で残ります。
- **画面の言語** — 日本語と英語をいつでも切り替えられます。図の中の文字（凡例・レポート）の言語は、図ごとに別に決めます。

すべての機能の一覧は [docs/features.ja.md](docs/features.ja.md) にあります（English: [docs/features.en.md](docs/features.en.md)）。

## はじめ方

https://yukiinouenakata.github.io/temerplus/ を **Chrome**（おすすめ）・Edge・Safari で開きます。
開くところから、図と論文用のレポートを出力するまでの手順を、画面の写真つきで
[docs/getting-started.ja.md](docs/getting-started.ja.md) にまとめています
（English: [docs/getting-started.en.md](docs/getting-started.en.md)）。

| ブラウザ | 保存のしかた |
|---|---|
| Chrome・Edge | 保存する場所を 1 回選ぶと、2 回目からは同じファイルに上書き |
| Safari・Firefox | 保存のたびに `.tem` ファイルをダウンロード |

動作を確かめた環境: Windows（Chrome・Edge）、macOS 26・Apple Silicon（Safari・Chrome）、
macOS 12・Intel（Safari・Chrome）。

講習会の資料（TEA 2026、スライドと練習用のファイル）: https://yukiinouenakata.github.io/tea2026/

## ソースから動かす

Node.js 20 以上が必要です。

```bash
cd webApp
npm ci
npm run dev        # 開発用のサーバー（http://localhost:5173/）
npm test           # 単体テスト（Vitest）
npm run build      # webApp/dist/ に静的なファイルを書き出す
```

## 注意と制約

- 画面は日本語と英語を切り替えられます（右上の「日本語 / English」）。
- PPTX の出力は、位置・文字・図形をおおよそ再現します。文字の折り返しは PowerPoint が決めます。
  見た目をそろえたいときは PNG・SVG・PDF を使ってください。
- Safari で印刷するときは、印刷の画面で用紙の向きを自分で選んでください。
- 複数ページの出力では、凡例を各ページの同じ位置に置くので、図によっては Box と重なることがあります。

## 問い合わせ

- **Issues** — 不具合や要望は [GitHub Issues](https://github.com/YukiInoueNakata/temerplus/issues) へ。
  使っているパソコン（Windows・Mac と版）とブラウザ、起きたことを書いてください。
- **更新情報** — アプリの「ヘルプ」タブの「更新情報」、[個人サイトのページ](https://yukiinouenakata.github.io/programs/temer-plus/)、
  この README の下の「最近の更新」で見られます。

## ライセンスと作者

作者: 中田友貴（Yuki Inoue Nakata、[ORCID 0009-0000-4934-323X](https://orcid.org/0009-0000-4934-323X)）、
立命館大学 総合心理学部 — 設計・実装・文書

このリポジトリは **PolyForm Noncommercial License 1.0.0** で公開しています（全文は [`LICENSE`](./LICENSE)）。

- **非商用の利用は無償** — 研究・教育・個人での利用
- **商用の利用には別のライセンスが必要** — [`COMMERCIAL.md`](./COMMERCIAL.md) を見てください

## TEM を学ぶための文献

これから TEM 図を描く人のための基本の文献です。
書誌は CiNii・J-STAGE・Crossref・出版社のページで確かめました（2026 年 11 月）。

### 日本語

- サトウタツヤ・安田裕子・木戸彩恵・高田沙織・ヴァルシナー, J.（2006）．複線径路・等至性モデル：人生径路の多様性を描く質的心理学の新しい方法論を目指して　質的心理学研究，5，255–275．https://doi.org/10.24525/jaqp.5.1_255 （無料で読める） <br>
  TEM を提唱した原典です。等至点・両極化した等至点・分岐点・必須通過点・非可逆的時間を定義しています。図の各要素の意味を確かめる出発点です。
- 荒川歩・安田裕子・サトウタツヤ（2012）．複線径路・等至性モデルのTEM図の描き方の一例　立命館人間科学研究，25，95–107．https://doi.org/10.34382/00004276 （無料で読める） <br>
  TEM 図を描く手順を、具体例で一歩ずつ示しています。作図の実務にいちばん直結する資料です。
- 宮下太陽・上川多恵子・サトウタツヤ（2022）．TEM（複線径路等至性モデリング）の新たな理論的展開：記号圏とイマジネーション理論を踏まえて　立命館人間科学研究，44，49–64．https://doi.org/10.34382/00016829 （無料で読める） <br>
  「複線径路等至性モデリング」という今の呼び方と、近年の理論の展開を解説しています。
- サトウタツヤ（編著）（2009）．TEMではじめる質的研究：時間とプロセスを扱う研究をめざして　誠信書房 <br>
  TEM の最初のまとまった入門書です。理論の解説と、研究例を TEM 図とともに載せています。
- 安田裕子・滑田明暢・福田茉莉・サトウタツヤ（編）（2015）．ワードマップ TEA 理論編：複線径路等至性アプローチの基礎を学ぶ　新曜社 <br>
  TEA の主な概念を項目ごとに短く解説しています。用語の意味をひくのに向いています。
- 安田裕子・滑田明暢・福田茉莉・サトウタツヤ（編）（2015）．ワードマップ TEA 実践編：複線径路等至性アプローチを活用する　新曜社 <br>
  TEA を各領域で使った研究の実例集です。
- 安田裕子・サトウタツヤ（編著）（2022）．TEAによる対人援助プロセスと分岐の記述：保育，看護，臨床・障害分野の実践的研究　誠信書房 <br>
  保育・看護・臨床・障害の対人援助の場で TEA を使った研究を集めています。
- サトウタツヤ・安田裕子（監修）上川多恵子・宮下太陽・伊東美智子・小澤伊久美（編）（2023）．カタログTEA（複線径路等至性アプローチ）：図で響きあう　新曜社 <br>
  さまざまな研究の TEM 図を集めた見本帳です。図の見せ方の幅を知るのに向いています。

### 英語

- Valsiner, J., & Sato, T. (2006). Historically structured sampling (HSS): How can psychology's methodology become tuned in to the reality of the historical nature of cultural psychology? In J. Straub, D. Weidemann, C. Kölbl, & B. Zielke (Eds.), *Pursuit of meaning: Advances in cultural and cross-cultural psychology* (pp. 215–252). transcript Verlag. https://doi.org/10.14361/9783839402344-010 <br>
  TEM の土台になった、研究に招く人の選び方（HSS。のちに HSI）を提唱した章です。
- Sato, T., Yasuda, Y., Kido, A., Arakawa, A., Mizoguchi, H., & Valsiner, J. (2007). Sampling reconsidered: Idiographic science and the analyses of personal life trajectories. In J. Valsiner & A. Rosa (Eds.), *The Cambridge handbook of sociocultural psychology* (pp. 82–106). Cambridge University Press. https://doi.org/10.1017/CBO9780511611162.007 <br>
  TEM と HSS を英語で体系的に紹介した章です。英語で TEM を引くときの標準的な文献です。
- Sato, T., Hidaka, T., & Fukuda, M. (2009). Depicting the dynamics of living the life: The trajectory equifinality model. In J. Valsiner, P. C. M. Molenaar, M. C. D. P. Lyra, & N. Chaudhary (Eds.), *Dynamic process methodology in the social and developmental sciences* (pp. 217–240). Springer. https://doi.org/10.1007/978-0-387-95922-1_10 <br>
  TEM の概念と描き方を英語で解説した章です。図の要素の英語名を確かめるのに使えます。
- Sato, T., Mori, N., & Valsiner, J. (Eds.). (2016). *Making of the future: The trajectory equifinality approach in cultural psychology*. Information Age Publishing. <br>
  TEA を主題にした英語の論文集です。TEM の総論と、国際的な応用・拡張の章を収めています。
- Masaki, F. (2025). Self-regulated learning from a cultural psychology perspective: Shifting from strategy to process with the trajectory equifinality approach. *Human Arenas, 8*(1), 131–149. https://doi.org/10.1007/s42087-023-00326-w （無料で読める） <br>
  自己調整学習を題材に、TEA の考え方と図での描き方を英語で説明しています。
- Saito, Y., Tomori, K., Sawada, T., & Ohno, K. (2023). Longitudinal process of setting and achieving activity- and participation-level goals in home rehabilitation in Japan: A qualitative study using trajectory equifinality modeling. *International Journal of Environmental Research and Public Health, 20*(9), Article 5746. https://doi.org/10.3390/ijerph20095746 （無料で読める） <br>
  方法の節で TEM の手順（等至点の設定、分岐点・必須通過点の特定）を説明し、完成した TEM 図を載せた英語の論文です。

## 引用

このソフトウェアを使った場合は引用してください。機械で読める引用の情報は
[`CITATION.cff`](./CITATION.cff) にあります（GitHub の「Cite this repository」からも使えます）。
Zenodo に保存しています: https://doi.org/10.5281/zenodo.24051875 （すべての版。v0.2.0 は https://doi.org/10.5281/zenodo.24051876 ）

```bibtex
@software{nakata_temer_plus,
  author  = {Nakata, Yuki Inoue},
  title   = {TEMer Plus: A Drawing Tool for Trajectory Equifinality Modeling (TEM)},
  year    = {2026},
  version = {0.2.0},
  doi     = {10.5281/zenodo.24051875},
  url     = {https://github.com/YukiInoueNakata/temerplus}
}
```

<!-- CHANGELOG:START -->
## 最近の更新

### 2026年11月8日

- **改善** Mac ではショートカットを ⌘ で表示: ボタンやコマンドパレットのショートカットを、Mac では「⌘Z」「⇧⌘S」のように表示します。やり直しは Mac では ⇧⌘Z です。
- **修正** Shift を使うショートカットが効かないことがある: やり直し（Ctrl+Shift+Z）などが、Shift や Caps Lock の状態によって効きませんでした。
- **修正** ブラウザによって Box の文字の折り返しが変わる: Chrome・Edge は行の端のかっこ（「」）を詰めて表示し、Safari とは折り返しが変わることがありました。どのブラウザでも詰めない表示にそろえました。

### 2026年11月7日

- **改善** 複数ページの出力を作り直し: 図の始まりを 1 ページ目に合わせ、ページの境目を Box どうしの間の空いた所に置くので、Box が途中で切れません。凡例は各ページに、そのページに出てくる種類だけで付きます。図がページ数に入りきらないときは少し縮めて収め、「この図は約 3.4 ページ分です」のような目安も出ます。
- **修正** 出力で文字が枠からあふれる: 「両方に収める」などで図を用紙に合わせて縮めたとき、枠だけが縮んで文字が元の大きさのまま残っていました。文字・メモ・曲線も同じ倍率で縮めます。
- **改善** PNG・PDF・印刷を高い解像度で: 用紙の上で約 300dpi になる大きさで写します（以前の PNG は A4 で横 1170px ほどでした）。
- **修正** Safari で印刷できない: Safari では印刷用の窓がポップアップとして止められ、印刷できませんでした。用紙の向きは Safari の印刷画面で「横」を選んでください。
- **修正** 細い二重線が 1 本に見える: モノクロ（既定）・論文向けのテーマで、等至点の二重線が画面と PNG・PDF では 1 本になっていました。
- **新機能** 出力の前に、含める要素を確認: 出力プレビューで、メモ・記号・コメント・凡例・時期ラベルを図に含めるかを毎回選びます。選び終えるまで保存できません。時期ラベルが無いときや、凡例を含めないときは注意が出ます。
- **新機能** 論文用レポートの出力前の確認画面: 項目ごとの入力状況を「済・未・一部（Box の説明 37 件中 8 件 など）」で示し、「記入を続ける」か「このまま出力する」かを選べます。図にあるメモ・記号・コメントを載せるか、未入力の項目を出力に含めるかもここで選びます。
- **改善** 表記方針を 11 項目に: 論文用レポートの表記方針に、矢印の距離・Box の横幅・Box の高さ・Box の形状・フォント装飾・テキスト配置を足しました。
- **新機能** 記号の簡素化方式（線種は実在性だけ）: 設定の Box スタイルのテーマに「簡素化方式」を足しました。実線＝観察された、点線＝観察されなかった経験とし、EFP・OPP などの種別は種別ラベルで示します。論文用レポートの記号体系の宣言には、今の図の線種がそのまま書き出されます。
- **修正** Box のテーマの線種が PPTX・SVG に出ない不具合: テーマで指定した枠の線種・太さを、PPTX・SVG でも画面と同じに描くようにしました。
- **修正** 凡例・時期ラベルの出力が形式によって食い違う不具合: PNG・PDF と PPTX・SVG とで、凡例や時期ラベルが出るかどうかが食い違うことがあったのを揃えました。

### 2026年10月15日

- **新機能** まとめ枠: Box のプロパティで「まとめ枠」にチェックすると、中に置いた Box をまとめて囲む枠になります（例: いくつかの潜在経験をまとめた P-EFP）。枠を動かすと中の Box とメモも一緒に動きます。
- **新機能** 接続点の表示の切り替え: 「表示」タブの「接続点」で、Box の左右の丸を隠せます。隠しても矢印はつなげます。出力（PPTX・SVG・PNG・PDF）には常に出ません。
- **修正** エラーで止まっても作業中の図が消えないように: エラー画面が出た時点で作業中の図を自動保存に退避します。再読み込み後の確認で「OK（復元する）」を選ぶと戻ります。エラー画面から .tem として保存すること、エラーの詳細をコピーすることもできます。

### 2026年10月10日

- **改善** 記号のあとに文字を書けるように: メモの記号パレットで記号を選ぶと、「★ 重要な転機」のように記号に続けて文字を書けます。
- **修正** ページ分割の出力で SD/SG が消える不具合: PPTX・SVG を複数ページに分けて出力したとき、矢印に付けた SD/SG や、両端の Box が別のページにある幅つきの SD/SG が消えていたのを直しました。

### 2026年10月9日

- **新機能** PowerPoint で描いた TEM 図の取り込み: 「ファイル」タブの「表から取り込み」で .pptx を選ぶと、図形の形と位置から Box・矢印・SD/SG・時期ラベルを組み立てます。TEMer で出力した PPTX はそのまま戻せます。
- **新機能** 強調の記号（★・〇 など）: 「挿入」タブの「記号」で、背景や枠のない「文字だけ」のメモとして置けます。文字色も変えられます。
- **修正** PowerPoint 出力で枠と文字の大きさがずれる・段落の設定が崩れる: 文字の大きさ・フォント・行送り・余白を画面に合わせました。複雑な図でも画面と同じ見た目になります。
- **修正** SD/SG の形と向き: SVG・PPTX の SD/SG を画面と同じ五角形にし、縦型の向きを画面に揃えました。種別ラベルとサブラベルが重なっていたのも直しました。
- **改善** SVG で文字を画面と同じ幅で折り返す: Box・SD/SG・メモの文字が、画面と同じ位置で折り返されるようになりました。
- **修正** PNG・PDF に接続点の丸が写り込む不具合
- **改善** 時期ラベルの設定: 入力中に行の順番が入れ替わらないようにし、帯で表示したときの各時期の範囲を表示します。
- **修正** 逐語録の CSV の文字化け: Shift_JIS で保存された CSV・テキストも読めるようにしました。

それより前の更新は、アプリ（https://yukiinouenakata.github.io/temerplus/）の「ヘルプ」タブの「更新情報」で見られます。
<!-- CHANGELOG:END -->
