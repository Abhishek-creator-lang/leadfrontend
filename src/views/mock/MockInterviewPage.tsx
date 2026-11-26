'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { DifficultyChip, FormatChip } from '@/components/Chips';
import { ShareButton } from '@/components/ShareButton';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { PAGE_TITLES } from '@/constants/navigation';
import { useContent } from '@/context/ContentContext';
import { useMockInterview } from '@/context/MockInterviewContext';
import { FORMAT_INFO } from '@/content/formats';
import { useNow } from '@/hooks/useNow';
import { Page, PageHeader } from '@/layout/Page';
import { questionPath } from '@/routes/paths';
import { useAppSelector } from '@/store';
import {
  formatClock,
  MOCK_TRACKS,
  roundScore,
  RUBRICS,
  secondsLeft,
  sessionScore,
  verdict,
  type MockSession,
  type MockTrackId,
} from '@/utils/mockInterview';

const plain = (t: string) => t.replace(/`/g, '');

function Setup() {
  const { content } = useContent();
  const { start, history } = useMockInterview();
  const completed = useAppSelector((s) => s.progress.completed);
  const [trackId, setTrackId] = useState<MockTrackId>('lead');
  const [company, setCompany] = useState('');
  const track = MOCK_TRACKS[trackId];
  const total = track.rounds.reduce((sum, r) => sum + r.minutes, 0);

  return (
    <>
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Choose your loop
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={trackId}
          onChange={(_, v) => v && setTrackId(v)}
          sx={{ mb: 2, flexWrap: 'wrap' }}
        >
          {Object.values(MOCK_TRACKS).map((t) => (
            <ToggleButton key={t.id} value={t.id}>
              {t.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {track.description} About {total} minutes.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1 }}>
          {track.rounds.map((r, i) => (
            <Chip key={i} label={`${i + 1}. ${FORMAT_INFO[r.format].short} · ${r.minutes} min`} />
          ))}
        </Stack>
        <TextField
          select
          label="Target company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          sx={{ minWidth: 260, mb: 3 }}
          helperText="Prefers questions reported at this company when there are any."
        >
          <MenuItem value="">Any company</MenuItem>
          {content.companies.map((c) => (
            <MenuItem key={c.slug} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={() => start(trackId, { company: company || null, completed })}
            disabled={!content.questions.length}
          >
            Start mock interview
          </Button>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ mb: 1 }}>
        How it works
      </Typography>
      <Typography component="ol" color="text.secondary" sx={{ pl: 3, mb: 4 }}>
        <li>Each round gives you a question and a timer, like the real interview.</li>
        <li>Solve it in the workspace. Talk out loud as if an interviewer were listening.</li>
        <li>
          Grade yourself honestly against the checklist a lead-level interviewer uses. You get a
          scorecard at the end.
        </li>
      </Typography>

      {history.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Past mock interviews
          </Typography>
          <Stack spacing={1}>
            {history.map((s) => {
              const score = sessionScore(s);
              const v = verdict(score);
              return (
                <Card key={s.id} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{ flex: 1 }}>
                      {MOCK_TRACKS[s.track].label}
                      {s.company ? ` · ${s.company}` : ''} ·{' '}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography fontWeight={700}>{score}%</Typography>
                    <Chip size="small" color={v.color} label={v.label} />
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </>
      )}
    </>
  );
}

function ActiveRound({ session }: { session: MockSession }) {
  const { getQuestion } = useContent();
  const { startRound, toggleCheck, finishRound, close } = useMockInterview();
  const round = session.rounds[session.current];
  const q = getQuestion(round.questionId);
  const now = useNow(Boolean(round.startedAt));
  const left = secondsLeft(round, now);
  const rubric = RUBRICS[round.format];

  return (
    <>
      <LinearProgress
        variant="determinate"
        value={(session.current / session.rounds.length) * 100}
        sx={{ mb: 3, height: 6, borderRadius: 3 }}
      />
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ flex: 1 }}>
            Round {session.current + 1} of {session.rounds.length} · {round.minutes} min
          </Typography>
          <Typography
            variant="h5"
            fontFamily="var(--font-mono)"
            color={left < 0 ? 'error.main' : left < 120 ? 'warning.main' : 'text.primary'}
            aria-live="off"
          >
            {formatClock(left)}
          </Typography>
        </Stack>
        {q ? (
          <>
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              {plain(q.title)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <FormatChip format={q.format} />
              <DifficultyChip difficulty={q.difficulty} />
            </Stack>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {q.excerpt}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
              {!round.startedAt ? (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={startRound}
                >
                  Start round and timer
                </Button>
              ) : (
                <Button
                  variant="contained"
                  component={NextLink}
                  href={questionPath(q)}
                  endIcon={<OpenInNewRoundedIcon />}
                >
                  Open in workspace
                </Button>
              )}
            </Stack>
          </>
        ) : (
          <Alert severity="warning">
            This question is no longer available. Grade it as skipped.
          </Alert>
        )}
      </Card>

      {round.startedAt && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Grade yourself</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Tick only what you actually did. This is what a lead-level interviewer looks for.
          </Typography>
          <Stack>
            {rubric.map((item, i) => (
              <FormControlLabel
                key={item}
                control={
                  <Checkbox checked={round.checked.includes(i)} onChange={() => toggleCheck(i)} />
                }
                label={item}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={finishRound}>
              {session.current === session.rounds.length - 1 ? 'Finish interview' : 'Next round'}
            </Button>
            <Typography color="text.secondary">Round score: {roundScore(round)}%</Typography>
          </Stack>
        </Card>
      )}

      <Button color="inherit" onClick={close}>
        Quit mock interview
      </Button>
    </>
  );
}

function Scorecard({ session }: { session: MockSession }) {
  const { getQuestion } = useContent();
  const { close } = useMockInterview();
  const score = sessionScore(session);
  const v = verdict(score);

  return (
    <>
      <Card sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="overline" color="text.secondary">
          {MOCK_TRACKS[session.track].label} scorecard
        </Typography>
        <Typography variant="h2" component="p" fontWeight={700}>
          {score}%
        </Typography>
        <Chip color={v.color} label={v.label} sx={{ mt: 1, fontWeight: 700 }} />
      </Card>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {session.rounds.map((r, i) => {
          const q = getQuestion(r.questionId);
          const used = r.minutes * 60 - secondsLeft(r, r.endedAt ?? Date.now());
          const weakest = RUBRICS[r.format].filter((_, idx) => !r.checked.includes(idx));
          return (
            <Card key={i} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={600} noWrap>
                    {i + 1}. {q ? plain(q.title) : 'Unavailable question'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {FORMAT_INFO[r.format].short} · {formatClock(used)} of {r.minutes}:00
                  </Typography>
                </Box>
                <Typography fontWeight={700}>{roundScore(r)}%</Typography>
              </Stack>
              {weakest.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Work on: {weakest.slice(0, 3).join('; ')}
                </Typography>
              )}
            </Card>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="contained" startIcon={<ReplayRoundedIcon />} onClick={close}>
          New mock interview
        </Button>
        <ShareButton title={`I scored ${score}% on a lead frontend mock interview`} kind="mock" />
      </Stack>
    </>
  );
}

export default function MockInterviewPage() {
  const { ready, session } = useMockInterview();
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.form}>
      <PageHeader
        title={PAGE_TITLES.mockInterview}
        subtitle="A timed, realistic senior and lead frontend interview loop. Free, private, runs in your browser."
      />
      {!ready ? null : !session ? (
        <Setup />
      ) : session.finishedAt ? (
        <Scorecard session={session} />
      ) : (
        <ActiveRound session={session} />
      )}
    </Page>
  );
}
