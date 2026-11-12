# Running TEMer Plus from the Zenodo archive

[日本語](build-from-archive.ja.md)

TEMer Plus is served on GitHub Pages, and the source code of every version is also archived on Zenodo (concept DOI for all versions: https://doi.org/10.5281/zenodo.24051875 ).
This document explains how to run TEMer Plus on your own computer or on another server using only the zip file from Zenodo, in case GitHub becomes unavailable.

TEMer Plus runs entirely in the browser. It uses no server-side processing or external services, and diagram data stays on the user's computer.
The built files can therefore be served as static files from anywhere.

## 1. Get the zip from Zenodo

1. Open the DOI above and choose a version (each version has its own DOI; the latest one is listed in the README).
2. Download the zip under "Files" (named like `YukiInoueNakata/temerplus-v0.2.6.zip`).
3. Extract it. The extracted folder is called "the archive folder" below.

## 2. Option A: run the prebuilt files (no Node.js needed)

From v0.2.6, the prebuilt files are included in `release/web/`. You can run them without Node.js or npm.

### On your own computer

Double-clicking `index.html` does not work, because browsers block scripts loaded from local files. Serve the folder with a simple server first.

With Python installed, run this in the `release/web` folder:

```
cd <archive folder>/release/web
python3 -m http.server 8000
```

On Windows without `python3`, use `py -m http.server 8000`. Then open http://localhost:8000/ in a browser. Press Ctrl+C in that window to stop the server.

Any other tool that serves static files works too.

### On another server

Copy the contents of `release/web` (`index.html` and the `assets` folder) to the server's public folder as they are.

- Paths are relative, so the files work both at the top of a site (`https://example.ac.jp/`) and in a subfolder (`https://example.ac.jp/tools/temer/`).
- No server-side setup (PHP, databases) is needed.
- HTTPS is recommended. Overwrite-saving in Chrome and Edge (File System Access API) works only over HTTPS or on localhost. Over plain HTTP, opening files and "Save as" (download) still work.

## 3. Option B: build from source

Use this when Option A is not available (for example, versions up to v0.2.5, which have no `release/web`), or when you change the code and build it again.

### Requirements

- Node.js 20 or later (stated in `engines` in `webApp/package.json`). npm comes with Node.js.
- Internet access to the npm registry (https://registry.npmjs.org/ ) to download the dependencies (see "If the dependencies can no longer be downloaded" below).

### Steps

```
cd <archive folder>/webApp
npm ci
npm test
npm run build:archive
```

- `npm ci` installs the dependencies exactly as recorded in `package-lock.json`. Unlike `npm install`, it does not change versions.
- `npm test` is optional. If it passes, the build behaves as the original.
- `npm run build:archive` builds with relative paths into `<archive folder>/release/web`. Serve it as in Option A.
- `npm run build` writes to `webApp/dist`, assuming the files sit at the top of a site (paths like `/assets/...`). For a subfolder, use `build:archive`, or set the location as in `VITE_BASE_PATH=/your/path/ npm run build`.

## 4. If the dependencies can no longer be downloaded

Option B assumes the dependencies can be downloaded from the npm registry. `package-lock.json` records the version and an integrity hash of every package, so the same packages give the same result. If the registry becomes unavailable or packages are withdrawn, however, the source cannot be built.

As a safeguard we do the following, and users can also take some steps:

- **The prebuilt files are included in the Zenodo archive** (Option A). `release/web` is rebuilt and committed for every version, so it is part of each version's zip on Zenodo. The prebuilt files contain the dependencies, so they run without the registry.
- If you may need to rebuild, keep a copy of `webApp/node_modules` after running `npm ci` once, next to the zip. You can then build without reaching the registry (use it on the same operating system).
- If your organization has a mirror of the npm registry, use it with `npm ci --registry <mirror URL>`.

## 5. Checking that it works

Open the fictional demo "Returning to the piano" from the start screen, check that the diagram appears, and export it to PNG or PowerPoint.

## Related

- How to use: [Getting started](getting-started.en.md)
- Features: [features.en.md](features.en.md)
- About the prebuilt folder: [release/README.md](../release/README.md)
