import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 画面の言語は i18n.ts が利用者の好み（uiLanguage.ts）から決める。図の settings.locale には結びつけない
import './i18n';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CrashScreen } from './components/CrashScreen';

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
