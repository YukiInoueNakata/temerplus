// ============================================================================
// CommandPalette - Ctrl+K で開く全コマンド検索パレット
// Ribbon の主要機能をテキスト検索で発見・実行できる
// ============================================================================

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTEMStore } from '../store/store';
import type { BoxType, SDSGType } from '../types';
import { pickBetweenAnchors } from '../utils/sdsgBetween';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { shortcutLabel } from '../utils/platform';

export interface CommandPaletteCallbacks {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onOpenSettings: (initialTab?: string) => void;
  onOpenExport: () => void;
  onOpenInsertBetween: () => void;
  onOpenPeriodLabels: () => void;
  onOpenPaperReport: () => void;
  onOpenResize: () => void;
  onOpenCSVImport: () => void;
  onOpenShiftContent: () => void;
  onOpenTranscript: () => void;
}

type Category = 'file' | 'edit' | 'insert' | 'view' | 'align' | 'export' | 'tools' | 'help';

interface Command {
  id: string;
  label: string;
  keywords: string;
  category: Category;
  shortcut?: string;
  run: () => void;
}

// 分類の見出しは commandPalette.csv の category.<分類>

export function CommandPalette({
  open,
  onClose,
  callbacks,
}: {
  open: boolean;
  onClose: () => void;
  callbacks: CommandPaletteCallbacks;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation('commandPalette');
  const categoryLabel = (c: Category) => t(`category.${c}`);

  const commands = useCommands(callbacks);

  // open 状態リセット
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // 次の tick で focus (DOM mount 後)
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q)
      || c.keywords.toLowerCase().includes(q)
      || categoryLabel(c.category).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commands, query, t]);

  // active index を範囲内にクランプ
  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIndex]);

  // 選択行を画面内にスクロール
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector(`[data-cmd-idx="${activeIndex}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) {
        cmd.run();
        onClose();
      }
      return;
    }
  };

  // カテゴリごとにグループ化
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});
  const orderedCategories: Category[] = ['file', 'edit', 'insert', 'view', 'align', 'export', 'tools', 'help'];

  let runningIdx = 0;
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ alignItems: 'flex-start', paddingTop: 80 }}
    >
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-label={t('aria')}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
          placeholder={t('placeholder')}
          className="command-palette-input"
        />
        <div className="command-palette-list" ref={listRef}>
          {filtered.length === 0 && (
            <div className="command-palette-empty">{t('empty')}</div>
          )}
          {orderedCategories.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat}>
                <div className="command-palette-category">{categoryLabel(cat)}</div>
                {items.map((cmd) => {
                  const idx = runningIdx++;
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      data-cmd-idx={idx}
                      className={active ? 'command-palette-item active' : 'command-palette-item'}
                      onClick={() => { cmd.run(); onClose(); }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <span className="command-palette-item-label">{cmd.label}</span>
                      {cmd.shortcut && (
                        <span className="command-palette-item-shortcut">{cmd.shortcut}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="command-palette-footer">
          <span>{t('footer.select')}</span>
          <span>{t('footer.run')}</span>
          <span>{t('footer.close')}</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// コマンド定義
// ----------------------------------------------------------------------------

function useCommands(callbacks: CommandPaletteCallbacks): Command[] {
  // Store actions を hook で取得
  const view = useTEMStore((s) => s.view);
  const toggleGrid = useTEMStore((s) => s.toggleGrid);
  const toggleSnap = useTEMStore((s) => s.toggleSnap);
  const togglePaperGuides = useTEMStore((s) => s.togglePaperGuides);
  const toggleBoxIds = useTEMStore((s) => s.toggleBoxIds);
  const toggleSDSGIds = useTEMStore((s) => s.toggleSDSGIds);
  const toggleLineIds = useTEMStore((s) => s.toggleLineIds);
  const toggleAllIds = useTEMStore((s) => s.toggleAllIds);
  const toggleTopRuler = useTEMStore((s) => s.toggleTopRuler);
  const toggleLeftRuler = useTEMStore((s) => s.toggleLeftRuler);
  const toggleLegend = useTEMStore((s) => s.toggleLegend);
  const requestFit = useTEMStore((s) => s.requestFit);
  const { t } = useTranslation('commandPalette');

  return useMemo(() => {
    const store = useTEMStore.getState;
    const temporal = useTEMStore.temporal.getState;

    const cmds: Command[] = [
      // === File ===
      { id: 'file.new', label: t('cmd.file.new'), keywords: 'new file 新規 ファイル', category: 'file', shortcut: shortcutLabel('Ctrl+N'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onNew },
      { id: 'file.open', label: t('cmd.file.open'), keywords: 'open file 開く 読み込み load', category: 'file', shortcut: shortcutLabel('Ctrl+O'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpen },
      { id: 'file.save', label: t('cmd.file.save'), keywords: 'save file 保存', category: 'file', shortcut: shortcutLabel('Ctrl+S'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onSave },
      { id: 'file.save-as', label: t('cmd.file.save-as'), keywords: 'save as 名前 保存', category: 'file', shortcut: shortcutLabel('Ctrl+Shift+S'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onSaveAs },

      // === Edit ===
      { id: 'edit.undo', label: t('cmd.edit.undo'), keywords: 'undo 元に戻す', category: 'edit', shortcut: shortcutLabel('Ctrl+Z'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => temporal().undo() },
      { id: 'edit.redo', label: t('cmd.edit.redo'), keywords: 'redo やり直し', category: 'edit', shortcut: shortcutLabel('Ctrl+Y', 'Ctrl+Shift+Z'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => temporal().redo() },
      { id: 'edit.select-all', label: t('cmd.edit.select-all'), keywords: 'select all 全選択', category: 'edit', shortcut: shortcutLabel('Ctrl+A'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => store().selectAll() },
      { id: 'edit.copy', label: t('cmd.edit.copy'), keywords: 'copy コピー clipboard', category: 'edit', shortcut: shortcutLabel('Ctrl+C'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => store().copyToClipboard() },
      { id: 'edit.paste', label: t('cmd.edit.paste'), keywords: 'paste 貼り付け clipboard', category: 'edit', shortcut: shortcutLabel('Ctrl+V'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => store().pasteFromClipboard() },
      { id: 'edit.duplicate', label: t('cmd.edit.duplicate'), keywords: 'duplicate 複製 copy', category: 'edit', shortcut: shortcutLabel('Ctrl+D'), // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => { store().copyToClipboard(); store().pasteFromClipboard(); } },
      { id: 'edit.delete', label: t('cmd.edit.delete'), keywords: 'delete 削除', category: 'edit', shortcut: 'Delete', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => {
          const sel = store().selection;
          if (sel.boxIds.length > 0) store().removeBoxes(sel.boxIds);
          if (sel.lineIds.length > 0) store().removeLines(sel.lineIds);
          if (sel.sdsgIds.length > 0) sel.sdsgIds.forEach((id) => store().removeSDSG(id));
        } },
      { id: 'edit.clear-sel', label: t('cmd.edit.clear-sel'), keywords: 'clear selection 選択解除', category: 'edit', shortcut: 'Esc', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => store().clearSelection() },
      { id: 'edit.fit-to-label-both', label: t('cmd.edit.fit-to-label-both'), keywords: 'fit label 文字 サイズ', category: 'edit', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => {
          const ids = store().selection.boxIds;
          if (ids.length === 0) { alert(t('alert.selectBox')); return; }
          store().fitBoxesToLabel(ids, 'both');
        } },
      { id: 'edit.fit-to-label-w', label: t('cmd.edit.fit-to-label-w'), keywords: 'fit width label 幅', category: 'edit', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => {
          const ids = store().selection.boxIds;
          if (ids.length === 0) { alert(t('alert.selectBox')); return; }
          store().fitBoxesToLabel(ids, 'width');
        } },
      { id: 'edit.fit-to-label-h', label: t('cmd.edit.fit-to-label-h'), keywords: 'fit height label 高さ', category: 'edit', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => {
          const ids = store().selection.boxIds;
          if (ids.length === 0) { alert(t('alert.selectBox')); return; }
          store().fitBoxesToLabel(ids, 'height');
        } },

      // === Insert ===
      ...(['normal', 'BFP', 'OPP', 'EFP', 'P-EFP', '2nd-EFP', 'P-2nd-EFP', 'annotation', 'other'] as BoxType[]).map((type): Command => ({
        id: `insert.box.${type}`,
        label: t('cmd.insert.box', { type }),
        keywords: `insert box add ${type} ${type === 'normal' ? '行為 通常 action normal' : type === 'annotation' ? '潜在的な行為 潜在経験 potential latent' : ''}`, // i18n-ok 検索用の語（旧称の 通常・潜在経験 でも引けるように残す）
        category: 'insert',
        run: () => store().addBox({ type }),
      })),
      ...(['SD', 'SG'] as SDSGType[]).map((type): Command => ({
        id: `insert.sdsg.${type}`,
        label: t('cmd.insert.sdsg', { type }),
        keywords: `insert sdsg add ${type} between`,
        category: 'insert',
        run: () => {
          const st = store();
          const sel = st.selection;
          const sheet = st.doc.sheets.find((s) => s.id === st.doc.activeSheetId);
          const isH = st.doc.settings.layout === 'horizontal';
          if (sel.boxIds.length === 0 && sel.lineIds.length === 0) {
            alert(t('alert.selectBoxOrLine')); return;
          }
          if (sel.boxIds.length === 0) {
            st.addSDSG({ type, attachedTo: sel.lineIds[0], label: type });
            return;
          }
          if (sel.boxIds.length === 1) {
            st.addSDSG({ type, attachedTo: sel.boxIds[0], label: type });
            return;
          }
          if (!sheet) return;
          const selectedBoxes = sheet.boxes.filter((b) => sel.boxIds.includes(b.id));
          const pair = pickBetweenAnchors(selectedBoxes, isH);
          if (!pair) return;
          st.addSDSG({
            type,
            attachedTo: pair.lowBoxId,
            attachedTo2: pair.highBoxId,
            anchorMode: 'between',
            betweenMode: 'edge-to-edge',
            label: type,
          });
        },
      })),
      { id: 'insert.line.rline', label: t('cmd.insert.line.rline'), keywords: 'insert line rline 実線', category: 'insert', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => {
          const sel = store().selection.boxIds;
          if (sel.length < 2) { alert(t('alert.selectTwoOrMore')); return; }
          for (let i = 0; i < sel.length - 1; i++) store().addLine(sel[i], sel[i + 1], { type: 'RLine' });
        } },
      { id: 'insert.line.xline', label: t('cmd.insert.line.xline'), keywords: 'insert line xline 点線', category: 'insert', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => {
          const sel = store().selection.boxIds;
          if (sel.length < 2) { alert(t('alert.selectTwoOrMore')); return; }
          for (let i = 0; i < sel.length - 1; i++) store().addLine(sel[i], sel[i + 1], { type: 'XLine' });
        } },
      { id: 'insert.between', label: t('cmd.insert.between'), keywords: 'insert between 間 box', category: 'insert', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpenInsertBetween },
      { id: 'insert.period-labels', label: t('cmd.insert.period-labels'), keywords: 'period label 時期ラベル', category: 'insert', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpenPeriodLabels },

      // === View ===
      { id: 'view.toggle-grid', label: t('cmd.view.toggle-grid', { state: view.showGrid ? 'OFF' : 'ON' }), keywords: 'grid toggle グリッド', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: toggleGrid },
      { id: 'view.toggle-snap', label: t('cmd.view.toggle-snap', { state: view.snapEnabled ? 'OFF' : 'ON' }), keywords: 'snap toggle スナップ', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: toggleSnap },
      { id: 'view.toggle-paper', label: t('cmd.view.toggle-paper', { state: view.showPaperGuides ? 'OFF' : 'ON' }), keywords: 'paper guide toggle 用紙枠', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: togglePaperGuides },
      { id: 'view.toggle-all-ids', label: t('cmd.view.toggle-all-ids'), keywords: 'id badge toggle ID', category: 'view',
        run: toggleAllIds },
      { id: 'view.toggle-box-ids', label: `Box ID: ${view.showBoxIds ? 'OFF' : 'ON'}`, keywords: 'box id badge', category: 'view',
        run: toggleBoxIds },
      { id: 'view.toggle-sdsg-ids', label: `SDSG ID: ${view.showSDSGIds ? 'OFF' : 'ON'}`, keywords: 'sdsg id badge', category: 'view',
        run: toggleSDSGIds },
      { id: 'view.toggle-line-ids', label: `Line ID: ${view.showLineIds ? 'OFF' : 'ON'}`, keywords: 'line id badge', category: 'view',
        run: toggleLineIds },
      { id: 'view.toggle-top-ruler', label: t('cmd.view.toggle-top-ruler', { state: view.showTopRuler ? 'OFF' : 'ON' }), keywords: 'top ruler 上ルーラー', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: toggleTopRuler },
      { id: 'view.toggle-left-ruler', label: t('cmd.view.toggle-left-ruler', { state: view.showLeftRuler ? 'OFF' : 'ON' }), keywords: 'left ruler 左ルーラー', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: toggleLeftRuler },
      { id: 'view.toggle-legend', label: t('cmd.view.toggle-legend', { state: view.showLegend ? 'OFF' : 'ON' }), keywords: 'legend toggle 凡例', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: toggleLegend },
      { id: 'view.fit-all', label: t('cmd.view.fit-all'), keywords: 'fit zoom view フィット', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => requestFit('all') },
      { id: 'view.fit-width', label: t('cmd.view.fit-width'), keywords: 'fit width 幅', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => requestFit('width') },
      { id: 'view.fit-height', label: t('cmd.view.fit-height'), keywords: 'fit height 高さ', category: 'view', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => requestFit('height') },

      // === Align ===
      { id: 'align.left', label: t('cmd.align.left'), keywords: 'align left 左揃え', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => alignBoxes('left') },
      { id: 'align.center-h', label: t('cmd.align.center-h'), keywords: 'align center horizontal 中央', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => alignBoxes('center-h') },
      { id: 'align.right', label: t('cmd.align.right'), keywords: 'align right 右揃え', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => alignBoxes('right') },
      { id: 'align.top', label: t('cmd.align.top'), keywords: 'align top 上揃え', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => alignBoxes('top') },
      { id: 'align.middle', label: t('cmd.align.middle'), keywords: 'align middle vertical 中央', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => alignBoxes('middle') },
      { id: 'align.bottom', label: t('cmd.align.bottom'), keywords: 'align bottom 下揃え', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => alignBoxes('bottom') },
      { id: 'align.distribute-h', label: t('cmd.align.distribute-h'), keywords: 'align distribute 等間隔', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => alignBoxes('distribute-h') },
      { id: 'align.match-w', label: t('cmd.align.match-w'), keywords: 'match width 幅 揃える', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => matchSize('width') },
      { id: 'align.match-h', label: t('cmd.align.match-h'), keywords: 'match height 高さ 揃える', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => matchSize('height') },
      { id: 'align.match-both', label: t('cmd.align.match-both'), keywords: 'match size サイズ 揃える', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => matchSize('both') },
      { id: 'align.match-fontsize', label: t('cmd.align.match-fontsize'), keywords: 'match font size 文字 揃える', category: 'align', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => {
          const ids = store().selection.boxIds;
          if (ids.length < 2) { alert(t('alert.selectTwoOrMore')); return; }
          store().matchBoxesFontSize(ids);
        } },

      // === Export ===
      { id: 'export.preview', label: t('cmd.export.preview'), keywords: 'export preview 出力 PNG SVG PDF PPTX', category: 'export', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpenExport },
      { id: 'export.paper-report', label: t('cmd.export.paper-report'), keywords: 'paper report 論文 レポート docx', category: 'export', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpenPaperReport },
      { id: 'tools.transcript', label: t('cmd.tools.transcript'), keywords: 'transcript interview 原文 インタビュー 逐語録 リンク', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpenTranscript },

      // === Tools / Settings ===
      { id: 'tools.settings', label: t('cmd.tools.settings'), keywords: 'settings preferences 設定', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings() },
      { id: 'tools.settings.general', label: t('cmd.tools.settings.general'), keywords: 'settings general 全体 レイアウト 言語', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('general') },
      { id: 'tools.settings.snap', label: t('cmd.tools.settings.snap'), keywords: 'settings snap スナップ', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('snap') },
      { id: 'tools.settings.boxstyle', label: t('cmd.tools.settings.boxstyle'), keywords: 'settings boxstyle Box プリセット', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('boxstyle') },
      { id: 'tools.settings.typelabel', label: t('cmd.tools.settings.typelabel'), keywords: 'settings typelabel タイプラベル', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('typelabel') },
      { id: 'tools.settings.timearrow', label: t('cmd.tools.settings.timearrow'), keywords: 'settings timearrow 時間 矢印', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('timearrow') },
      { id: 'tools.settings.period', label: t('cmd.tools.settings.period'), keywords: 'settings period 時期', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('period') },
      { id: 'tools.settings.legend', label: t('cmd.tools.settings.legend'), keywords: 'settings legend 凡例', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('legend') },
      { id: 'tools.settings.sdsgspace', label: t('cmd.tools.settings.sdsgspace'), keywords: 'settings sdsg 帯 band 配置', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('sdsgspace') },
      { id: 'tools.settings.project', label: t('cmd.tools.settings.project'), keywords: 'settings project プロジェクト メタデータ 既定値', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => callbacks.onOpenSettings('project') },
      { id: 'tools.csv-import', label: t('cmd.tools.csv-import'), keywords: 'csv import インポート', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpenCSVImport },
      { id: 'tools.shift-content', label: t('cmd.tools.shift-content'), keywords: 'shift content シフト', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpenShiftContent },
      { id: 'tools.resize', label: t('cmd.tools.resize'), keywords: 'resize リサイズ', category: 'tools', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: callbacks.onOpenResize },

      // === Help ===
      { id: 'help.about', label: t('cmd.help.about'), keywords: 'about version バージョン', category: 'help', // i18n-ok 検索用の語（日本語で引けるように残す）
        run: () => alert(t('about.message', { version: 'v0.2.6' })) },
    ];

    return cmds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.showGrid, view.snapEnabled, view.showPaperGuides, view.showBoxIds, view.showSDSGIds,
      view.showLineIds, view.showTopRuler, view.showLeftRuler, view.showLegend,
      callbacks, toggleGrid, toggleSnap, togglePaperGuides, toggleBoxIds, toggleSDSGIds, toggleLineIds,
      toggleAllIds, toggleTopRuler, toggleLeftRuler, toggleLegend, requestFit, t]);
}

// AlignButton (Ribbon.tsx) の整列ロジックを再現
function alignBoxes(type: 'left' | 'center-h' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-h') {
  const store = useTEMStore.getState();
  const ids = store.selection.boxIds;
  if (ids.length < 2) { alert(i18n.t('commandPalette:alert.selectTwoOrMore')); return; }
  const sheet = store.doc.sheets.find((s) => s.id === store.doc.activeSheetId);
  if (!sheet) return;
  const boxes = sheet.boxes.filter((b) => ids.includes(b.id));
  if (boxes.length < 2) return;
  const updateBox = store.updateBox;
  if (type === 'left') {
    const minX = Math.min(...boxes.map((b) => b.x));
    boxes.forEach((b) => updateBox(b.id, { x: minX }));
  } else if (type === 'right') {
    const maxR = Math.max(...boxes.map((b) => b.x + b.width));
    boxes.forEach((b) => updateBox(b.id, { x: maxR - b.width }));
  } else if (type === 'center-h') {
    const centers = boxes.map((b) => b.x + b.width / 2);
    const avg = centers.reduce((a, c) => a + c, 0) / centers.length;
    boxes.forEach((b) => updateBox(b.id, { x: avg - b.width / 2 }));
  } else if (type === 'top') {
    const minY = Math.min(...boxes.map((b) => b.y));
    boxes.forEach((b) => updateBox(b.id, { y: minY }));
  } else if (type === 'bottom') {
    const maxB = Math.max(...boxes.map((b) => b.y + b.height));
    boxes.forEach((b) => updateBox(b.id, { y: maxB - b.height }));
  } else if (type === 'middle') {
    const centers = boxes.map((b) => b.y + b.height / 2);
    const avg = centers.reduce((a, c) => a + c, 0) / centers.length;
    boxes.forEach((b) => updateBox(b.id, { y: avg - b.height / 2 }));
  } else if (type === 'distribute-h') {
    const sorted = [...boxes].sort((a, b) => a.x - b.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalWidth = last.x + last.width - first.x;
    const gaps = (totalWidth - sorted.reduce((acc, b) => acc + b.width, 0)) / (sorted.length - 1);
    let cur = first.x + first.width + gaps;
    sorted.forEach((b, i) => {
      if (i === 0 || i === sorted.length - 1) return;
      updateBox(b.id, { x: cur });
      cur += b.width + gaps;
    });
  }
}

function matchSize(mode: 'width' | 'height' | 'both') {
  const store = useTEMStore.getState();
  const ids = store.selection.boxIds;
  if (ids.length < 2) { alert(i18n.t('commandPalette:alert.selectTwoOrMore')); return; }
  store.matchBoxesSize(ids, mode);
}
