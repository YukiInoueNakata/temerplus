// ============================================================================
// Box スタイルテーマ
// - 複数 Box タイプの BoxTypePreset を 1 つのテーマに束ねる
// - 組み込みテーマとユーザテーマ（localStorage 永続化）
// - JSON エクスポート / インポート（単一 or 配列）
// ============================================================================

import type { BoxType, BoxTypePreset } from '../types';
import i18n from '../i18n';

export type BoxTypePresetMap = Partial<Record<BoxType, BoxTypePreset>>;

export interface BoxStyleTheme {
  id: string;
  name: string;
  description?: string;
  builtin?: boolean;
  presets: BoxTypePresetMap;
}

// 組み込みテーマ ----------------------------------------------------------------
// 名前と説明は画面の言語（翻訳の表 boxThemes）。読むたびに引くよう getter にしてある

export const BUILTIN_THEMES: BoxStyleTheme[] = [
  {
    id: 'theme-monochrome',
    get name() { return i18n.t('boxThemes:monochrome.name'); },
    get description() { return i18n.t('boxThemes:monochrome.description'); },
    builtin: true,
    presets: {
      normal:    { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.0, borderStyle: 'solid' },
      BFP:       { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'solid' },
      OPP:       { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 2.0, borderStyle: 'solid' },
      EFP:       { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'double' },
      'P-EFP':   { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'dashed' },
      '2nd-EFP': { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'double' },
      'P-2nd-EFP': { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'dashed' },
      annotation: { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.0, borderStyle: 'dashed' },
    },
  },
  {
    id: 'theme-academic',
    get name() { return i18n.t('boxThemes:academic.name'); },
    get description() { return i18n.t('boxThemes:academic.description'); },
    builtin: true,
    presets: {
      normal:    { backgroundColor: '#ffffff', borderColor: '#555555', color: '#222222' },
      BFP:       { backgroundColor: '#fff8e1', borderColor: '#f9a825', color: '#222222' },
      OPP:       { backgroundColor: '#e8eaf6', borderColor: '#3949ab', color: '#222222', borderWidth: 2.0 },
      EFP:       { backgroundColor: '#e8f5e9', borderColor: '#2e7d32', color: '#222222', borderStyle: 'double' },
      'P-EFP':   { backgroundColor: '#fce4ec', borderColor: '#c2185b', color: '#222222', borderStyle: 'dashed' },
      '2nd-EFP': { backgroundColor: '#e0f7fa', borderColor: '#00838f', color: '#222222', borderStyle: 'double' },
      'P-2nd-EFP': { backgroundColor: '#f3e5f5', borderColor: '#6a1b9a', color: '#222222', borderStyle: 'dashed' },
      annotation: { backgroundColor: '#fafafa', borderColor: '#9e9e9e', color: '#555555', borderStyle: 'dashed' },
    },
  },
  {
    id: 'theme-colorful',
    get name() { return i18n.t('boxThemes:colorful.name'); },
    get description() { return i18n.t('boxThemes:colorful.description'); },
    builtin: true,
    presets: {
      normal:    { backgroundColor: '#f5f5f5', borderColor: '#424242', color: '#212121' },
      BFP:       { backgroundColor: '#ffe082', borderColor: '#f57f17', color: '#212121', borderWidth: 1.5 },
      OPP:       { backgroundColor: '#90caf9', borderColor: '#0d47a1', color: '#0d47a1', borderWidth: 2.0 },
      EFP:       { backgroundColor: '#a5d6a7', borderColor: '#1b5e20', color: '#1b5e20', borderStyle: 'double' },
      'P-EFP':   { backgroundColor: '#f48fb1', borderColor: '#880e4f', color: '#880e4f', borderStyle: 'dashed' },
      '2nd-EFP': { backgroundColor: '#80deea', borderColor: '#006064', color: '#006064', borderStyle: 'double' },
      'P-2nd-EFP': { backgroundColor: '#ce93d8', borderColor: '#4a148c', color: '#4a148c', borderStyle: 'dashed' },
      annotation: { backgroundColor: '#fff3e0', borderColor: '#bdbdbd', color: '#616161', borderStyle: 'dashed' },
    },
  },
  {
    // 記号の簡素化方式（論文 04_report_format.md 補論）: 線種は実在性だけを表す。
    // 観察された経験（通常・BFP・EFP・OPP・2nd EFP・その他）は同じ実線、観察されなかった経験（潜在経験）は点線。
    // P-EFP・P-2nd EFP も点線（観察されなかった側。2026-10-30 ユーザー決定）。種別は種別ラベル（自動採番）で示す
    id: 'theme-simplified-reality',
    get name() { return i18n.t('boxThemes:simplified.name'); },
    get description() { return i18n.t('boxThemes:simplified.description'); },
    builtin: true,
    presets: {
      normal:      { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'solid' },
      other:       { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'solid' },
      BFP:         { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'solid' },
      OPP:         { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'solid' },
      EFP:         { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'solid' },
      '2nd-EFP':   { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'solid' },
      'P-EFP':     { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'dashed', singleLine: true },
      'P-2nd-EFP': { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'dashed', singleLine: true },
      annotation:  { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'dashed' },
    },
  },
  {
    id: 'theme-paper-bold',
    get name() { return i18n.t('boxThemes:paperBold.name'); },
    get description() { return i18n.t('boxThemes:paperBold.description'); },
    builtin: true,
    presets: {
      normal:    { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'solid' },
      BFP:       { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 2.0, borderStyle: 'solid' },
      OPP:       { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 3.0, borderStyle: 'solid' },
      EFP:       { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 2.0, borderStyle: 'double' },
      'P-EFP':   { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 2.0, borderStyle: 'dashed' },
      '2nd-EFP': { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 2.0, borderStyle: 'double' },
      'P-2nd-EFP': { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 2.0, borderStyle: 'dashed' },
      annotation: { backgroundColor: '#ffffff', borderColor: '#000000', color: '#000000', borderWidth: 1.5, borderStyle: 'dashed' },
    },
  },
];

// ユーザテーマ永続化 -----------------------------------------------------------

const STORAGE_KEY = 'temer:box-style-themes';

export function loadUserThemes(): BoxStyleTheme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeTheme)
      .filter((t): t is BoxStyleTheme => t !== null && !t.builtin);
  } catch {
    return [];
  }
}

function writeUserThemes(themes: BoxStyleTheme[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {
    // 容量上限など。失敗しても継続
  }
}

export function saveUserTheme(name: string, presets: BoxTypePresetMap, description?: string): BoxStyleTheme {
  const themes = loadUserThemes();
  const id = `theme-user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const theme: BoxStyleTheme = {
    id,
    name: name.trim() || i18n.t('boxThemes:user.defaultName', { n: themes.length + 1 }),
    description,
    builtin: false,
    presets: cloneAndSanitizePresets(presets),
  };
  writeUserThemes([...themes, theme]);
  return theme;
}

export function updateUserTheme(id: string, name: string, presets: BoxTypePresetMap, description?: string): BoxStyleTheme | null {
  const themes = loadUserThemes();
  const idx = themes.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const updated: BoxStyleTheme = {
    ...themes[idx],
    name: name.trim() || themes[idx].name,
    description,
    presets: cloneAndSanitizePresets(presets),
  };
  themes[idx] = updated;
  writeUserThemes(themes);
  return updated;
}

export function deleteUserTheme(id: string): void {
  const themes = loadUserThemes().filter((t) => t.id !== id);
  writeUserThemes(themes);
}

// sanitize ---------------------------------------------------------------------

const VALID_BOX_TYPES: BoxType[] = ['normal', 'BFP', 'OPP', 'EFP', '2nd-EFP', 'P-EFP', 'P-2nd-EFP', 'annotation', 'other'];
const VALID_BORDER_STYLE = new Set(['solid', 'double', 'dashed', 'dotted']);
const VALID_SHAPE = new Set(['rect', 'ellipse']);

function clampNum(v: unknown, min: number, max: number): number | undefined {
  if (typeof v !== 'number' || !Number.isFinite(v)) return undefined;
  return Math.max(min, Math.min(max, v));
}

function sanitizePreset(input: unknown): BoxTypePreset | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const out: BoxTypePreset = {};
  if (typeof raw.borderStyle === 'string' && VALID_BORDER_STYLE.has(raw.borderStyle)) {
    out.borderStyle = raw.borderStyle as BoxTypePreset['borderStyle'];
  }
  const bw = clampNum(raw.borderWidth, 0, 20);
  if (bw !== undefined) out.borderWidth = bw;
  if (typeof raw.shape === 'string' && VALID_SHAPE.has(raw.shape)) {
    out.shape = raw.shape as BoxTypePreset['shape'];
  }
  for (const key of [
    'backgroundColor', 'borderColor', 'color', 'fontFamily',
    'typeLabelColor', 'typeLabelBackgroundColor', 'typeLabelBorderColor',
    'subLabelColor', 'subLabelBackgroundColor', 'subLabelBorderColor',
  ] as const) {
    if (typeof raw[key] === 'string') (out as Record<string, unknown>)[key] = raw[key];
  }
  const fs = clampNum(raw.fontSize, 4, 80);
  if (fs !== undefined) out.fontSize = fs;
  if (typeof raw.bold === 'boolean') out.bold = raw.bold;
  if (typeof raw.italic === 'boolean') out.italic = raw.italic;
  if (raw.singleLine === true) out.singleLine = true;
  const tlbw = clampNum(raw.typeLabelBorderWidth, 0, 10);
  if (tlbw !== undefined) out.typeLabelBorderWidth = tlbw;
  const slbw = clampNum(raw.subLabelBorderWidth, 0, 10);
  if (slbw !== undefined) out.subLabelBorderWidth = slbw;
  return out;
}

function cloneAndSanitizePresets(input: BoxTypePresetMap | unknown): BoxTypePresetMap {
  const out: BoxTypePresetMap = {};
  if (!input || typeof input !== 'object') return out;
  const src = input as Record<string, unknown>;
  for (const t of VALID_BOX_TYPES) {
    const sanitized = sanitizePreset(src[t]);
    if (sanitized && Object.keys(sanitized).length > 0) out[t] = sanitized;
  }
  return out;
}

export function sanitizeTheme(input: unknown): BoxStyleTheme | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : `theme-imported-${Date.now().toString(36)}`;
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : i18n.t('boxThemes:imported.name');
  const description = typeof raw.description === 'string' ? raw.description : undefined;
  const presets = cloneAndSanitizePresets(raw.presets);
  return { id, name, description, builtin: false, presets };
}

// JSON シリアライズ ------------------------------------------------------------

export interface ThemeFileFormat {
  format: 'temer-box-style-theme';
  version: 1;
  themes: Array<Pick<BoxStyleTheme, 'name' | 'description' | 'presets'>>;
}

export function themeToJsonString(theme: BoxStyleTheme): string {
  const file: ThemeFileFormat = {
    format: 'temer-box-style-theme',
    version: 1,
    themes: [{ name: theme.name, description: theme.description, presets: theme.presets }],
  };
  return JSON.stringify(file, null, 2);
}

export function themesToJsonString(themes: BoxStyleTheme[]): string {
  const file: ThemeFileFormat = {
    format: 'temer-box-style-theme',
    version: 1,
    themes: themes.map((t) => ({ name: t.name, description: t.description, presets: t.presets })),
  };
  return JSON.stringify(file, null, 2);
}

/**
 * JSON 文字列からテーマを取り出す。
 * - { format: 'temer-box-style-theme', themes: [...] } 形式
 * - 単体テーマ（{ name, presets } 直書き）も互換受け入れ
 * - presets だけの { normal: {...}, BFP: {...} } も互換受け入れ（無名テーマとして扱う）
 */
export function parseThemesFromJson(text: string): BoxStyleTheme[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== 'object') return [];
  const obj = parsed as Record<string, unknown>;

  // 形式 1: { format, themes: [...] }
  if (obj.format === 'temer-box-style-theme' && Array.isArray(obj.themes)) {
    return obj.themes
      .map(sanitizeTheme)
      .filter((t): t is BoxStyleTheme => t !== null);
  }

  // 形式 2: 単体テーマ
  if (typeof obj.name === 'string' && obj.presets) {
    const t = sanitizeTheme(obj);
    return t ? [t] : [];
  }

  // 形式 3: presets 直書き
  if (Object.keys(obj).some((k) => (VALID_BOX_TYPES as string[]).includes(k))) {
    const presets = cloneAndSanitizePresets(obj);
    if (Object.keys(presets).length > 0) {
      return [{
        id: `theme-imported-${Date.now().toString(36)}`,
        name: i18n.t('boxThemes:imported.name'),
        builtin: false,
        presets,
      }];
    }
  }

  return [];
}
