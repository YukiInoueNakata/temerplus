// 組み立て済みのファイル（release/web）が今の版で作られているか（2026-11-13 ユーザー決定）。
// Zenodo の写しだけで、組み立てずに TEMerPlus を動かせるようにするため、版ごとに release/web を作り直してコミットする
// （手順は docs/build-from-archive.ja.md）。版を上げて作り直しを忘れると、このテストが落ちる。
// 作り直し: webApp で `npm run build:archive`
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), '..', 'release', 'web');
const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { version: string };

describe('組み立て済みのファイル（release/web）', () => {
  it('index.html があり、読み込みは相対のパス（どこに置いても動く）', () => {
    expect(existsSync(join(root, 'index.html'))).toBe(true);
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toMatch(/src="\.\/assets\//);
    expect(html).not.toMatch(/src="\/(?!\/)/);
  });
  it(`今の版（package.json の版）で作られている。落ちたら webApp で npm run build:archive`, () => {
    const assets = readdirSync(join(root, 'assets')).filter((f) => f.endsWith('.js'));
    const hit = assets.some((f) => readFileSync(join(root, 'assets', f), 'utf8').includes(`v${pkg.version}`));
    expect(hit).toBe(true);
  });
});
