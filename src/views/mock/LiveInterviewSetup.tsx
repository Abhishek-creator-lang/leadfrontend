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
  Link,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { INTERVIEWER, type InterviewRole } from '@/content/interviewer/script';
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

  useEffect(() => {
    const s = speechSupport();
    setSupport(s);
    if (s.listen) setMode('voice');
    setHistory(loadHistory());
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
    saveConfig({ role, length, mode });
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
