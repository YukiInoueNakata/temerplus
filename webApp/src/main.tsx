import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import { useTEMStore } from './store/store';
import i18n from './i18n';
import { ErrorBoundary } from './components/ErrorBoundary';

// 起動時に store の locale を i18next に反映（永続化された .tem ファイルが
// 既にロード済みの場合、その locale が i18next の言語を上書きする）
const initialLocale = useTEMStore.getState().doc.settings.locale;
if (initialLocale && initialLocale !== i18n.language) {
  void i18n.changeLanguage(initialLocale);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      label="App"
      fallback={(err) => (
        <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 720, margin: '40px auto' }}>
          <h2 style={{ color: '#c00' }}>予期しないエラーが発生しました</h2>
          <p style={{ fontSize: 14 }}>
            アプリの描画中にエラーが発生しました。ページを再読み込みすると復帰できる場合があります。
            console に詳細なスタックトレースが出ています。
          </p>
          <pre style={{ background: '#f8f8f8', padding: 12, fontSize: 12, whiteSpace: 'pre-wrap', borderRadius: 4 }}>
            {String(err.message)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '6px 14px', fontSize: 14, cursor: 'pointer' }}
          >
            再読み込み
          </button>
        </div>
      )}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
