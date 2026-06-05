// ============================================================================
// docx パーサ (mammoth)
// - mammoth で <p> 要素ごとにテキストを抽出
// - 段落先頭の太字 + コロン (例: <b>A:</b> 発言) を speaker として検出
// - plain text fallback も用意
// ============================================================================

import { detectSpeaker } from './speaker';
import { genParagraphId } from '../../store/defaults';
import type { Paragraph } from '../../types';

/**
 * docx の ArrayBuffer を Paragraph[] に変換する。
 */
export async function parseDocx(buffer: ArrayBuffer): Promise<Paragraph[]> {
  const mammoth = await import('mammoth');
  // 1. HTML 抽出: <strong>A:</strong> 発言 のように太字話者が見える
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const html = htmlResult.value ?? '';
  const paras = extractParagraphsFromHtml(html);
  if (paras.length > 0) return paras;

  // 2. fallback: plain text のみ取得し、空行で段落分割
  const textResult = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = textResult.value ?? '';
  return splitPlainText(text);
}

/**
 * mammoth が生成した HTML から段落配列を抽出する。
 * <p> ごとに 1 段落。先頭が <strong>X:</strong> や <b>X:</b> なら speaker = X。
 */
function extractParagraphsFromHtml(html: string): Paragraph[] {
  // <p>...</p> を順に拾う
  const pMatches = html.match(/<p[^>]*>[\s\S]*?<\/p>/g) ?? [];
  const result: Paragraph[] = [];
  let index = 0;
  for (const block of pMatches) {
    const inner = block.replace(/^<p[^>]*>/, '').replace(/<\/p>$/, '');
    // 先頭の太字話者検出: <strong>...</strong> または <b>...</b> + コロン
    let speaker: string | undefined;
    let body = inner;
    const boldRe = /^\s*<(?:strong|b)>([^<]{1,12})<\/(?:strong|b)>\s*[:：]?\s*/;
    const m = boldRe.exec(inner);
    if (m) {
      const candidate = m[1].replace(/[:：]\s*$/, '').trim();
      if (candidate.length > 0 && candidate.length <= 12) {
        speaker = candidate;
        body = inner.slice(m[0].length);
      }
    }
    // HTML タグを除去して plain text 化
    const text = stripHtml(body).trim();
    if (text.length === 0 && !speaker) continue;
    // 太字話者検出がない場合は detectSpeaker でテキストパターンを試す
    if (!speaker) {
      const d = detectSpeaker(text);
      if (d.speaker) {
        result.push({ id: genParagraphId(), index, speaker: d.speaker, text: d.text });
        index++;
        continue;
      }
    }
    result.push({ id: genParagraphId(), index, speaker, text });
    index++;
  }
  return result;
}

function stripHtml(html: string): string {
  // タグを除去、エンティティを最低限デコード
  const noTags = html.replace(/<[^>]+>/g, '');
  return noTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function splitPlainText(text: string): Paragraph[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  // 段落分割できなければ行単位
  const units = blocks.length > 1 ? blocks : normalized.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  return units.map((line, i) => {
    const { speaker, text: body } = detectSpeaker(line);
    return { id: genParagraphId(), index: i, speaker, text: body };
  });
}
