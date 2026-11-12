import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 等のサブパス配信に対応:
//   ビルド時に環境変数 VITE_BASE_PATH='/temer-plus/' のように指定
//   未指定なら '/' （開発サーバ・ルート配信向け）
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    // 端末から人が起動したときだけブラウザを開く。Claude の自動の確認・撮影（端末の無い背後での起動）で
    // ユーザーの Chrome にタブが増え続けたため（2026-11-12）。なお CLI の `--open false` は「false」という道を
    // 開いてしまうので使わない（開かないなら `--no-open`）
    open: Boolean(process.stdout.isTTY),
  },
});
