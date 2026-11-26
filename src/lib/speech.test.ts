// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listen, speechSupport } from './speech';

type Handler = ((e: unknown) => void) | null;

class FakeRecognition {
  static last: FakeRecognition;
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: Handler = null;
  onerror: Handler = null;
  onend: (() => void) | null = null;
  starts = 0;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {
    this.starts++;
  }
  stop() {}
  abort() {}
  emit(text: string, isFinal: boolean) {
    this.onresult?.({ resultIndex: 0, results: [{ isFinal, 0: { transcript: text } }] });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  (window as unknown as Record<string, unknown>).webkitSpeechRecognition = FakeRecognition;
});
afterEach(() => {
  vi.useRealTimers();
  delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
});

describe('listen', () => {
  it('reports support', () => {
    expect(speechSupport().listen).toBe(true);
  });

  it('shows live captions and delivers the answer after a pause', () => {
    const onInterim = vi.fn();
    const onDone = vi.fn();
    listen({ onInterim, onDone, pauseMs: 2000 });
    const r = FakeRecognition.last;
    r.emit('a closure', false);
    expect(onInterim).toHaveBeenLastCalledWith('a closure');
    vi.advanceTimersByTime(1500);
    r.emit('a closure keeps scope', true);
    vi.advanceTimersByTime(1999);
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDone).toHaveBeenCalledWith('a closure keeps scope');
  });

  it('restarts when the browser ends recognition on its own', () => {
    listen({ onInterim: () => {}, onDone: () => {} });
    const r = FakeRecognition.last;
    r.onend?.();
    expect(r.starts).toBe(2);
  });

  it('reports a blocked microphone', () => {
    const onError = vi.fn();
    const onDone = vi.fn();
    listen({ onInterim: () => {}, onDone, onError });
    FakeRecognition.last.onerror?.({ error: 'not-allowed' });
    expect(onError).toHaveBeenCalledWith('not-allowed');
    expect(onDone).not.toHaveBeenCalled();
  });

  it('can be finished early', () => {
    const onDone = vi.fn();
    const l = listen({ onInterim: () => {}, onDone });
    FakeRecognition.last.emit('I am done', true);
    l.finish();
    expect(onDone).toHaveBeenCalledWith('I am done');
  });
});
