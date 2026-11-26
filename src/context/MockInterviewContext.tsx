'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { STORAGE_KEYS } from '@/constants/storage';
import { useContent } from '@/context/ContentContext';
import { track } from '@/lib/analytics';
import {
  createSession,
  sessionScore,
  type MockSession,
  type MockTrackId,
} from '@/utils/mockInterview';

const HISTORY_LIMIT = 10;

interface Stored {
  /** The session in progress, or the one just finished (shown as a scorecard until dismissed). */
  active: MockSession | null;
  /** Finished sessions, newest first. */
  history: MockSession[];
}

const EMPTY: Stored = { active: null, history: [] };

function load(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mockInterview);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(state: Stored) {
  try {
    localStorage.setItem(STORAGE_KEYS.mockInterview, JSON.stringify(state));
  } catch {
    // storage full or blocked: the session still works for this tab
  }
}

interface MockInterviewApi {
  ready: boolean;
  session: MockSession | null;
  history: MockSession[];
  start: (
    track: MockTrackId,
    opts: { company: string | null; completed: Record<string, unknown> }
  ) => void;
  startRound: () => void;
  toggleCheck: (index: number) => void;
  finishRound: () => void;
  /** Leaves the current session (unfinished ones are discarded, finished ones stay in history). */
  close: () => void;
}

const MockInterviewContext = createContext<MockInterviewApi | null>(null);

export function MockInterviewProvider({ children }: { children: ReactNode }) {
  const { content } = useContent();
  const [state, setState] = useState<Stored>(EMPTY);
  const [ready, setReady] = useState(false);

  // Load after mount so server and first client render match.
  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) save(state);
  }, [state, ready]);

  const updateRound = useCallback(
    (fn: (s: MockSession) => MockSession) =>
      setState((prev) => (prev.active ? { ...prev, active: fn(prev.active) } : prev)),
    []
  );

  const api = useMemo<MockInterviewApi>(
    () => ({
      ready,
      session: state.active,
      history: state.history,
      start(trackId, { company, completed }) {
        const session = createSession(content.questions, trackId, { company, completed });
        setState((prev) => ({ ...prev, active: session }));
        track('mock_started', { track: trackId, company });
      },
      startRound() {
        updateRound((s) => ({
          ...s,
          rounds: s.rounds.map((r, i) =>
            i === s.current && !r.startedAt ? { ...r, startedAt: Date.now() } : r
          ),
        }));
      },
      toggleCheck(index) {
        updateRound((s) => ({
          ...s,
          rounds: s.rounds.map((r, i) =>
            i !== s.current
              ? r
              : {
                  ...r,
                  checked: r.checked.includes(index)
                    ? r.checked.filter((c) => c !== index)
                    : [...r.checked, index],
                }
          ),
        }));
      },
      finishRound() {
        setState((prev) => {
          const s = prev.active;
          if (!s) return prev;
          const now = Date.now();
          const rounds = s.rounds.map((r, i) =>
            i === s.current
              ? { ...r, startedAt: r.startedAt ?? now, endedAt: now, graded: true }
              : r
          );
          const last = s.current >= s.rounds.length - 1;
          if (!last) return { ...prev, active: { ...s, rounds, current: s.current + 1 } };
          const done: MockSession = { ...s, rounds, finishedAt: now };
          track('mock_completed', { track: s.track, score: sessionScore(done) });
          return { active: done, history: [done, ...prev.history].slice(0, HISTORY_LIMIT) };
        });
      },
      close() {
        setState((prev) => ({ ...prev, active: null }));
      },
    }),
    [ready, state, content.questions, updateRound]
  );

  return <MockInterviewContext.Provider value={api}>{children}</MockInterviewContext.Provider>;
}

export function useMockInterview(): MockInterviewApi {
  const api = useContext(MockInterviewContext);
  if (!api) throw new Error('useMockInterview must be used inside <MockInterviewProvider>');
  return api;
}
