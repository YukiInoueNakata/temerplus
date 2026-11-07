// ショートカットの表示（2026-11-08: Mac では ⌘ で出す）
import { describe, it, expect } from 'vitest';
import { shortcutLabel } from './platform';

describe('shortcutLabel', () => {
  it('Windows ではそのまま', () => {
    expect(shortcutLabel('Ctrl+Z', undefined, false)).toBe('Ctrl+Z');
    expect(shortcutLabel('Ctrl+Y', 'Ctrl+Shift+Z', false)).toBe('Ctrl+Y');
  });
  it('Mac では ⌘・⇧ で出し、Mac 用の別のキーがあればそれを使う', () => {
    expect(shortcutLabel('Ctrl+Z', undefined, true)).toBe('⌘Z');
    expect(shortcutLabel('Ctrl+Shift+S', undefined, true)).toBe('⇧⌘S');
    expect(shortcutLabel('Ctrl+Y', 'Ctrl+Shift+Z', true)).toBe('⇧⌘Z');
    expect(shortcutLabel('Ctrl+', undefined, true)).toBe('⌘');
  });
});
