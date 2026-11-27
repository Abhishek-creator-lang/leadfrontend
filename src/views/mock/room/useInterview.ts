'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { listen, speak, speechSupport, stopSpeaking, type Listener } from '@/lib/speech';
import { aiDesignFollowUp } from '@/lib/aiFollowUp';
import { aiGradeAnswer } from '@/lib/aiGrade';
import {
  designWouldProbe,
  endEarly,
  respond,
  roundEvent,
  startInterview,
  type EngineState,
  type RoundEvent,
  type InterviewPlan,
  type Turn,
  warmupAnswerToCheck,
} from '@/utils/interview/engine';

export type RoomStatus = 'idle' | 'speaking' | 'listening' | 'waiting' | 'thinking' | 'done';

export interface InterviewOptions {
  /** Pause between lines when the interviewer's voice is off (tests pass 0). */
  lineDelayMs?: number;
  /** Notes the candidate wrote for a design step. */
  getDesignNotes?: (stepId: string) => string;
  /** Chrome's on-device AI is ready: use it for design follow-ups and to double-check answers. */
  useAI?: boolean;
}

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
  { lineDelayMs = TEXT_LINE_DELAY_MS, getDesignNotes, useAI = false }: InterviewOptions = {}
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
  /** Answer being considered while the on-device AI writes a follow-up. */
  const [pendingAnswer, setPendingAnswer] = useState('');

  const stateRef = useRef<EngineState | null>(null);
  const run = useRef(0); // bumps on every turn and on unmount: stale loops stop
  const listener = useRef<Listener | null>(null);
  const silenceTimer = useRef<number | undefined>(undefined);
  const skipSpeech = useRef(false);
  const micRef = useRef(micOn);
  micRef.current = micOn;
  const speakerRef = useRef(speakerOn);
  speakerRef.current = speakerOn;
  const notesRef = useRef(getDesignNotes);
  notesRef.current = getDesignNotes;
  const aiRef = useRef(useAI);
  aiRef.current = useAI;

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
      // Fundamentals: let the on-device AI double-check the answer (paraphrases, wrong facts).
      const check = text !== null && aiRef.current ? warmupAnswerToCheck(s, text) : null;
      if (check && text !== null) {
        const id = ++run.current;
        setStatus('thinking');
        setPendingAnswer(text);
        void aiGradeAnswer(check).then((aiJudgement) => {
          if (run.current !== id) return;
          setPendingAnswer('');
          void playTurn(respond(s, text, { aiJudgement }));
        });
        return;
      }
      if (text === null || s.stage !== 'design') {
        void playTurn(respond(s, text));
        return;
      }
      // Design: grade the spoken answer together with the notes board, and let the on-device AI
      // write the follow-up when the interviewer would probe anyway.
      const design = s.plan.design!;
      const step = design.steps[s.design.stepIndex];
      const notes = (step && notesRef.current?.(step.id)) || '';
      if (!step || !aiRef.current || !designWouldProbe(s, text, notes)) {
        void playTurn(respond(s, text, { notes }));
        return;
      }
      const id = ++run.current;
      setStatus('thinking');
      setPendingAnswer(text);
      void aiDesignFollowUp({
        problem: design.title,
        step: step.label,
        keyPoints: step.keyPoints,
        answer: [...s.design.answers, text, notes].join(' '),
      }).then((aiFollowUp) => {
        if (run.current !== id) return;
        setPendingAnswer('');
        void playTurn(respond(s, text, { notes, aiFollowUp }));
      });
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
    // While coding or working through a design step, silence is normal: never "no answer".
    const st = stateRef.current;
    if (st?.stage === 'coding' && st.coding.phase === 'coding') return;
    if (st?.stage === 'design' && st.design.phase === 'steps') return;
    silenceTimer.current = window.setTimeout(() => {
      if (run.current === id && !heard) submit(null);
    }, VOICE_SILENCE_MS);
  }

  /** Room events in the coding and design rounds (tests run, idle, time, done / next step). */
  const sendEvent = useCallback(
    (ev: RoundEvent) => {
      const s = stateRef.current;
      if (!s || (s.stage !== 'coding' && s.stage !== 'design')) return;
      const turn = roundEvent(s, ev);
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

  /** The candidate ends the interview: close what is open with the credit earned so far. */
  const end = useCallback(() => {
    run.current++;
    stopSpeaking();
    stopListening();
    setPendingAnswer('');
    const s = stateRef.current;
    if (s && s.stage !== 'done') {
      const ended = endEarly(s);
      stateRef.current = ended;
      setState(ended);
    }
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
    pendingAnswer,
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
    /** Latest engine state, for saving when the page is closed. */
    getState: () => stateRef.current,
    begin,
    submit,
    sendEvent,
    doneAnswering,
    interrupt,
    end,
  };
}
