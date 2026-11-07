// OS ごとの表示の違い（2026-11-08）。Mac ではショートカットを ⌘ で表示する
// （以前は Mac でも「Ctrl+Z」と出ていた。キー操作の処理は Ctrl と ⌘ の両方を受け付けている）

/** Mac（iPad のキーボードを含む）か */
export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = nav.userAgentData?.platform || navigator.platform || navigator.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(p);
}

/**
 * ショートカットの表示。Windows 向けの書き方（"Ctrl+Shift+S" など）を渡すと、Mac では "⇧⌘S" にする。
 * mac を渡すと、Mac ではそちらを使う（例: やり直しは Windows "Ctrl+Y"・Mac "Ctrl+Shift+Z"）
 */
export function shortcutLabel(win: string, mac?: string, onMac: boolean = isMac()): string {
  if (!onMac) return win;
  return (mac ?? win)
    .replace(/Ctrl\+Shift\+/g, '⇧⌘')
    .replace(/Ctrl\+/g, '⌘')
    .replace(/Shift\+/g, '⇧')
    .replace(/Alt\+/g, '⌥');
}
