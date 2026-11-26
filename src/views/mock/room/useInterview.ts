'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { listen, speak, stopSpeaking, type Listener } from '@/lib/speech';
import {
  respond,
  startInterview,
  type EngineState,
  type InterviewPlan,
  type Turn,
} from '@/utils/interview/engine';

export type RoomStatus = 'idle' | 'speaking' | 'listening' | 'waiting' | 'done';

/** No speech at all for this long while it's the candidate's turn → the interviewer moves on. */
const VOICE_SILENCE_MS = 25_000;
/** Text mode: pause between interviewer lines so they read like speech. */
const TEXT_LINE_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs one live interview: speaks the interviewer's lines, then listens (voice) or waits for typing
 * (text), feeds answers to the dialogue engine and repeats until it's over.
 */
export function useInterview(
  plan: InterviewPlan | null,
  mode: 'voice' | 'text',
  lineDelayMs = TEXT_LINE_DELAY_MS
) {
  const [state, setState] = useState<EngineState | null>(null);
  const [status, setStatus] = useState<RoomStatus>('idle');
  /** Interviewer lines revealed so far (lines appear as they are spoken). */
  const [shown, setShown] = useState(0);
  const [caption, setCaption] = useState('');
  const [interim, setInterim] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(mode === 'voice');

  const stateRef = useRef<EngineState | null>(null);
  const run = useRef(0); // bumps on every turn and on unmount: stale loops stop
  const listener = useRef<Listener | null>(null);
  const silenceTimer = useRef<number | undefined>(undefined);
  const skipSpeech = useRef(false);
  const voiceRef = useRef(voiceMode);
  voiceRef.current = voiceMode;

  const stopListening = () => {
    window.clearTimeout(silenceTimer.current);
    listener.current?.cancel();
    listener.current = null;
    setInterim('');
  };

  const playTurn = useCallback(async (turn: Turn) => {
    const id = ++run.current;
    stopListening();
    stateRef.current = turn.state;
    setState(turn.state);
    // The engine appends this turn's lines at the end of the transcript; reveal them one by one.
    const total = turn.state.transcript.length;
    const firstNew = total - turn.say.length;
    setShown((n) => Math.max(n, firstNew));
    skipSpeech.current = false;

    setStatus('speaking');
    for (let i = 0; i < turn.say.length; i++) {
      if (run.current !== id) return;
      const line = turn.say[i];
      setCaption(line);
      setShown(firstNew + i + 1);
      if (skipSpeech.current) continue;
      if (voiceRef.current) await speak(line);
      else await sleep(lineDelayMs);
    }
    if (run.current !== id) return;
    setShown(total);

    if (turn.state.stage === 'done') {
      setStatus('done');
      return;
    }
    if (turn.state.awaiting) startAnswer(id);
    else setStatus('waiting');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(
    (text: string | null) => {
      const s = stateRef.current;
      if (!s || s.stage === 'done') return;
      stopSpeaking();
      stopListening();
      void playTurn(respond(s, text));
    },
    [playTurn]
  );

  function startAnswer(id: number) {
    if (!voiceRef.current) {
      setStatus('waiting');
      return;
    }
    setStatus('listening');
    setMicError(null);
    let heard = false;
    listener.current = listen({
      onInterim: (t) => {
        heard = true;
        window.clearTimeout(silenceTimer.current);
        setInterim(t);
      },
      onDone: (t) => {
        if (run.current !== id) return;
        listener.current = null;
        setInterim('');
        if (t.trim()) submit(t);
        else submit(null);
      },
      onError: (code) => {
        if (run.current !== id) return;
        setMicError(code);
        setVoiceMode(false); // fall back to typing
        setStatus('waiting');
      },
    });
    silenceTimer.current = window.setTimeout(() => {
      if (run.current === id && !heard) submit(null);
    }, VOICE_SILENCE_MS);
  }

  const begin = useCallback(() => {
    if (!plan) return;
    setShown(0);
    void playTurn(startInterview(plan, Math.floor(Math.random() * 1e6) + 1));
  }, [plan, playTurn]);

  /** Candidate finished talking before the pause detector noticed. */
  const doneAnswering = () => listener.current?.finish();

  /** Interrupt the interviewer: stop talking and show the rest of the turn at once. */
  const interrupt = () => {
    skipSpeech.current = true;
    stopSpeaking();
  };

  const end = useCallback(() => {
    run.current++;
    stopSpeaking();
    stopListening();
    setStatus('done');
  }, []);

  useEffect(
    () => () => {
      run.current++;
      stopSpeaking();
      listener.current?.cancel();
      window.clearTimeout(silenceTimer.current);
    },
    []
  );

  return {
    state,
    status,
    shown,
    caption,
    interim,
    micError,
    voiceMode,
    setVoiceMode: (v: boolean) => {
      setVoiceMode(v);
      if (!v) stopListening();
      if (v && stateRef.current?.awaiting && status === 'waiting') startAnswer(run.current);
    },
    begin,
    submit,
    doneAnswering,
    interrupt,
    end,
  };
}
