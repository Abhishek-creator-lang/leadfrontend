'use client';

import { FormEvent, KeyboardEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  loadCodingQuestionAction,
  loadDesignQuestionAction,
  loadInterviewMaterialAction,
} from '@/app/mock-interview/actions';
import { Markdown } from '@/components/Markdown';
import { INTERVIEWER, ROLE_LABEL } from '@/content/interviewer/script';
import { useContent } from '@/context/ContentContext';
import { ThemeModeContext } from '@/context/ThemeModeContext';
import { useBuiltInAI } from '@/hooks/useBuiltInAI';
import { useNow } from '@/hooks/useNow';
import { track } from '@/lib/analytics';
import { speechSupport } from '@/lib/speech';
import { PATHS } from '@/routes/paths';
import { useAppSelector } from '@/store';
import {
  buildReport,
  endEarly,
  STAGES,
  type InterviewPlan,
  type Line,
} from '@/utils/interview/engine';
import type { CodingMaterial, DesignMaterial } from '@/utils/interview/material';
import {
  buildPlan,
  LENGTHS,
  selectQuestionIds,
  type LiveInterviewConfig,
} from '@/utils/interview/plan';
import { formatClock } from '@/utils/interview/format';
import { loadConfig, saveRecord } from './liveStore';
import { InterviewReportView } from './InterviewReportView';
import { useInterview } from './useInterview';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(36,143,119,.55); }
  70% { box-shadow: 0 0 0 18px rgba(36,143,119,0); }
  100% { box-shadow: 0 0 0 0 rgba(36,143,119,0); }
`;

const micPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(211,47,47,.5); }
  70% { box-shadow: 0 0 0 14px rgba(211,47,47,0); }
  100% { box-shadow: 0 0 0 0 rgba(211,47,47,0); }
`;

// Sandpack touches browser APIs on mount: client only, and only downloaded for the coding round.
const InterviewCodeEditor = dynamic(() => import('./InterviewCodeEditor'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  ),
});

/** No edits and no speech for this long while coding → the interviewer checks in. */
const IDLE_MS = 3 * 60_000;

const DEFAULT_CONFIG: LiveInterviewConfig = { role: 'lead', length: 'short', mode: 'text' };

/** Full-screen interview room: one page from "hello" to the feedback report. */
export default function InterviewRoom({
  /** Pause between interviewer lines in typing mode (tests pass 0). */
  lineDelayMs,
}: { lineDelayMs?: number } = {}) {
  const { content } = useContent();
  const completed = useAppSelector((s) => s.progress.completed);
  const [config, setConfig] = useState<LiveInterviewConfig | null>(null);
  const [plan, setPlan] = useState<InterviewPlan | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [joined, setJoined] = useState(false);
  /** Design notes board: one text per design step. */
  const [designNotes, setDesignNotes] = useState<Record<string, string>>({});
  const notesRef = useRef(designNotes);
  notesRef.current = designNotes;
  // Tailored design follow-ups only when Chrome's model is already on the device (no surprise download).
  const aiReady = useBuiltInAI() === 'available';

  useEffect(() => {
    const c = loadConfig() ?? DEFAULT_CONFIG;
    setConfig(c.mode === 'voice' && !speechSupport().listen ? { ...c, mode: 'text' } : c);
  }, []);

  useEffect(() => {
    if (!config || !content.questions.length) return;
    let cancelled = false;
    Promise.all([
      loadInterviewMaterialAction(selectQuestionIds(content.questions, config)),
      // Prefer problems the candidate hasn't solved yet.
      loadCodingQuestionAction(config.role, Object.keys(completed).slice(0, 500)).catch(() => null),
      LENGTHS[config.length].design
        ? loadDesignQuestionAction(config.role, Object.keys(completed).slice(0, 500)).catch(
            () => null
          )
        : Promise.resolve(null),
    ])
      .then(([materials, coding, design]) => {
        if (cancelled) return;
        const p = buildPlan(config, materials, coding, design);
        if (!p.quiz.length && !p.behavioral.length) setLoadError(true);
        else setPlan(p);
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
    // `completed` only steers the choice; don't reload the interview when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, content.questions]);

  const room = useInterview(plan, config?.mode ?? 'text', {
    lineDelayMs,
    getDesignNotes: (stepId) => notesRef.current[stepId] ?? '',
    useAI: aiReady,
  });

  return (
    <Box
      role="main"
      aria-label="Mock interview room"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (t) => t.zIndex.modal,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!joined || !config ? (
        <Lobby
          config={config}
          ready={Boolean(plan)}
          error={loadError}
          onJoin={() => {
            setJoined(true);
            room.begin();
            track('live_interview_started', { role: config!.role, mode: config!.mode });
          }}
        />
      ) : (
        <Live
          config={config}
          room={room}
          notes={designNotes}
          onNotes={(id, text) => setDesignNotes((n) => ({ ...n, [id]: text }))}
        />
      )}
    </Box>
  );
}

function Lobby({
  config,
  ready,
  error,
  onJoin,
}: {
  config: LiveInterviewConfig | null;
  ready: boolean;
  error: boolean;
  onJoin: () => void;
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ flex: 1, p: 3, textAlign: 'center' }}
      spacing={3}
    >
      <Avatar sx={{ width: 96, height: 96, fontSize: 40, bgcolor: 'primary.main' }}>
        {INTERVIEWER.initials}
      </Avatar>
      <Box>
        <Typography variant="h4" component="h1">
          Your interview with {INTERVIEWER.name}
        </Typography>
        <Typography color="text.secondary">
          {INTERVIEWER.role} · {config ? ROLE_LABEL[config.role] : ''} ·{' '}
          {config ? `about ${LENGTHS[config.length].minutes} minutes` : ''}
        </Typography>
      </Box>
      <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
        {config?.mode === 'voice'
          ? 'Use headphones if you can. Answer out loud; a short pause tells the interviewer you have finished. You can always type instead.'
          : 'Type your answers as if you were speaking. Press Enter to send.'}
      </Typography>
      {error ? (
        <Alert severity="error">
          Could not prepare the interview. <NextLink href={PATHS.mockInterview}>Go back</NextLink>{' '}
          and try again.
        </Alert>
      ) : (
        <Button
          size="large"
          variant="contained"
          onClick={onJoin}
          disabled={!ready}
          sx={{ minWidth: 220 }}
        >
          {ready ? 'Join interview' : <CircularProgress size={24} color="inherit" />}
        </Button>
      )}
      <Button component={NextLink} href={PATHS.mockInterview} color="inherit">
        Back
      </Button>
    </Stack>
  );
}

function Live({
  config,
  room,
  notes,
  onNotes,
}: {
  config: LiveInterviewConfig;
  room: ReturnType<typeof useInterview>;
  notes: Record<string, string>;
  onNotes: (stepId: string, text: string) => void;
}) {
  const { state, status, shown, caption, interim, micError, micOn, speakerOn, pendingAnswer } =
    room;
  const canSpeak = speechSupport().listen;
  const [startedAt] = useState(() => Date.now());
  const now = useNow(status !== 'done');
  const [draft, setDraft] = useState('');
  const [camera, setCamera] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const saved = useRef(false);
  const { mode: themeMode } = useContext(ThemeModeContext);

  const codingMaterial = state?.stage === 'coding' ? state.plan.coding : null;
  const codingPhase = state?.stage === 'coding' ? state.coding.phase : null;
  const designMaterial = state?.stage === 'design' ? state.plan.design : null;
  const designPhase = state?.stage === 'design' ? state.design.phase : null;
  const designStep = designMaterial && state ? designMaterial.steps[state.design.stepIndex] : null;
  /** The timed round in progress: coding (while coding) or design (while working through steps). */
  const round: 'coding' | 'design' | null =
    codingPhase === 'coding' ? 'coding' : designPhase === 'steps' ? 'design' : null;
  const codingLimitMs = LENGTHS[config.length].coding * 60_000;
  const roundLimitMs =
    (round === 'design' ? LENGTHS[config.length].design : LENGTHS[config.length].coding) * 60_000;
  const roundStart = useRef<{ stage: string; at: number } | null>(null);
  const codingStart = useRef<number | null>(null);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    const stage = state?.stage;
    if ((stage === 'coding' || stage === 'design') && roundStart.current?.stage !== stage) {
      roundStart.current = { stage, at: Date.now() };
      if (stage === 'coding') codingStart.current = Date.now();
      lastActivity.current = Date.now();
    }
  }, [state?.stage]);

  useEffect(() => {
    if (interim) lastActivity.current = Date.now();
  }, [interim]);

  // The interviewer keeps an eye on the clock and on whether you're stuck.
  useEffect(() => {
    if (!round || !roundStart.current || !state) return;
    if (status !== 'listening' && status !== 'waiting') return; // never talk over him
    const elapsed = now - roundStart.current.at;
    const warned = round === 'coding' ? state.coding.warnedTime : state.design.warnedTime;
    if (elapsed >= roundLimitMs) {
      room.sendEvent({ type: 'timeUp' });
    } else if (elapsed >= roundLimitMs * 0.8 && !warned) {
      room.sendEvent({ type: 'timeWarning', minutesLeft: (roundLimitMs - elapsed) / 60_000 });
    } else if (
      round === 'coding' &&
      now - lastActivity.current > IDLE_MS &&
      state.coding.nudges < 2
    ) {
      lastActivity.current = now;
      room.sendEvent({ type: 'idle' });
    }
    // Runs on every clock tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const onTests = (r: { passed: number; total: number }) => {
    lastActivity.current = Date.now();
    const elapsed = codingStart.current ? Date.now() - codingStart.current : 0;
    room.sendEvent({ type: 'tests', ...r, elapsedRatio: elapsed / codingLimitMs });
  };
  const onActivity = () => {
    lastActivity.current = Date.now();
  };

  const durationSec = () => Math.round((Date.now() - startedAt) / 1000);
  const report = useMemo(
    () => (status === 'done' && state ? buildReport(state, { durationSec: durationSec() }) : null),
    // Duration is taken when the report is built.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, state]
  );
  const recordId = startedAt.toString(36);

  useEffect(() => {
    if (!report || !state || saved.current) return;
    saved.current = true;
    saveRecord({ id: recordId, at: startedAt, config, report, transcript: state.transcript });
    track('live_interview_completed', {
      role: config.role,
      score: report.score,
      completed: report.completed,
    });
  }, [report, state, config, startedAt, recordId]);

  // Closing or reloading the tab mid-interview: warn, and keep what was done as an incomplete report.
  useEffect(() => {
    if (status === 'done') return;
    const inProgress = () => {
      const s = room.getState();
      return Boolean(s && s.stage !== 'done' && s.transcript.some((l) => l.who === 'candidate'));
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!inProgress()) return;
      e.preventDefault();
      e.returnValue = '';
    };
    const onPageHide = () => {
      const s = room.getState();
      if (!s || !inProgress() || saved.current) return;
      saved.current = true;
      const ended = endEarly(s);
      saveRecord({
        id: recordId,
        at: startedAt,
        config,
        report: buildReport(ended, { durationSec: durationSec() }),
        transcript: ended.transcript,
      });
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onPageHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, config, startedAt, recordId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [shown, interim]);

  if (report && state)
    return (
      <InterviewReportView
        report={report}
        transcript={state.transcript}
        at={startedAt}
        config={config}
      />
    );

  const lines = state ? state.transcript.slice(0, shown) : [];
  // Only show the rounds this interview actually has.
  const stages = STAGES.filter(
    (s) => (s.id !== 'coding' || state?.plan.coding) && (s.id !== 'design' || state?.plan.design)
  );
  const stageIndex = stages.findIndex((s) => s.id === state?.stage);
  const canAnswer = status === 'listening' || status === 'waiting';
  const sidePanel = Boolean(codingMaterial || designMaterial);

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    lastActivity.current = Date.now();
    room.submit(draft.trim());
    setDraft('');
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) send(e);
  };

  return (
    <>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Box
          sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }}
          aria-hidden
        />
        <Typography fontWeight={700} noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
          {ROLE_LABEL[config.role]} interview
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ flex: 1, overflow: 'hidden' }}>
          {stages.map((s, i) => (
            <Chip
              key={s.id}
              size="small"
              label={s.label}
              color={i === stageIndex ? 'primary' : 'default'}
              variant={i <= stageIndex ? 'filled' : 'outlined'}
              sx={{ display: { xs: i === stageIndex ? 'flex' : 'none', md: 'flex' } }}
            />
          ))}
        </Stack>
        {round && roundStart.current ? (
          <Chip
            size="small"
            color={now - roundStart.current.at > roundLimitMs * 0.8 ? 'warning' : 'default'}
            label={`${round === 'coding' ? 'Coding' : 'Design'} · ${formatClock(
              Math.max(0, Math.round((roundLimitMs - (now - roundStart.current.at)) / 1000))
            )} left`}
            sx={{ fontFamily: 'var(--font-mono)' }}
          />
        ) : (
          <Typography fontFamily="var(--font-mono)" color="text.secondary">
            {formatClock(Math.round((now - startedAt) / 1000))}
          </Typography>
        )}
        {speechSupport().speak && (
          <Tooltip title={speakerOn ? `Mute ${INTERVIEWER.name}` : `Unmute ${INTERVIEWER.name}`}>
            <IconButton
              onClick={() => room.setSpeakerOn(!speakerOn)}
              aria-label={speakerOn ? `Mute ${INTERVIEWER.name}` : `Unmute ${INTERVIEWER.name}`}
              aria-pressed={!speakerOn}
            >
              {speakerOn ? <VolumeUpRoundedIcon /> : <VolumeOffRoundedIcon />}
            </IconButton>
          </Tooltip>
        )}
        <Button
          color="error"
          variant="outlined"
          startIcon={<CallEndRoundedIcon />}
          onClick={room.end}
        >
          End
        </Button>
      </Stack>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: sidePanel ? '260px 1fr' : '340px 1fr' },
        }}
      >
        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            p: 3,
            borderRight: { md: 1 },
            borderColor: { md: 'divider' },
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <Avatar
            sx={{
              width: sidePanel ? 72 : 120,
              height: sidePanel ? 72 : 120,
              fontSize: sidePanel ? 32 : 48,
              bgcolor: 'primary.main',
              animation: status === 'speaking' ? `${pulse} 1.4s infinite` : 'none',
            }}
          >
            {INTERVIEWER.initials}
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{INTERVIEWER.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {INTERVIEWER.role}
            </Typography>
          </Box>
          <Chip
            size="small"
            color={status === 'listening' ? 'error' : 'default'}
            label={
              status === 'thinking'
                ? 'Thinking…'
                : status === 'speaking'
                  ? 'Speaking…'
                  : status === 'listening'
                    ? 'Listening to you…'
                    : canAnswer
                      ? 'Your turn'
                      : '…'
            }
          />
          <Typography
            aria-live="polite"
            sx={{
              fontSize: sidePanel ? 15 : 18,
              textAlign: 'center',
              minHeight: sidePanel ? 60 : 100,
              color: 'text.primary',
            }}
          >
            {status === 'speaking' ? caption : ''}
          </Typography>
          {sidePanel ? (
            <MiniTranscript lines={lines} interim={interim || pendingAnswer} />
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
          {camera && <SelfView />}
          <Button
            size="small"
            color="inherit"
            startIcon={camera ? <VideocamOffRoundedIcon /> : <VideocamRoundedIcon />}
            onClick={() => setCamera((c) => !c)}
          >
            {camera ? 'Hide my camera' : 'Show my camera'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            Your camera is only shown to you. Nothing is recorded or uploaded.
          </Typography>
        </Stack>

        {designMaterial && state ? (
          <DesignStage
            material={designMaterial}
            stepIndex={state.design.stepIndex}
            notes={notes}
            onNotes={onNotes}
          />
        ) : codingMaterial ? (
          <CodingStage
            material={codingMaterial}
            dark={themeMode === 'dark'}
            onTests={onTests}
            onActivity={onActivity}
          />
        ) : (
          /* Conversation */
          <Box ref={scroller} sx={{ overflowY: 'auto', p: { xs: 2, md: 3 } }}>
            <Stack spacing={1.5} sx={{ maxWidth: 760, mx: 'auto' }}>
              {lines.map((l, i) => (
                <Bubble key={i} who={l.who} text={l.text} />
              ))}
              {interim && <Bubble who="candidate" text={interim} live />}
              {pendingAnswer && <Bubble who="candidate" text={pendingAnswer} />}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Controls */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', px: { xs: 1.5, md: 3 }, py: 1.5 }}>
        {!canSpeak && (
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ textAlign: 'center', mb: 1 }}
          >
            Speaking your answers needs Chrome, Edge or Safari. In this browser you can type, and{' '}
            {INTERVIEWER.name} still talks to you.
          </Typography>
        )}
        {micError && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {micError === 'not-allowed'
              ? 'Microphone access was blocked. You can type your answers instead.'
              : 'Voice input stopped working. You can type your answers instead.'}
          </Alert>
        )}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ maxWidth: 1000, mx: 'auto' }}>
          {status === 'speaking' ? (
            <Button onClick={room.interrupt} variant="outlined" sx={{ flex: 1 }}>
              Skip ahead
            </Button>
          ) : micOn && status === 'listening' ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <Box
                aria-hidden
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  color: 'common.white',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  animation: `${micPulse} 1.4s infinite`,
                }}
              >
                <MicRoundedIcon />
              </Box>
              <Button
                onClick={room.doneAnswering}
                variant="contained"
                startIcon={<CheckRoundedIcon />}
                sx={{ flex: 1 }}
              >
                {interim ? "I'm done answering" : 'Listening… speak now'}
              </Button>
              <Button
                color="inherit"
                startIcon={<KeyboardRoundedIcon />}
                onClick={() => room.setMicOn(false)}
              >
                Type instead
              </Button>
            </Stack>
          ) : (
            <Box
              component="form"
              onSubmit={send}
              sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}
            >
              {canSpeak && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<MicRoundedIcon />}
                  onClick={() => room.setMicOn(true)}
                  disabled={!canAnswer}
                  sx={{ flexShrink: 0 }}
                >
                  Speak your answer
                </Button>
              )}
              <TextField
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder={canAnswer ? 'Or type your answer…' : 'Wait for the interviewer…'}
                disabled={!canAnswer}
                multiline
                maxRows={4}
                size="small"
                fullWidth
                autoFocus
                inputProps={{ 'aria-label': 'Your answer' }}
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={!canAnswer || !draft.trim()}
                aria-label="Send"
              >
                <SendRoundedIcon />
              </IconButton>
            </Box>
          )}
          {designPhase === 'steps' && designStep && (
            <Button
              variant="outlined"
              color="success"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => room.sendEvent({ type: 'done', notes: notes[designStep.id] ?? '' })}
              disabled={status === 'speaking' || status === 'thinking'}
              sx={{ flexShrink: 0 }}
            >
              Next step
            </Button>
          )}
          {codingPhase === 'coding' && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<DoneAllRoundedIcon />}
              onClick={() => room.sendEvent({ type: 'done' })}
              disabled={status === 'speaking'}
              sx={{ flexShrink: 0 }}
            >
              I&apos;m done coding
            </Button>
          )}
          <Tooltip title="Ask to repeat">
            <span>
              <IconButton
                disabled={!canAnswer}
                onClick={() => room.submit('can you repeat that')}
                aria-label="Repeat the question"
              >
                <ReplayRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Ask for a hint">
            <span>
              <IconButton
                disabled={!canAnswer}
                onClick={() => room.submit('can I get a hint')}
                aria-label="Ask for a hint"
              >
                <LightbulbRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Skip this question">
            <span>
              <IconButton
                disabled={!canAnswer}
                onClick={() => room.submit('skip')}
                aria-label="Skip this question"
              >
                <SkipNextRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    </>
  );
}

function Bubble({
  who,
  text,
  live,
}: {
  who: 'interviewer' | 'candidate';
  text: string;
  live?: boolean;
}) {
  const mine = who === 'candidate';
  return (
    <Box sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={(t) => ({
          maxWidth: '85%',
          px: 2,
          py: 1.25,
          borderRadius: 3,
          bgcolor: mine ? alpha(t.palette.primary.main, 0.12) : 'background.paper',
          border: mine ? 'none' : `1px solid ${t.palette.divider}`,
          opacity: live ? 0.7 : 1,
          fontStyle: live ? 'italic' : 'normal',
        })}
      >
        {!mine && (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {INTERVIEWER.name}
          </Typography>
        )}
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>
      </Box>
    </Box>
  );
}

/** Local camera preview. The stream never leaves the browser and is stopped on hide. */
function SelfView() {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 320, height: 240 }, audio: false })
      .then((s) => {
        stream = s;
        if (video.current) video.current.srcObject = s;
      })
      .catch(() => setError(true));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);
  if (error) return <Typography variant="caption">Camera not available.</Typography>;
  return (
    <Box
      component="video"
      ref={video}
      autoPlay
      muted
      playsInline
      sx={{ width: '100%', borderRadius: 2, transform: 'scaleX(-1)', bgcolor: 'black' }}
    />
  );
}

/** Prompt on the left, editor and tests on the right. */
function CodingStage({
  material,
  dark,
  onTests,
  onActivity,
}: {
  material: CodingMaterial;
  dark: boolean;
  onTests: (r: { passed: number; total: number }) => void;
  onActivity: () => void;
}) {
  return (
    <Box
      sx={{
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 2fr) 3fr' },
        gridTemplateRows: { xs: 'auto minmax(420px, 1fr)', lg: '1fr' },
        overflow: { xs: 'auto', lg: 'hidden' },
      }}
    >
      <Box
        sx={{
          overflowY: 'auto',
          p: 2.5,
          borderRight: { lg: 1 },
          borderColor: { lg: 'divider' },
          maxHeight: { xs: '40vh', lg: 'none' },
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {material.title}
        </Typography>
        <Markdown>{material.prompt}</Markdown>
      </Box>
      <Box sx={{ minHeight: 0, height: '100%' }}>
        <InterviewCodeEditor
          material={material}
          dark={dark}
          onTests={onTests}
          onActivity={onActivity}
        />
      </Box>
    </Box>
  );
}

/** The last few lines of the conversation, shown beside the editor while coding. */
function MiniTranscript({ lines, interim }: { lines: Line[]; interim: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'end' });
  }, [lines.length, interim]);
  return (
    <Box sx={{ flex: 1, minHeight: 0, width: '100%', overflowY: 'auto' }}>
      <Stack spacing={1}>
        {lines.slice(-12).map((l, i) => (
          <Typography
            key={i}
            variant="body2"
            color={l.who === 'interviewer' ? 'text.primary' : 'text.secondary'}
          >
            <b>{l.who === 'interviewer' ? INTERVIEWER.name : 'You'}:</b> <span>{l.text}</span>
          </Typography>
        ))}
        {interim && (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            <b>You:</b> {interim}
          </Typography>
        )}
        <div ref={end} />
      </Stack>
    </Box>
  );
}

/** Problem and step list on the left, a notes board per design step on the right. */
function DesignStage({
  material,
  stepIndex,
  notes,
  onNotes,
}: {
  material: DesignMaterial;
  stepIndex: number;
  notes: Record<string, string>;
  onNotes: (stepId: string, text: string) => void;
}) {
  const current = material.steps[Math.min(stepIndex, material.steps.length - 1)];
  return (
    <Box
      sx={{
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 2fr) 3fr' },
        overflow: { xs: 'auto', lg: 'hidden' },
      }}
    >
      <Box
        sx={{
          overflowY: 'auto',
          p: 2.5,
          borderRight: { lg: 1 },
          borderColor: { lg: 'divider' },
          maxHeight: { xs: '40vh', lg: 'none' },
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {material.title}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 0.5 }}>
          {material.steps.map((st, i) => (
            <Chip
              key={st.id}
              size="small"
              label={`${i + 1}. ${st.label}`}
              color={i === stepIndex ? 'primary' : 'default'}
              variant={i <= stepIndex ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
        <Markdown>{material.prompt}</Markdown>
      </Box>
      <Box sx={{ overflowY: 'auto', p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Notes board
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Jot down your points as you talk. {INTERVIEWER.name} reads your notes for the current step
          too. Press <b>Next step</b> when you are ready to move on.
        </Typography>
        <Stack spacing={2}>
          {material.steps.map((st, i) => (
            <TextField
              key={st.id}
              label={`${i + 1}. ${st.label}`}
              value={notes[st.id] ?? ''}
              onChange={(e) => onNotes(st.id, e.target.value)}
              multiline
              minRows={st.id === current.id ? 6 : 2}
              fullWidth
              focused={st.id === current.id ? true : undefined}
              placeholder={st.id === current.id ? 'Your notes for this step…' : undefined}
              inputProps={{ 'aria-label': `Notes: ${st.label}` }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
