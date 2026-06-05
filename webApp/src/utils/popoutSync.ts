// ============================================================================
// popoutSync - メイン Window と popout Window 間の doc 同期
//
// 同一 origin の別 window 間で BroadcastChannel を使い、片方の doc 変更を
// もう片方に反映する。同期ループ防止のためフラグで適用中は再ブロードキャスト
// しないようにする。
//
// 使い方:
//   1. main.tsx か App の起動時に initPopoutSync(store) を呼ぶ
//   2. store の doc 変更を broadcast し、受信時に store.loadDocument を呼ぶ
//   3. URL に ?popout=transcript-viewer があれば popout モードと判定
// ============================================================================

import type { StoreApi } from 'zustand';
import type { TEMDocument } from '../types';

const CHANNEL_NAME = 'temer-popout-sync';

type DocSlice = {
  doc: TEMDocument;
  loadDocument: (doc: TEMDocument) => void;
};

interface SyncMessage {
  type: 'doc-update';
  senderId: string;
  doc: TEMDocument;
}

interface PopoutSync {
  dispose: () => void;
}

// このウィンドウの ID (起動ごとにランダム)
const WINDOW_ID = Math.random().toString(36).slice(2, 12);

let isApplyingRemote = false;

export function initPopoutSync<S extends DocSlice>(store: StoreApi<S>): PopoutSync | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  const channel = new BroadcastChannel(CHANNEL_NAME);

  // 受信: 他ウィンドウからの doc 更新を反映
  channel.onmessage = (event: MessageEvent<SyncMessage>) => {
    const msg = event.data;
    if (!msg || msg.type !== 'doc-update') return;
    if (msg.senderId === WINDOW_ID) return;
    isApplyingRemote = true;
    try {
      store.getState().loadDocument(msg.doc);
    } finally {
      // 適用フラグはマイクロタスク後に解除して、適用に伴う subscribe コールバックが
      // 再ブロードキャストするのを防ぐ
      queueMicrotask(() => { isApplyingRemote = false; });
    }
  };

  // 送信: 自ウィンドウの doc 変更を他ウィンドウに通知
  // ただし isApplyingRemote 中は再送しない
  const unsubscribe = store.subscribe((state, prev) => {
    if (isApplyingRemote) return;
    if (state.doc === prev?.doc) return;
    try {
      channel.postMessage({
        type: 'doc-update',
        senderId: WINDOW_ID,
        doc: state.doc,
      } satisfies SyncMessage);
    } catch (e) {
      // postMessage が clone できないケース (関数等を含む場合) を防ぐ
      console.warn('[popoutSync] postMessage failed:', e);
    }
  });

  return {
    dispose: () => {
      unsubscribe();
      channel.close();
    },
  };
}

export function getPopoutQueryParam(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('popout');
}

export function isPopoutWindow(): boolean {
  return getPopoutQueryParam() !== null;
}
