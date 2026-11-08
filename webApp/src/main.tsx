import React from 'react';
import ReactDOM from 'react-dom/client';
// 画面の言語は i18n.ts が利用者の好み（uiLanguage.ts）から決める。図の settings.locale には結びつけない
import i18n from './i18n';
import { settleUILanguage, type UILanguage } from './utils/uiLanguage';
import { hasAutoBackup } from './utils/fileIO';

// 画面の言語を確定してからアプリを読み込む（ストアは読み込んだ時点で、そのときの画面の言語で空の図を作るため。
// 先に読み込むと、言語を日本語に直しても空の図だけ英語で残る。2026-11-08）
async function start(): Promise<void> {
  try {
    const lang = await settleUILanguage(i18n.language as UILanguage, hasAutoBackup);
    if (lang !== i18n.language) await i18n.changeLanguage(lang);
  } catch { /* 言語を確定できなくても、仮の言語のまま起動する */ }
  // CrashScreen もストアを読み込むので、App と一緒に後から読み込む
  const [{ default: App }, { ErrorBoundary }, { CrashScreen }] = await Promise.all([
    import('./App'), import('./components/ErrorBoundary'), import('./components/CrashScreen'),
  ]);
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary
        label="App"
        fallback={(err, info) => <CrashScreen error={err} info={info} />}
      >
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
void start();
