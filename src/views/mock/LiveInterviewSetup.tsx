'use client';

import { useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  FormControlLabel,
  LinearProgress,
  Link,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { INTERVIEWER, type InterviewRole } from '@/content/interviewer/script';
import { useBuiltInAIState } from '@/hooks/useBuiltInAI';
import { loadAIEnabled, saveAIEnabled } from '@/lib/aiPrefs';
import { track } from '@/lib/analytics';
import { prepareChromeModel } from '@/lib/builtInAI';
import { listen, speak, speechSupport, type Listener } from '@/lib/speech';
import { PATHS } from '@/routes/paths';
import { LENGTHS, type InterviewLength } from '@/utils/interview/plan';
import { loadHistory, saveConfig, type LiveInterviewRecord } from './room/liveStore';

/** Lobby card for the live, conversational interview. */
export function LiveInterviewSetup() {
  const router = useRouter();
  const [role, setRole] = useState<InterviewRole>('lead');
  const [length, setLength] = useState<InterviewLength>('short');
  const [support, setSupport] = useState({ speak: false, listen: false });
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [micTest, setMicTest] = useState<'idle' | 'listening' | 'ok' | 'error'>('idle');
  const [heard, setHeard] = useState('');
  const [history, setHistory] = useState<LiveInterviewRecord[]>([]);
  const listener = useRef<Listener | null>(null);
  const ai = useBuiltInAIState();
  const [aiEnabled, setAIEnabled] = useState(true);

  useEffect(() => {
    const s = speechSupport();
    setSupport(s);
    if (s.listen) setMode('voice');
    setHistory(loadHistory());
    setAIEnabled(loadAIEnabled());
    return () => listener.current?.cancel();
  }, []);

  const testMic = () => {
    setMicTest('listening');
    setHeard('');
    listener.current = listen({
      onInterim: setHeard,
      onDone: (t) => {
        setHeard(t);
        setMicTest(t ? 'ok' : 'error');
      },
      onError: () => setMicTest('error'),
      pauseMs: 1500,
    });
  };

  const start = () => {
    listener.current?.cancel();
    saveConfig({ role, length, mode, ai: aiEnabled });
    router.push(PATHS.mockInterviewRoom);
  };

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
          {INTERVIEWER.initials}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Live interview with {INTERVIEWER.name}</Typography>
            <Chip size="small" color="primary" label="New" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {INTERVIEWER.role}. Talks you through a real interview: intro, fundamentals, a live
            coding problem, system design (in the full loop), leadership questions and your
            questions, then gives feedback.
          </Typography>
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Role
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={role}
            onChange={(_, v) => v && setRole(v)}
            sx={{ display: 'flex' }}
          >
            <ToggleButton value="senior">Senior</ToggleButton>
            <ToggleButton value="lead">Lead</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Length
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={length}
            onChange={(_, v) => v && setLength(v)}
            sx={{ display: 'flex' }}
          >
            {(Object.keys(LENGTHS) as InterviewLength[]).map((k) => (
              <ToggleButton key={k} value={k}>
                {LENGTHS[k].label} · {LENGTHS[k].minutes} min
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Answer by
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={mode}
            onChange={(_, v) => v && setMode(v)}
            sx={{ display: 'flex' }}
          >
            <ToggleButton value="voice" disabled={!support.listen}>
              Voice
            </ToggleButton>
            <ToggleButton value="text">Typing</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>

      {!support.listen && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Voice answers need Chrome, Edge or Safari. You can still do the interview by typing.
        </Alert>
      )}

      {mode === 'voice' && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 1, flexWrap: 'wrap', rowGap: 1 }}
        >
          <Button
            size="small"
            startIcon={<VolumeUpRoundedIcon />}
            onClick={() => speak(`Hi, I'm ${INTERVIEWER.name}. Can you hear me?`)}
            disabled={!support.speak}
          >
            Test speaker
          </Button>
          <Button
            size="small"
            startIcon={<MicRoundedIcon />}
            onClick={testMic}
            disabled={micTest === 'listening'}
          >
            {micTest === 'listening' ? 'Say something…' : 'Test microphone'}
          </Button>
          {micTest === 'ok' && (
            <Typography variant="body2" color="success.main">
              We heard: “{heard}”
            </Typography>
          )}
          {micTest === 'listening' && heard && (
            <Typography variant="body2" color="text.secondary">
              {heard}
            </Typography>
          )}
          {micTest === 'error' && (
            <Typography variant="body2" color="error.main">
              We couldn&apos;t hear you. Check microphone permission, or answer by typing.
            </Typography>
          )}
        </Stack>
      )}
      {mode === 'voice' && (
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
          Voice answers use your browser&apos;s speech recognition (in Chrome this is processed by
          Google). We don&apos;t record or store audio; your transcript stays in this browser.
        </Typography>
      )}

      <SmarterInterviewer
        availability={ai.availability}
        enabled={aiEnabled}
        onEnabled={(on) => {
          setAIEnabled(on);
          saveAIEnabled(on);
        }}
        onDownloaded={ai.refresh}
      />

      <Button variant="contained" size="large" startIcon={<PlayArrowRoundedIcon />} onClick={start}>
        Start live interview
      </Button>

      {history.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="baseline" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              Your past live interviews
            </Typography>
            <Link component={NextLink} href={PATHS.mockInterviewReports} variant="body2">
              See all reports
            </Link>
          </Stack>
          <Stack spacing={0.5}>
            {history.slice(0, 5).map((h) => (
              <Stack key={h.id} direction="row" spacing={1} alignItems="center">
                <Link
                  component={NextLink}
                  href={`${PATHS.mockInterviewReports}?id=${encodeURIComponent(h.id)}`}
                  variant="body2"
                  sx={{ flex: 1 }}
                >
                  {h.config.role === 'lead' ? 'Lead' : 'Senior'} ·{' '}
                  {LENGTHS[h.config.length]?.label ?? h.config.length} ·{' '}
                  {new Date(h.at).toLocaleDateString()}
                </Link>
                <Typography variant="body2" fontWeight={700}>
                  {h.report.score}%
                </Typography>
                <Chip size="small" color={h.report.verdict.color} label={h.report.verdict.label} />
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Card>
  );
}

/**
 * Chrome's on-device AI for the interview: a switch when the model is on this device, a one-time
 * download button when Chrome can fetch it, and nothing in other browsers.
 */
function SmarterInterviewer({
  availability,
  enabled,
  onEnabled,
  onDownloaded,
}: {
  availability: 'available' | 'downloadable' | 'unavailable';
  enabled: boolean;
  onEnabled: (on: boolean) => void;
  onDownloaded: () => Promise<void>;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  if (availability === 'unavailable') return null;

  if (availability === 'available')
    return (
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={(e) => onEnabled(e.target.checked)} />}
          label={
            <Stack direction="row" spacing={0.75} alignItems="center">
              <AutoAwesomeRoundedIcon fontSize="small" color="primary" />
              <span>Use on-device AI</span>
            </Stack>
          }
        />
        <Typography variant="caption" color="text.secondary" component="p">
          Follow-up questions about what you actually said, natural answers to your questions, a
          second check of your answers and a written summary. Runs in Chrome on your device: your
          answers never leave this browser.
        </Typography>
      </Box>
    );

  const enable = async () => {
    setFailed(false);
    setProgress(0);
    const ok = await prepareChromeModel(setProgress);
    setProgress(null);
    if (ok) {
      track('ai_enabled', { by: 'chrome' });
      onEnabled(true);
      await onDownloaded();
    } else {
      track('ai_download_failed', { by: 'chrome' });
      setFailed(true);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<AutoAwesomeRoundedIcon />}
        onClick={() => void enable()}
        disabled={progress !== null}
      >
        Enable smarter interviewer
      </Button>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Chrome downloads its on-device AI once (a few GB). Free and private: your answers never
        leave this browser.
      </Typography>
      {progress !== null && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Downloading Chrome&apos;s on-device AI… {Math.round(progress * 100)}%
          </Typography>
          <LinearProgress variant="determinate" value={progress * 100} />
        </Box>
      )}
      {failed && (
        <Alert severity="info" sx={{ mt: 1 }}>
          Chrome couldn&apos;t set up its on-device AI right now. The interview works fine without
          it.
        </Alert>
      )}
    </Box>
  );
}
