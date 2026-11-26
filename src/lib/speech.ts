/**
 * Browser speech for the live interviewer: speaking (speechSynthesis, every modern browser) and
 * listening (SpeechRecognition: Chrome, Edge, Safari). Free; nothing goes through our servers.
 * Note: Chrome's recognition is done by Google's speech service, which the lobby discloses.
 */

interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionCtor = new () => Recognition;

const recognitionCtor = (): RecognitionCtor | undefined => {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

export function speechSupport() {
  return {
    speak: typeof window !== 'undefined' && 'speechSynthesis' in window,
    listen: Boolean(recognitionCtor()),
  };
}

// ---- speaking ----

let voicePromise: Promise<SpeechSynthesisVoice | null> | null = null;

/** Best English voice: natural/online voices first, Indian English preferred. */
export function pickVoice(): Promise<SpeechSynthesisVoice | null> {
  if (!speechSupport().speak) return Promise.resolve(null);
  voicePromise ??= new Promise((resolve) => {
    const choose = () => {
      const voices = speechSynthesis
        .getVoices()
        .filter((v) => v.lang.toLowerCase().startsWith('en'));
      if (!voices.length) return null;
      const rank = (v: SpeechSynthesisVoice) =>
        (/natural|online|google|neural|premium|enhanced/i.test(v.name) ? 4 : 0) +
        (/en-in/i.test(v.lang) ? 2 : /en-(us|gb)/i.test(v.lang) ? 1 : 0) +
        (/male|ravi|prabhat|guy|david|daniel/i.test(v.name) ? 0.5 : 0);
      return [...voices].sort((a, b) => rank(b) - rank(a))[0];
    };
    const now = choose();
    if (now) return resolve(now);
    const timer = window.setTimeout(() => resolve(choose()), 1500);
    speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        window.clearTimeout(timer);
        resolve(choose());
      },
      { once: true }
    );
  });
  return voicePromise;
}

/** Speaks one line. Resolves when it ends (or is cancelled). */
export async function speak(text: string, opts: { rate?: number } = {}): Promise<void> {
  if (!speechSupport().speak) return;
  const voice = await pickVoice();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-US';
    u.rate = opts.rate ?? 1;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (speechSupport().speak) speechSynthesis.cancel();
}

// ---- listening ----

export interface Listener {
  /** Stop and deliver what was heard so far (if anything). */
  finish(): void;
  /** Stop and drop what was heard. */
  cancel(): void;
}

/**
 * Listens until the candidate pauses for `pauseMs` after speaking, then calls `onDone` with the
 * full text. `onInterim` shows live captions. Chrome ends recognition on its own after a while,
 * so it is restarted until we are done.
 */
export function listen({
  onInterim,
  onDone,
  onError,
  pauseMs = 2200,
  lang = 'en-IN',
}: {
  onInterim: (text: string) => void;
  onDone: (text: string) => void;
  onError?: (code: string) => void;
  pauseMs?: number;
  lang?: string;
}): Listener {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    onError?.('unsupported');
    return { finish: () => {}, cancel: () => {} };
  }
  let finalText = '';
  let interim = '';
  let active = true;
  let timer: number | undefined;
  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;

  const text = () => `${finalText} ${interim}`.replace(/\s+/g, ' ').trim();
  const stop = (deliver: boolean) => {
    if (!active) return;
    active = false;
    window.clearTimeout(timer);
    try {
      rec.abort();
    } catch {
      // already stopped
    }
    if (deliver) onDone(text());
  };

  rec.onresult = (e) => {
    interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += ` ${r[0].transcript}`;
      else interim += ` ${r[0].transcript}`;
    }
    onInterim(text());
    window.clearTimeout(timer);
    if (text()) timer = window.setTimeout(() => stop(true), pauseMs);
  };
  rec.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return; // onend restarts
    stop(false);
    onError?.(e.error);
  };
  rec.onend = () => {
    if (!active) return;
    try {
      rec.start();
    } catch {
      stop(true);
    }
  };
  try {
    rec.start();
  } catch {
    active = false;
    onError?.('start-failed');
  }
  return { finish: () => stop(true), cancel: () => stop(false) };
}
