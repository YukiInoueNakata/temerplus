import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import { useTEMStore } from './store/store';
import i18n from './i18n';

// 起動時に store の locale を i18next に反映（永続化された .tem ファイルが
// 既にロード済みの場合、その locale が i18next の言語を上書きする）
const initialLocale = useTEMStore.getState().doc.settings.locale;
if (initialLocale && initialLocale !== i18n.language) {
  void i18n.changeLanguage(initialLocale);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
