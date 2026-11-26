import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAvailability, promptStream } from './builtInAI';

const g = globalThis as Record<string, unknown>;

afterEach(() => {
  delete g.LanguageModel;
  delete g.window;
  vi.restoreAllMocks();
});

const streamOf = (chunks: string[]) =>
  new ReadableStream<string>({
    start(c) {
      chunks.forEach((x) => c.enqueue(x));
      c.close();
    },
  });

describe('getAvailability', () => {
  it('is unavailable when the browser has no built-in AI', async () => {
    expect(await getAvailability()).toBe('unavailable');
  });

  it.each([
    ['available', 'available'],
    ['downloadable', 'downloadable'],
    ['downloading', 'downloadable'],
    ['unavailable', 'unavailable'],
  ])('maps LanguageModel.availability() %s → %s', async (raw, expected) => {
    g.LanguageModel = { availability: async () => raw, create: vi.fn() };
    expect(await getAvailability()).toBe(expected);
  });

  it('supports the older window.ai.languageModel API', async () => {
    g.window = { ai: { languageModel: { capabilities: async () => ({ available: 'readily' }) } } };
    expect(await getAvailability()).toBe('available');
  });

  it('treats errors as unavailable', async () => {
    g.LanguageModel = { availability: async () => Promise.reject(new Error('x')), create: vi.fn() };
    expect(await getAvailability()).toBe('unavailable');
  });
});

describe('promptStream', () => {
  it('joins delta chunks, passes the system prompt and destroys the session', async () => {
    const destroy = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const create = vi.fn(async (_options: object) => ({
      promptStreaming: () => streamOf(['Good ', 'answer', '.']),
      destroy,
    }));
    g.LanguageModel = { availability: async () => 'available', create };
    const seen: string[] = [];
    const text = await promptStream('SYS', 'Q', (t) => seen.push(t));
    expect(text).toBe('Good answer.');
    expect(seen.at(-1)).toBe('Good answer.');
    expect(create.mock.calls[0][0]).toMatchObject({
      initialPrompts: [{ role: 'system', content: 'SYS' }],
    });
    expect(destroy).toHaveBeenCalled();
  });

  it('handles older cumulative chunks from the legacy API', async () => {
    g.window = {
      ai: {
        languageModel: {
          create: async () => ({
            promptStreaming: () => streamOf(['Good', 'Good answer', 'Good answer.']),
            destroy: () => {},
          }),
        },
      },
    };
    expect(await promptStream('SYS', 'Q', () => {})).toBe('Good answer.');
  });
});
