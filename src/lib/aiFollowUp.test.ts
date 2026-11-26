import { afterEach, describe, expect, it, vi } from 'vitest';
import { aiDesignFollowUp, cleanFollowUp } from './aiFollowUp';

const g = globalThis as Record<string, unknown>;

const fakeModel = (reply: string, delayMs = 0) => ({
  availability: async () => 'available',
  create: async () => ({
    promptStreaming: () =>
      new ReadableStream<string>({
        async start(c) {
          if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
          c.enqueue(reply);
          c.close();
        },
      }),
    destroy: () => {},
  }),
});

afterEach(() => {
  delete g.LanguageModel;
  vi.useRealTimers();
});

describe('cleanFollowUp', () => {
  it.each([
    [
      'How would you paginate the feed on a slow 3G connection?',
      'How would you paginate the feed on a slow 3G connection?',
    ],
    [
      '**Question:** "What happens when a post is deleted while visible?"\nExtra text',
      'What happens when a post is deleted while visible?',
    ],
    ['Great answer! You covered everything.', undefined],
    ['Why?', undefined],
  ])('%j → %j', (raw, expected) => {
    expect(cleanFollowUp(raw)).toBe(expected);
  });
});

describe('aiDesignFollowUp', () => {
  const input = {
    problem: 'News Feed',
    step: 'API',
    keyPoints: ['Pagination'],
    answer: 'REST endpoints',
  };

  it('returns the on-device model’s question', async () => {
    g.LanguageModel = fakeModel('How would you paginate without duplicates?');
    expect(await aiDesignFollowUp(input)).toBe('How would you paginate without duplicates?');
  });

  it('gives up quietly when the model is too slow', async () => {
    g.LanguageModel = fakeModel('Too late?', 200);
    expect(await aiDesignFollowUp(input, 50)).toBeUndefined();
  });

  it('gives up quietly when there is no model', async () => {
    expect(await aiDesignFollowUp(input)).toBeUndefined();
  });
});
