# Features

> **日本語版 (Japanese version): [features.ja.md](features.ja.md)**

What TEMer Plus can do, grouped by where it is in the app.
For step-by-step instructions, see the [getting started guide](getting-started.en.md).
Names in parentheses are the ribbon tabs and buttons where each feature lives.

- [Screen and display](#screen-and-display)
- [TEM diagram elements](#tem-diagram-elements)
- [Editing](#editing)
- [Appearance settings](#appearance-settings)
- [Import](#import)
- [Transcripts and participants](#transcripts-and-participants)
- [Export](#export)
- [Files and saving](#files-and-saving)
- [Help](#help)

## Screen and display

- **Interface language**: switch between Japanese and English ("English / 日本語" at the top right, or "日本語｜English" in the startup dialog). Your choice is remembered by the browser. The language of the text inside a diagram (such as the legend) is set per diagram with Settings > General > Diagram language.
- **Horizontal and vertical layouts**: time can flow to the right (Horizontal) or downward (Vertical); switch with "Horizontal" / "Vertical" at the top right. Boxes, arrows, SD/SG, and the legend are repositioned for the new direction.
- **Panels**: show or hide the data sheet on the left (table-style editing), the properties panel on the right (detailed settings of the selected element), and comments (View > Panels).
- **Display aids**: grid, connection points, snap, paper frame, top and left rulers, type labels (BFP and so on), SD/SG bands (View).
- **Fit to screen**: fit the whole diagram, its width, or its height to the window (View > Fit, or the buttons at the bottom right of the diagram). The zoom level is shown in the status bar.
- **Command palette**: press Ctrl+K (⌘K on a Mac) and type the name of a feature to run it.
- **Startup dialog**: "Welcome to TEMer" opens when the app starts, offering to create, open, or open a demo (Help > Startup wizard opens it again).

## TEM diagram elements

- **Box types**: action, potential action (renamed from Normal and Latent experience on 2026-11-12), bifurcation point (BFP), equifinality point (EFP), polarized equifinality point (P-EFP), obligatory passage point (OPP), second equifinality point (2nd EFP), polarized second equifinality point (P-2nd EFP), and other (Insert > Box).
- **Paths (lines)**: solid arrows for realized paths and dashed arrows for unrealized paths. Selected Boxes can be connected in order (Insert > Line / arrow). Lines can be straight or curved.
- **SD and SG**: social direction (SD) and social guidance (SG). They can be attached to a Box or an arrow, placed between two Boxes, or collected in bands above and below the diagram (Insert > Add SD/SG, SD/SG placement).
- **Period labels**: period boundaries and names (Insert > Period labels).
- **Irreversible Time**: the time arrow is drawn automatically outside the diagram, placed so that it does not overlap SD/SG or their labels.
- **Legend**: built automatically from the symbols used in the diagram. In a new diagram it is placed automatically below the time arrow, right-aligned and wide (moving it switches to manual). Items, number of columns, font size, and frame can be changed.
- **Notes and symbols**: notes placed on the diagram and symbols with leader lines (Insert > Notes).
- **Labels**: Boxes and SD/SG can have a type label (BFP-1 and so on) and a sublabel (a short note). Box text can be styled with bold, underline, color, and so on.
- **Sheets**: one file can hold several diagrams (sheets), for example one per participant and an integrated diagram.

## Editing

- **Modes**: Pan (move the view; key H), Select (move shapes; key V), Area select (key M) (Edit > Mode). Boxes, notes, symbols, and other shapes are moved by dragging them in Select mode.
- **Quick Box edits**: right-click a Box for a menu with its type, raising or lowering the Item level, editing the text, and deleting. Selecting a Box shows a small toolbar above it for the type and the Item level. Number keys 1–7 change the type (1 experience, 2 bifurcation point, 3 equifinality point, 4 polarized equifinality point, 5 obligatory passage point, 6 latent experience, 7 other), and arrow keys move it (with Shift, by one level). With several Boxes selected, all of them change. Arrow keys move shapes in Select and Area select modes.
- **Basics**: undo and redo, copy, paste, duplicate, delete, select all (Edit).
- **Size**: fit a Box's width and height to its text (Edit > Fit to text); match width, height, size, or font size (Arrange).
- **Alignment**: align left, center, right, top, middle, bottom; distribute horizontally (Arrange > Align and size); bring to front or send to back (Arrange > Order).
- **Reordering and shifting**: swap the order of Boxes, shift everything after a Box (Edit), insert a Box between two Boxes (Insert > Insert between), resize or move the whole diagram (File > Resize, Move).
- **Overlap check**: lists overlaps between Boxes, text, SD/SG, the legend and so on, and text that overflows its frame, and jumps to each place (Arrange > Check > Overlap check).
- **Data sheet**: view the diagram as a table and edit text, types, and positions. Rows can be copied and pasted.

## Appearance settings

Settings (File > Settings) control the look of the diagram in detail.

- **General**: diagram language, horizontal or vertical layout, interface font size, and so on.
- **Snap**: the snapping interval when placing elements.
- **Box style**: frame, line, and color for each Box type. Choose a ready-made theme (including a simplified style that uses line types only for whether something happened, and the style of Fig. 2-1 in Catalog TEA) or save your own.
- **Line (arrow)**: line width, color, and arrowheads.
- **Type labels**: whether and how to show type labels such as BFP.
- **Irreversible Time**: text, length, position, and width of the time arrow.
- **Period**: position and style of the period labels.
- **Legend**: which items to include and how the legend looks.
- **SD/SG placement**: whether to use bands above and below, their height and position, and how SD/SG are arranged in them.
- **Project**: title, author, and other information, and defaults for new elements.

## Import

- **Import from a table**: create Boxes, arrows, SD/SG, and periods from CSV or Excel files. Coded segments exported from MAXQDA can also be read (File > Import from table).
- **Import from PowerPoint**: read a TEM diagram drawn in PowerPoint (.pptx), guess the role of each shape, and turn it into a TEMer Plus diagram. The guesses can be checked and corrected before importing.
- **Open as new sheets**: add the diagrams of another .tem file as sheets of the current file.

## Transcripts and participants

- **Import transcripts**: import interview transcripts (text, Word, CSV, Excel) one at a time or in bulk (File > Transcript, Bulk transcripts).
- **Transcript viewer**: read a transcript while creating Boxes from paragraphs or linking Boxes to paragraphs (source references). It can also search, link many paragraphs at once, and jump from a Box to its paragraph.
- **From segments to Boxes**: select a range in the transcript and press "Make a segment" to keep it as a segment (shown with a purple dashed underline). The segment list shows segments in text order, where you can set a heading (the Box text), type, Item level, and note. Boxes made from selected segments are placed in text order along the time axis, and changing a heading or type in the list updates the Box. "Arrange Boxes in text order" reorders the Boxes to follow the transcript.
- **Participants**: keep transcripts and diagrams together for each participant, and refer to them by pseudonyms.
- **Anonymized export**: export a file in which names are replaced with pseudonyms.

## Export

- **Formats**: PNG (image, about 300 dpi), SVG, PDF, PPTX (editable shapes in PowerPoint), and printing (File > Export).
- **Paper and fitting**: choose paper size, orientation, and margins; fit the diagram on one page, or split it between Boxes across several pages.
- **Check what to include**: before exporting, confirm whether to include the legend, period labels, and so on.
- **Readability on paper**: shows the smallest text size (pt) when the figure is fitted to the paper, and warns below 7 pt. The preview can be viewed in grayscale to check black-and-white printing.
- **Presets**: save frequently used export settings under a name.
- **Paper report (Word)**: create a Word file with a notation declaration, notation policy, the diagram, and a description of each element (File > Paper report). The text is written in the diagram language.
- **CSV export**: export the elements of the diagram to CSV (File > CSV export).

## Files and saving

- **.tem files**: diagrams are saved as .tem (JSON) files. In Chrome and Edge, saving overwrites the same file.
- **Automatic backup**: unsaved changes are kept in the browser and can be restored the next time you open the app.
- **No installation**: it runs in the browser. Diagram data is handled only on your own computer and is never sent to a server.

## Help

- Startup wizard, Manual (the getting started guide), What's new, About (Help).
- **GitHub**: opens the repository page (source code, updates, issue reports).
- **Author**: opens the author's web page.
