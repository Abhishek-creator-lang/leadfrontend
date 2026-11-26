'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { listen, speak, speechSupport, stopSpeaking, type Listener } from '@/lib/speech';
import {
  codingEvent,
  respond,
  startInterview,
  type CodingEvent,
  type EngineState,
  type InterviewPlan,
  type Turn,
} from '@/utils/interview/engine';

export type RoomStatus = 'idle' | 'speaking' | 'listening' | 'waiting' | 'done';

/** No speech at all for this long while it's the candidate's turn → the interviewer moves on. */
const VOICE_SILENCE_MS = 25_000;
/** Pause between lines when the interviewer's voice is off, so they read like speech. */
const TEXT_LINE_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs one live interview: the interviewer speaks each line out loud (unless muted), then the
 * candidate answers by voice (microphone) or by typing. Speaker and microphone are independent:
 * someone typing still hears the interviewer.
 */
export function useInterview(
  plan: InterviewPlan | null,
  mode: 'voice' | 'text',
  lineDelayMs = TEXT_LINE_DELAY_MS
) {
  const [state, setState] = useState<EngineState | null>(null);
  const [status, setStatus] = useState<RoomStatus>('idle');
  /** Transcript lines revealed so far (interviewer lines appear as they are spoken). */
  const [shown, setShown] = useState(0);
  const [caption, setCaption] = useState('');
  const [interim, setInterim] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  /** Answer by microphone. */
  const [micOn, setMicOn] = useState(false);
  /** Interviewer speaks out loud. */
  const [speakerOn, setSpeakerOn] = useState(false);

  const stateRef = useRef<EngineState | null>(null);
  const run = useRef(0); // bumps on every turn and on unmount: stale loops stop
  const listener = useRef<Listener | null>(null);
  const silenceTimer = useRef<number | undefined>(undefined);
  const skipSpeech = useRef(false);
  const micRef = useRef(micOn);
  micRef.current = micOn;
  const speakerRef = useRef(speakerOn);
  speakerRef.current = speakerOn;

  // The room reads its settings after mount, so follow `mode` instead of using it only once.
  useEffect(() => {
    const s = speechSupport();
    setSpeakerOn(s.speak);
    setMicOn(mode === 'voice' && s.listen);
  }, [mode]);

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
      if (speakerRef.current) await speak(line);
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
    if (!micRef.current) {
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
        submit(t.trim() ? t : null);
      },
      onError: (code) => {
        if (run.current !== id) return;
        setMicError(code);
        setMicOn(false); // fall back to typing
        setStatus('waiting');
      },
    });
    // While coding, silence is normal: never treat it as "no answer".
    const st = stateRef.current;
    if (st?.stage === 'coding' && st.coding.phase === 'coding') return;
    silenceTimer.current = window.setTimeout(() => {
      if (run.current === id && !heard) submit(null);
    }, VOICE_SILENCE_MS);
  }

  /** Editor and clock events in the coding round (tests run, idle, time). */
  const sendEvent = useCallback(
    (ev: CodingEvent) => {
      const s = stateRef.current;
      if (!s || s.stage !== 'coding') return;
      const turn = codingEvent(s, ev);
      if (!turn.say.length) {
        // Nothing to say (e.g. a repeated warning): update quietly, keep listening.
        stateRef.current = turn.state;
        setState(turn.state);
        return;
      }
      stopSpeaking();
      stopListening();
      void playTurn(turn);
    },
    [playTurn]
  );

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
    micOn,
    speakerOn,
    /** Switch between answering by voice and by typing (starts listening if it's your turn). */
    setMicOn: (on: boolean) => {
      setMicOn(on);
      micRef.current = on;
      if (!on) {
        stopListening();
        if (status === 'listening') setStatus('waiting');
      } else if (stateRef.current?.awaiting && status === 'waiting') {
        startAnswer(run.current);
      }
    },
    setSpeakerOn: (on: boolean) => {
      setSpeakerOn(on);
      speakerRef.current = on;
      if (!on) stopSpeaking();
    },
    begin,
    submit,
    sendEvent,
    doneAnswering,
    interrupt,
    end,
  };
}
