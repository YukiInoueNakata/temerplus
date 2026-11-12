# Zenodo の写しから TEMer Plus を動かす

[English](build-from-archive.en.md)

TEMer Plus は GitHub Pages で配信していますが，各版のソースコードは Zenodo にも保存しています（全版をまとめた DOI: https://doi.org/10.5281/zenodo.24051875 ）．
この文書は，GitHub が使えなくなったときに，Zenodo から取った zip だけを手がかりに TEMer Plus を手元や別のサーバーで動かす手順です．

TEMer Plus はブラウザの中だけで動くアプリです．サーバー側の処理や外部のサービスは使わず，図のデータは利用者のパソコンの中に残ります．
そのため，組み立てたファイル一式を静的なファイルとして配れば，どこでも動きます．

## 1. Zenodo から zip を取る

1. 上の DOI を開き，使いたい版を選びます（版ごとに DOI があります．最新版は README に書いてあります）．
2. 「Files」にある zip（`YukiInoueNakata/temerplus-v0.2.6.zip` のような名前）を取ります．
3. zip を展開します．展開したフォルダを，以下では「展開先」と呼びます．

## 2. 方法 A: 組み立て済みのファイルで動かす（Node.js は要らない）

v0.2.6 からは，組み立て済みのファイルを `release/web/` に入れています．Node.js も npm も使わずに動かせます．

### 手元のパソコンで開く

`index.html` をダブルクリックで開いても動きません．ブラウザが，ローカルのファイルからのプログラムの読み込みを止めるためです．簡単なサーバーで配ってから開きます．

Python が入っていれば，次のどちらかで配れます（`release/web` のフォルダで実行します）．

```
cd 展開先/release/web
python3 -m http.server 8000
```

Windows で `python3` が無いときは `py -m http.server 8000` を使います．そのあと，ブラウザで http://localhost:8000/ を開きます．止めるときは，その窓で Ctrl+C を押します．

Python が無くても，静的なファイルを配れるものなら何でも使えます．

### 別のサーバーに置く

`release/web` の中身（`index.html` と `assets` フォルダ）を，そのままサーバーの公開フォルダに写します．

- 読み込みは相対のパスなので，サイトの一番上（`https://example.ac.jp/`）にも，下の階層（`https://example.ac.jp/tools/temer/`）にも置けます．
- サーバー側の設定（PHP やデータベース）は要りません．
- HTTPS で配ることを勧めます．Chrome・Edge の「上書き保存」（File System Access API）は，HTTPS か localhost でしか使えません．HTTP でも，読み込みと「名前を付けて保存」（ダウンロード）は使えます．

## 3. 方法 B: ソースから組み立てる

方法 A が使えないとき（`release/web` の無い v0.2.5 以前の版など），または手を加えて組み立て直すときの手順です．

### 必要なもの

- Node.js 20 以上（`webApp/package.json` の `engines` に書いてあります）．npm は Node.js に付いてきます．
- npm のレジストリ（https://registry.npmjs.org/ ）に届くインターネット接続．依存のパッケージを取るためです（下の「依存のパッケージが取れなくなったとき」も見てください）．

### 手順

```
cd 展開先/webApp
npm ci
npm test
npm run build:archive
```

- `npm ci` は，`package-lock.json` に書かれた版のとおりに依存のパッケージを入れます．`npm install` と違って版を変えません．
- `npm test` は省いてもかまいません．通れば，組み立てたものが元と同じに動くことの確かめになります．
- `npm run build:archive` は，相対のパスで組み立てて，`展開先/release/web` に書き出します．あとは方法 A と同じに配ります．
- `npm run build` を使うと `webApp/dist` に書き出しますが，サイトの一番上に置く前提（読み込みが `/assets/...`）になります．下の階層に置くなら `build:archive` を使うか，`VITE_BASE_PATH=/置く場所/ npm run build` のように置き場所を指定します．

## 4. 依存のパッケージが取れなくなったとき

方法 B は，npm のレジストリから依存のパッケージを取れることを前提にしています．`package-lock.json` には，各パッケージの版と中身の検査値（integrity）が書いてあるので，同じものが取れれば同じ結果になります．ただ，将来レジストリが使えなくなったり，パッケージが取り下げられたりすると組み立てられません．

その備えとして，次のことをしています．あわせて，使う側でできることも挙げます．

- **組み立て済みのファイルを Zenodo に含めています**（方法 A）．版ごとに `release/web` を作り直してコミットしているので，各版の Zenodo の zip に入ります．組み立て済みは依存のパッケージを中に含むので，レジストリが無くても動きます．
- 手元で組み立て直す見込みがあるなら，一度 `npm ci` したあとの `webApp/node_modules` を，zip の隣に保存しておくと，レジストリに届かなくても組み立てられます（同じ OS の上で使ってください）．
- 社内や学内に npm のレジストリの写し（ミラー）があれば，`npm ci --registry <写しの URL>` で使えます．

## 5. 確かめ方

開いたら，「デモファイルを開く」で架空の例「ピアノの再開」を開き，図が出ること，PNG や PowerPoint に書き出せることを確かめます．

## 関連

- 使い方: [はじめてのガイド](getting-started.ja.md)
- 機能の一覧: [features.ja.md](features.ja.md)
- 組み立て済みのフォルダの説明: [release/README.md](../release/README.md)
