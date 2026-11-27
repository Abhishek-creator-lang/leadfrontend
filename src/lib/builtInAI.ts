/**
 * Chrome's built-in AI (Gemini Nano, Prompt API). The model runs on the user's device, so it costs
 * us nothing and no answer leaves the browser. Supports the current global `LanguageModel` API and
 * the older `window.ai.languageModel` shape. Everywhere else `getAvailability` returns
 * 'unavailable' and the UI renders nothing.
 */

export type AIAvailability = 'available' | 'downloadable' | 'unavailable';

interface PromptSession {
  promptStreaming(input: string): ReadableStream<string> | AsyncIterable<string>;
  destroy(): void;
}

interface LanguageModelStatic {
  availability(options?: object): Promise<string>;
  create(options?: object): Promise<PromptSession>;
}

interface LegacyLanguageModel {
  capabilities(): Promise<{ available: 'readily' | 'after-download' | 'no' }>;
  create(options?: { systemPrompt?: string }): Promise<PromptSession>;
}

const modern = (): LanguageModelStatic | undefined =>
  (globalThis as unknown as { LanguageModel?: LanguageModelStatic }).LanguageModel;

const legacy = (): LegacyLanguageModel | undefined =>
  typeof window !== 'undefined'
    ? (window as unknown as { ai?: { languageModel?: LegacyLanguageModel } }).ai?.languageModel
    : undefined;

const LANG = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

export async function getAvailability(): Promise<AIAvailability> {
  try {
    const lm = modern();
    if (lm) {
      const a = await lm.availability(LANG);
      if (a === 'available') return 'available';
      if (a === 'downloadable' || a === 'downloading') return 'downloadable';
      return 'unavailable';
    }
    const old = legacy();
    if (old) {
      const { available } = await old.capabilities();
      if (available === 'readily') return 'available';
      if (available === 'after-download') return 'downloadable';
    }
  } catch {
    // treat any error as "not supported"
  }
  return 'unavailable';
}

/**
 * Streams the model's answer. `onChunk` receives the full text so far. Must be called from a user
 * gesture the first time (Chrome requires it before downloading the model).
 */
export async function promptStream(
  system: string,
  input: string,
  onChunk: (textSoFar: string) => void,
  onDownloadProgress?: (fraction: number) => void
): Promise<string> {
  const lm = modern();
  const session: PromptSession = lm
    ? await lm.create({
        ...LANG,
        initialPrompts: [{ role: 'system', content: system }],
        monitor(m: EventTarget) {
          m.addEventListener('downloadprogress', (e) =>
            onDownloadProgress?.((e as unknown as { loaded: number }).loaded)
          );
        },
      })
    : await legacy()!.create({ systemPrompt: system });

  try {
    let text = '';
    const stream = session.promptStreaming(input);
    const iterable: AsyncIterable<string> =
      Symbol.asyncIterator in stream
        ? (stream as AsyncIterable<string>)
        : readAll(stream as ReadableStream<string>);
    for await (const chunk of iterable) {
      // Early Chrome versions sent the whole text so far; current ones send deltas.
      text = chunk.startsWith(text) && text ? chunk : text + chunk;
      onChunk(text);
    }
    return text;
  } finally {
    session.destroy();
  }
}

/**
 * One prompt with a time limit. Undefined when the model is missing, fails or is too slow: callers
 * fall back to their scripted behaviour.
 */
export async function promptWithTimeout(
  system: string,
  input: string,
  timeoutMs: number
): Promise<string | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promptStream(system, input, () => {}),
      new Promise<undefined>((resolve) => {
        timer = setTimeout(() => resolve(undefined), timeoutMs);
      }),
    ]);
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Downloads Chrome's on-device model (once per browser) by opening and closing a session.
 * `onProgress` gets 0–1. Must be called from a click: Chrome requires a user action before it
 * starts the download. Resolves true when the model is ready.
 */
export async function prepareChromeModel(onProgress: (fraction: number) => void): Promise<boolean> {
  try {
    const lm = modern();
    const session: PromptSession = lm
      ? await lm.create({
          ...LANG,
          monitor(m: EventTarget) {
            m.addEventListener('downloadprogress', (e) =>
              onProgress((e as unknown as { loaded: number }).loaded)
            );
          },
        })
      : await legacy()!.create({});
    session.destroy();
    onProgress(1);
    return (await getAvailability()) === 'available';
  } catch {
    return false;
  }
}

async function* readAll(stream: ReadableStream<string>) {
  const reader = stream.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
