import { describe, expect, it } from 'vitest';
import { mockSummarize } from './ai.js';

describe('mockSummarize', () => {
  it('returns offline summary without API key', async () => {
    const result = mockSummarize('Sprint planning with design and backend tasks');
    expect(result).toContain('[Offline mock summary]');
    expect(result).toContain('Sprint');
  });

  it('handles empty input', () => {
    expect(mockSummarize('   ')).toContain('0 words');
  });
});
