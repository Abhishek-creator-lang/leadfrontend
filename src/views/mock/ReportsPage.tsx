'use client';

import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Card, Chip, Link, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { Page, PageHeader } from '@/layout/Page';
import { PATHS } from '@/routes/paths';
import { LENGTHS } from '@/utils/interview/plan';
import { deleteRecord, loadHistory, type LiveInterviewRecord } from './room/liveStore';
import { formatDuration, InterviewReportView } from './room/InterviewReportView';

const reportHref = (id: string) => `${PATHS.mockInterviewReports}?id=${encodeURIComponent(id)}`;

/** Every saved live interview (kept in this browser), with trends and the full report of each. */
export default function ReportsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id');
  const [history, setHistory] = useState<LiveInterviewRecord[] | null>(null);

  useEffect(() => setHistory(loadHistory()), []);

  if (history === null) return null;

  const remove = (rid: string) => {
    if (!window.confirm('Delete this interview report? This cannot be undone.')) return;
    deleteRecord(rid);
    setHistory(loadHistory());
    if (id) router.push(PATHS.mockInterviewReports);
  };

  if (id) {
    const rec = history.find((r) => r.id === id);
    if (!rec)
      return (
        <Page maxWidth={CONTENT_MAX_WIDTH.form}>
          <Alert severity="info" sx={{ mt: 2 }}>
            This report isn&apos;t saved in this browser.{' '}
            <Link component={NextLink} href={PATHS.mockInterviewReports}>
              See all your reports
            </Link>
            .
          </Alert>
        </Page>
      );
    return (
      <InterviewReportView
        report={rec.report}
        transcript={rec.transcript}
        at={rec.at}
        config={rec.config}
        legacy={rec.legacy}
        readOnly
        onDelete={() => remove(rec.id)}
      />
    );
  }

  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.form}>
      <PageHeader
        title="Your interview reports"
        subtitle="Every live mock interview you've taken, saved only in this browser."
      />
      {history.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ mb: 2 }}>No interviews yet.</Typography>
          <Button
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            component={NextLink}
            href={PATHS.mockInterview}
          >
            Take a live interview
          </Button>
        </Card>
      ) : (
        <>
          <Summary history={history} />
          <Card sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              All interviews
            </Typography>
            <Stack divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
              {history.map((h) => (
                <Stack
                  key={h.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ py: 1, flexWrap: 'wrap', rowGap: 0.5 }}
                >
                  <Link
                    component={NextLink}
                    href={reportHref(h.id)}
                    variant="body2"
                    sx={{ flex: 1, minWidth: 180 }}
                  >
                    {new Date(h.at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                    {' · '}
                    {h.config.role === 'lead' ? 'Lead' : 'Senior'} ·{' '}
                    {LENGTHS[h.config.length]?.label ?? h.config.length}
                    {formatDuration(h.report.durationSec)
                      ? ` · ${formatDuration(h.report.durationSec)}`
                      : ''}
                  </Link>
                  {!h.report.completed && (
                    <Chip size="small" variant="outlined" color="warning" label="Ended early" />
                  )}
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ minWidth: 40, textAlign: 'right' }}
                  >
                    {h.report.score}%
                  </Typography>
                  <Chip
                    size="small"
                    color={h.report.verdict.color}
                    label={h.report.verdict.label}
                  />
                </Stack>
              ))}
            </Stack>
          </Card>
        </>
      )}
    </Page>
  );
}

/** Trend of overall scores, average per round, and the fundamentals key points missed most. */
function Summary({ history }: { history: LiveInterviewRecord[] }) {
  const stats = useMemo(() => {
    const rounds = new Map<string, { label: string; total: number; n: number }>();
    const missed = new Map<string, { count: number; id: string; title: string }>();
    for (const h of history) {
      for (const s of h.report.stages) {
        if (s.score === null || s.status === 'notReached') continue;
        const r = rounds.get(s.id) ?? { label: s.label, total: 0, n: 0 };
        r.total += s.score;
        r.n++;
        rounds.set(s.id, r);
      }
      for (const w of h.report.warmup) {
        if (w.grade === 'good' || !w.id) continue;
        const m = missed.get(w.id) ?? { count: 0, id: w.id, title: w.title };
        m.count++;
        missed.set(w.id, m);
      }
    }
    return {
      rounds: [...rounds.values()].map((r) => ({ label: r.label, avg: Math.round(r.total / r.n) })),
      missed: [...missed.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    };
  }, [history]);

  const completed = history.filter((h) => h.report.completed);
  const best = completed.length ? Math.max(...completed.map((h) => h.report.score)) : null;

  return (
    <Card sx={{ p: 2.5, mb: 3 }}>
      <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <Stat label="Interviews" value={String(history.length)} />
        <Stat label="Completed" value={String(completed.length)} />
        {best !== null && <Stat label="Best score" value={`${best}%`} />}
        <Stat label="Latest" value={`${history[0].report.score}%`} />
      </Stack>
      {history.length >= 2 && <ScoreTrend history={[...history].reverse()} />}
      {stats.rounds.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Average by round
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
              gap: 1,
            }}
          >
            {stats.rounds.map((r) => (
              <Typography key={r.label} variant="body2">
                {r.label}: <b>{r.avg}%</b>
              </Typography>
            ))}
          </Box>
        </Box>
      )}
      {stats.missed.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Fundamentals to revisit
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
            {stats.missed.map((m) => (
              <li key={m.id}>
                <Link component={NextLink} href={`/questions/${m.id}`} variant="body2">
                  {m.title}
                </Link>
                {m.count > 1 && (
                  <Typography component="span" variant="body2" color="text.secondary">
                    {' '}
                    · missed {m.count} times
                  </Typography>
                )}
              </li>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
}

/** Overall score per interview, oldest to newest. One series: the title names it, no legend. */
function ScoreTrend({ history }: { history: LiveInterviewRecord[] }) {
  const theme = useTheme();
  const W = 600;
  const H = 140;
  const pad = { l: 32, r: 12, t: 10, b: 10 };
  const x = (i: number) =>
    pad.l + (history.length === 1 ? 0 : (i / (history.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - v / 100) * (H - pad.t - pad.b);
  const points = history.map((h, i) => [x(i), y(h.report.score)] as const);
  const line = theme.palette.primary.main;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Overall score over time
      </Typography>
      <Box
        component="svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Overall score over your last ${history.length} interviews, from ${history[0].report.score}% to ${history[history.length - 1].report.score}%`}
        sx={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(v)}
              y2={y(v)}
              stroke={theme.palette.divider}
              strokeWidth={1}
            />
            <text
              x={pad.l - 6}
              y={y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill={theme.palette.text.secondary}
            >
              {v}
            </text>
          </g>
        ))}
        <polyline
          points={points.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={line}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {history.map((h, i) => (
          <Tooltip
            key={h.id}
            title={`${new Date(h.at).toLocaleDateString()} · ${h.report.score}%${h.report.completed ? '' : ' (ended early)'}`}
          >
            <g style={{ cursor: 'pointer' }}>
              <circle cx={points[i][0]} cy={points[i][1]} r={14} fill="transparent" />
              <circle
                cx={points[i][0]}
                cy={points[i][1]}
                r={4}
                fill={h.report.completed ? line : theme.palette.background.paper}
                stroke={h.report.completed ? theme.palette.background.paper : line}
                strokeWidth={2}
              />
            </g>
          </Tooltip>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">
        Hollow points ended early.
      </Typography>
    </Box>
  );
}
