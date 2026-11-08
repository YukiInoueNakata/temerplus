# TEMer Plus

[![Deploy](https://github.com/YukiInoueNakata/temerplus/actions/workflows/deploy.yml/badge.svg)](https://github.com/YukiInoueNakata/temerplus/actions/workflows/deploy.yml)
[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/License-PolyForm_Noncommercial_1.0.0-blue.svg)](./LICENSE)
<!-- DOI badge (add after the first Zenodo release):
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX) -->

English | [日本語版 README はこちら (Japanese)](README.ja.md)

A **drawing tool for diagrams of Trajectory Equifinality Modeling (TEM)**, used in the
Trajectory Equifinality Approach (TEA) in cultural psychology and qualitative research.
TEMer Plus runs in the browser: **no installation and no account are needed**.

**Open the app: https://yukiinouenakata.github.io/temerplus/**

Draw boxes for experiences and the TEM-specific points (bifurcation points, obligatory
passage points, equifinality points and their polarized counterparts), connect them with
realized and unrealized paths, add social direction (SD) and social guidance (SG) along
irreversible time, and export the diagram to **PNG / SVG / PDF / PPTX** or a **Word report
for a paper**. Diagrams are processed only inside your browser and are never sent to a server.

Stack: **React + TypeScript + Vite + React Flow** (a static web app on GitHub Pages).

![TEMer Plus: the ribbon at the top, a TEM diagram in the center, and the properties panel on the right.](docs/images/screenshot.png)

## Statement of need

TEM diagrams follow conventions of their own: box types marked by border styles,
realized and unrealized paths, social direction and social guidance, period labels, and
irreversible time running in one direction. Researchers usually draw them by hand in
PowerPoint or Illustrator, where keeping the notation consistent, rearranging boxes as an
analysis develops, and reporting the notation in a paper all take manual work. TEMer Plus
treats these elements as structured data (types, levels on the time and item axes, links
between boxes), so the notation stays consistent, the layout can be edited and
reorganized, and the same data produce the figure and the text for a paper's method
section. It succeeds TEMer, an earlier Excel VBA tool by the same author, and its features
were shaped by a survey of TEM researchers. Target users are researchers and students
using TEA/TEM, including those who are new to drawing TEM diagrams.

## Features

- **TEM elements** — box types (normal experience, latent experience, bifurcation point,
  equifinality point, polarized equifinality point, obligatory passage point, second
  equifinality point, others), solid and dashed paths, SD/SG (attached to a box or an
  arrow, between boxes, or in bands), period labels, the irreversible-time arrow, and an
  automatic legend; horizontal and vertical layouts; several diagrams (sheets) per file.
- **Editing** — a data sheet for table-style editing, alignment and spacing tools,
  undo/redo, notes and symbols on the diagram, and box style themes (including a simplified
  notation in which line styles show only whether a path was observed).
- **Import** — CSV / Excel (including MAXQDA coded segments), TEM diagrams drawn in
  PowerPoint (.pptx), and interview transcripts linked to boxes.
- **Export** — PNG / SVG / PDF / PPTX / printing, at about 300 dpi for images, with a
  confirmation of what to include, fitting to the paper, and multi-page output whose page
  breaks fall between boxes; a Word report for papers with the notation declaration, the
  notation policy, the diagram, and descriptions of each element; CSV export.
- **Files** — diagrams are saved as `.tem` (JSON) files; unsaved work is kept automatically
  in the browser.

## Getting started

Open https://yukiinouenakata.github.io/temerplus/ in **Chrome** (recommended), Edge, or
Safari. A step-by-step guide with screenshots, from opening the app to exporting a diagram
and a paper report, is in [docs/getting-started.en.md](docs/getting-started.en.md)
(日本語: [docs/getting-started.ja.md](docs/getting-started.ja.md)).

| Browser | Saving |
|---|---|
| Chrome, Edge | Choose a file once; later saves overwrite it |
| Safari, Firefox | Each save downloads a `.tem` file |

Tested on Windows (Chrome, Edge), macOS 26 on Apple Silicon (Safari, Chrome) and macOS 12
on Intel (Safari, Chrome).

The interface is currently in Japanese. An English demo diagram is available from the
welcome screen ("Open English demo").

Workshop materials (TEA 2026, in Japanese): https://yukiinouenakata.github.io/tea2026/

## Running from source

Requires Node.js 20 or later.

```bash
cd webApp
npm ci
npm run dev        # development server at http://localhost:5173/
npm test           # unit tests (Vitest)
npm run build      # static files in webApp/dist/
```

## Notes & limitations

- The interface is in Japanese; the English interface is in preparation.
- PPTX export reproduces positions, text and shapes approximately; PowerPoint wraps text
  on its own. Use PNG, SVG or PDF when the exact appearance matters.
- When printing from Safari, choose the paper orientation in the print dialog yourself.
- In multi-page export, the legend is placed at the same position on every page and may
  overlap boxes in some diagrams.

## Contributing & support

- **Issues** — report bugs or request features via
  [GitHub Issues](https://github.com/YukiInoueNakata/temerplus/issues). Please include your
  computer (Windows or Mac and version), your browser, and what happened.
- **Release notes** — see the in-app Help tab ("更新情報"), the
  [project page](https://yukiinouenakata.github.io/en/programs/temer-plus/), or the
  Japanese README.

## License & attribution

Author: Yuki Inoue Nakata ([ORCID 0009-0000-4934-323X](https://orcid.org/0009-0000-4934-323X)),
College of Comprehensive Psychology, Ritsumeikan University — design, implementation, documentation.

This repository is licensed under the **PolyForm Noncommercial License 1.0.0** (full text in
[`LICENSE`](./LICENSE)).

- **Noncommercial use is free** — research, teaching, and personal use.
- **Commercial use requires a separate license** — see [`COMMERCIAL.md`](./COMMERCIAL.md).

## Citation

If you use this software, please cite it. Machine-readable metadata is in
[`CITATION.cff`](./CITATION.cff) (also available through GitHub's "Cite this repository").
A DOI will be added here after the first archived release on Zenodo.

```bibtex
@software{nakata_temer_plus,
  author  = {Nakata, Yuki Inoue},
  title   = {TEMer Plus: A Drawing Tool for Trajectory Equifinality Modeling (TEM)},
  year    = {2026},
  version = {0.2.0},
  url     = {https://github.com/YukiInoueNakata/temerplus}
}
```
