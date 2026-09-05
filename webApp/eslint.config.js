// ESLint 設定（flat config）
//
// 目的は網羅的な lint ではなく、React のフック規約違反を機械的に止めること。
// 早期 return より後ろにフックがある並びは、条件次第で
// React error #310 (Rendered more hooks than during the previous render) を
// 起こして白画面に落ちる（2026-09-05 に出力プレビューで実際に発生）。
//
// スタイル系・型系のルールは入れない（型は tsc、書式はレビューで見る）。
// ルールを増やすと警告に埋もれて gate として機能しなくなるため。
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/**', '*.config.js', '*.config.ts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    // @typescript-eslint はルール定義の解決用（既存コードの
    // eslint-disable コメントが参照するため）。プリセットは入れない
    plugins: { 'react-hooks': reactHooks, '@typescript-eslint': tseslint.plugin },
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: {
      // 本設定の主目的: 条件付きフック / 早期 return より後のフックを止める
      'react-hooks/rules-of-hooks': 'error',
      // 既存コードで大量に出るため当面 off（依存配列の見直しは別途）
      'react-hooks/exhaustive-deps': 'off',
    },
  },
);
