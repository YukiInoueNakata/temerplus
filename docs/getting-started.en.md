# Getting started (from opening the app to exporting a diagram)

> **日本語版のガイド (Japanese version): [getting-started.ja.md](getting-started.ja.md)**

TEMer Plus is a **drawing tool for diagrams of Trajectory Equifinality Modeling (TEM)**, used in the Trajectory Equifinality Approach (TEA).
This guide walks a first-time user through opening TEMer Plus, drawing a diagram, and exporting it as an image or as a Word report for a paper.
Follow the screenshots and click the places outlined in red.

The screenshots show the English interface. To switch the interface language, use "English / 日本語" at the top right, or "日本語｜English" on the welcome screen.

- [1. Open the app](#1-open-the-app)
- [2. Look at the demo diagram](#2-look-at-the-demo-diagram)
- [3. Draw a new diagram](#3-draw-a-new-diagram)
- [4. Save](#4-save)
- [5. Export as an image or PowerPoint](#5-export-as-an-image-or-powerpoint)
- [6. Export a report for a paper (Word)](#6-export-a-report-for-a-paper-word)
- [7. Troubleshooting](#7-troubleshooting)

<!-- Screenshots: Chromium, English interface (2026-11-08, v0.2.1; taken with webApp/scripts/guide-shots/shoot.py). The steps are the same on a Mac (read Ctrl as ⌘). -->

## 1. Open the app

TEMer Plus needs **no installation and no account**. Just open this page in a browser:

https://yukiinouenakata.github.io/temerplus/

- **Chrome** is recommended (Edge works the same way). Safari on a Mac also works.
- Your diagrams are processed only inside your browser. Nothing is sent to a server.
- If you use it often, bookmark the page.

Saving works a little differently depending on the browser (see [4. Save](#4-save)).

| Browser | How saving works |
|---|---|
| Chrome, Edge | Choose where to save once; later saves overwrite the same file |
| Safari, Firefox | Each save creates a file in your Downloads folder |

## 2. Look at the demo diagram

1. When the app opens, the "Welcome to TEMer" screen appears. Click "Open English demo".
   ("Open demo file" opens the same demo in Japanese.)

   ![Open the demo file](images/getting-started/app-01-wizard-demo-en.png)

2. A demo that reproduces a published figure (Kanzaki & Suzuki, 2021) opens. The parts of the screen are:

   ![Parts of the screen](images/getting-started/app-02-overview-en.png)

   1. Ribbon (switch tabs to use the File, Edit, Insert and other buttons)
   2. Diagram (draw the TEM diagram here)
   3. Properties (settings of the selected box or arrow)
   4. Data sheet (click to list and edit boxes and arrows as a table)
   5. Sheet tabs (one file can hold several diagrams)

## 3. Draw a new diagram

1. On the welcome screen, click "Start from an empty file".
   (If a diagram is already open, you can also use "New" on the "File" tab.)

   ![Create from an empty file](images/getting-started/app-10-wizard-empty-en.png)

2. Open the "Insert" tab and click "Normal".

   ![Normal on the Insert tab](images/getting-started/app-11-insert-normal-en.png)

3. A box is added to the diagram.

   ![A box was added](images/getting-started/app-12-box-added-en.png)

4. Double-click the box to edit its text (or select it and press Enter).

   ![Double-click to edit the text](images/getting-started/app-13-edit-label-en.png)

5. Type the experience. (In a horizontal diagram in Japanese, box text is shown vertically; in English it stays horizontal.)
   When you are done, click an empty part of the diagram.

   ![Text typed](images/getting-started/app-14-typed-en.png)

6. In the same way, add boxes of other types, such as "Obligatory passage point" (OPP). Each type (normal, bifurcation point, equifinality point, polarized equifinality point, obligatory passage point and so on) has its own border.

   ![Add an obligatory passage point](images/getting-started/app-15-insert-opp-en.png)

7. Select the two boxes to connect. Click the first one, then click the second one **while holding Shift**.

   ![Select two boxes](images/getting-started/app-16-select-two-en.png)

8. Click "Solid path". For a path that was not realized, use "Dashed path".
   If you select three or more boxes, they are connected in the order you selected them.

   ![Solid arrow](images/getting-started/app-17-arrow-button-en.png)

9. The two boxes are connected by an arrow.

   ![Connected by an arrow](images/getting-started/app-18-arrow-added-en.png)

Social direction (SD), social guidance (SG) and periods can be added with "Add SD", "Add SG" and "Period labels..." on the Insert tab.
To undo a mistake, use "Undo" on the "Edit" tab (Ctrl+Z, or ⌘Z on a Mac).

### Switch between horizontal and vertical layouts

Time can flow to the right (Horizontal) or downward (Vertical). Switch with the "Horizontal" / "Vertical" buttons at the top right.
Boxes, arrows, SD/SG, and the legend are repositioned for the new direction.
After switching, press "Fit all" (⛶) at the bottom right of the diagram to see the whole diagram.

For everything else the app can do, see the [list of features](features.en.md).

## 4. Save

Click "Save" in the top-right corner (Ctrl+S, or ⌘S on a Mac). The diagram is saved as a `.tem` file.

![Save](images/getting-started/app-20-save-en.png)

- **Chrome, Edge**: the first time, you choose where to save and the file name. Later saves overwrite that file.
- **Safari, Firefox**: each save creates a `.tem` file in your Downloads folder. The first time, Safari asks whether to allow downloads; click "Allow".

Open a saved file with "Open a project" on the welcome screen, or "Open" on the File tab.
Unsaved changes are also kept automatically in the browser. If the app asks whether to restore them the next time you open it, click "OK" to continue where you left off.

## 5. Export as an image or PowerPoint

1. Click "Export..." on the "File" tab.

   ![Export](images/getting-started/app-30-file-export-en.png)

2. The export screen appears.

   ![The export screen](images/getting-started/app-31-export-dialog-en.png)

   1. Choose the format: PNG, SVG, PDF, PPTX (PowerPoint) or print.
   2. Choose each time whether to include the legend, period labels and so on. You cannot save until every choice is made.

   You can also choose the paper size and whether to split the diagram over several pages. A preview of the output is shown on the right.

3. Then click the button at the bottom right (for example "Save as PNG").

   ![The save button](images/getting-started/app-32-export-save-en.png)

When you print from Safari, choose the paper orientation (for example landscape) in the print dialog yourself.

## 6. Export a report for a paper (Word)

You can collect material for the method and results sections of a paper in a Word file: the meaning of the notation (notation declaration), the notation policy, the diagram, and descriptions of each box and arrow.

1. Click "Paper report" on the "File" tab.

   ![Paper report](images/getting-started/app-40-report-button-en.png)

2. Fill in the tabs as needed: General, Notation, Participants, Interview and Notation policy (you can also export without filling them in). Then open the "Export" tab.

   ![The paper report screen](images/getting-started/app-41-report-dialog-en.png)

3. Click "Generate report...". A check screen shows the status of each item and lets you choose whether to include missing items. Click "Export as is" to create the Word file.

   ![Generate report](images/getting-started/app-42-report-generate-en.png)

## 7. Troubleshooting

From the "Help" tab you can reopen the welcome screen ("Startup wizard") and read the release notes ("What's new"). "GitHub" and "Author" open the repository and the author's web page.

![Help (1 welcome screen, 2 release notes)](images/getting-started/app-50-help-en.png)

- If the diagram does not fit on the screen, use the buttons at the bottom right of the diagram to show the whole diagram.
- Workshop materials (TEA 2026, in Japanese: slides and practice files) are also available: https://yukiinouenakata.github.io/tea2026/
- If something does not work, please report it on [Issues](https://github.com/YukiInoueNakata/temerplus/issues) with your computer (Windows or Mac and version), your browser, and what happened.
