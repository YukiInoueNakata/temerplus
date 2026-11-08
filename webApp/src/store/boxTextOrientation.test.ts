// 英語などの図では、横型でも Box の文字を横書きにする（2026-11-08。縦書きだと 1 字ずつ縦に積まれて読めなかった）
import { describe, it, expect, afterEach } from 'vitest';
import { useTEMStore } from './store';
import { usesVerticalBoxText } from './defaults';

const st = () => useTEMStore.getState();
const box = (id: string) => st().doc.sheets.find((s) => s.id === st().doc.activeSheetId)!.boxes.find((b) => b.id === id)!;
afterEach(() => { st().resetDocument(); });

describe('Box の文字の向き', () => {
  it('縦書きにするのは横型の日本語・中国語の図だけ', () => {
    expect(usesVerticalBoxText('horizontal', 'ja')).toBe(true);
    expect(usesVerticalBoxText('horizontal', 'en')).toBe(false);
    expect(usesVerticalBoxText('vertical', 'ja')).toBe(false);
  });
  it('英語の図で足した Box は横書き・横長', () => {
    st().setLocale('en');
    const id = st().addBox({ type: 'normal' });
    const b = box(id);
    expect(b.textOrientation).toBe('horizontal');
    expect(b.width).toBeGreaterThan(b.height);
  });
  it('英語の図で横型 → 縦型 → 横型と切り替えても、大きさと位置が戻り横書きのまま', () => {
    st().setLocale('en');
    const id = st().addBox({ type: 'normal', x: 300, y: 50 });
    const before = { ...box(id) };
    st().setLayout('vertical');
    expect(box(id).textOrientation).toBe('horizontal');
    expect([box(id).width, box(id).height]).toEqual([before.width, before.height]);
    st().setLayout('horizontal');
    expect(box(id)).toMatchObject({ x: before.x, y: before.y, width: before.width, height: before.height, textOrientation: 'horizontal' });
  });
});
