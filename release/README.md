# release/

[English below](#english)

`web/` は，その版の TEMer Plus を組み立てたファイル一式です（`index.html` と `assets/`）．Node.js が無くても，静的なファイルとして配れば動きます．
GitHub が使えなくなっても，Zenodo の写しだけで動かせるように入れています．

- 動かし方: [docs/build-from-archive.ja.md](../docs/build-from-archive.ja.md)
- 作り直し方: `webApp` で `npm run build:archive`．版を上げるたびに作り直してコミットします（作り直し忘れは `webApp/src/utils/releaseArchive.test.ts` が知らせます）．
- 手で直さないでください．

## English

`web/` holds the built files of this version of TEMer Plus (`index.html` and `assets/`). Served as static files, they run without Node.js.
They are included so that TEMer Plus can run from the Zenodo archive alone, even if GitHub becomes unavailable.

- How to run: [docs/build-from-archive.en.md](../docs/build-from-archive.en.md)
- How to rebuild: run `npm run build:archive` in `webApp`. Rebuild and commit for every version (`webApp/src/utils/releaseArchive.test.ts` fails if you forget).
- Do not edit by hand.
