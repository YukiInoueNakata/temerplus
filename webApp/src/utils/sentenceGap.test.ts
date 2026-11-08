import { describe, it, expect } from 'vitest';
import { sentenceGap } from './sentenceGap';

describe('sentenceGap', () => {
  it('日本語は詰め、英語は空白 1 つ', () => {
    expect(sentenceGap('ja')).toBe('');
    expect(sentenceGap('en')).toBe(' ');
  });
});
