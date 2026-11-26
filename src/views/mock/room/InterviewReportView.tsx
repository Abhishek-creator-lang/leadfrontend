'use client';

import NextLink from 'next/link';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { ShareButton } from '@/components/ShareButton';
import { INTERVIEWER } from '@/content/interviewer/script';
import { PATHS } from '@/routes/paths';
import type { InterviewReport, Line } from '@/utils/interview/engine';

const GRADE_LABEL = {
  good: 'Good',
  partial: 'Partial',
  weak: 'Weak',
  dontKnow: "Didn't know",
  skipped: 'Skipped',
} as const;

export function InterviewReportView({
  report,
  transcript,
}: {
  report: InterviewReport;
  transcript: Line[];
}) {
  return (
    <Box sx={{ overflowY: 'auto', flex: 1, p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 820, mx: 'auto' }}>
        <Card sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="overline" color="text.secondary">
            Interview feedback
          </Typography>
          <Typography variant="h2" component="h1" fontWeight={700}>
            {report.score}%
          </Typography>
          <Chip
            color={report.verdict.color}
            label={report.verdict.label}
            sx={{ fontWeight: 700 }}
          />
          <Stack spacing={1.5} sx={{ mt: 3, textAlign: 'left' }}>
            {report.stages
              .filter((s) => s.score !== null)
              .map((s) => (
                <Box key={s.id}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">{s.label}</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {s.score}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={s.score ?? 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
          </Stack>
        </Card>

        <Box
          sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, mb: 3 }}
        >
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              What went well
            </Typography>
            {report.strengths.length ? (
              <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                {report.strengths.map((s) => (
                  <li key={s}>
                    <Typography variant="body2">{s}</Typography>
                  </li>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keep practising: your strengths will show up here.
              </Typography>
            )}
          </Card>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Work on next
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
              {report.gaps.map((g) => (
                <li key={g}>
                  <Typography variant="body2">{g}</Typography>
                </li>
              ))}
            </Box>
          </Card>
        </Box>

        {report.warmup.length > 0 && (
          <Card sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Fundamentals
            </Typography>
            <Stack spacing={1}>
              {report.warmup.map((w) => (
                <Stack key={w.id} direction="row" spacing={1} alignItems="center">
                  <Link component={NextLink} href={`/questions/${w.id}`} sx={{ flex: 1 }}>
                    {w.title}
                  </Link>
                  {w.hinted && <Chip size="small" variant="outlined" label="Hint" />}
                  <Chip
                    size="small"
                    color={
                      w.grade === 'good' ? 'success' : w.grade === 'partial' ? 'warning' : 'default'
                    }
                    label={GRADE_LABEL[w.grade]}
                  />
                </Stack>
              ))}
            </Stack>
          </Card>
        )}

        {report.coding && (
          <Card sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Coding
            </Typography>
            <Link component={NextLink} href={`/questions/${report.coding.id}`}>
              {report.coding.title}
            </Link>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
              <Chip
                size="small"
                color={
                  report.coding.total && report.coding.passed === report.coding.total
                    ? 'success'
                    : 'warning'
                }
                label={
                  report.coding.total
                    ? `Tests ${report.coding.passed}/${report.coding.total}`
                    : 'Tests not run'
                }
              />
              <Chip
                size="small"
                variant="outlined"
                label={report.coding.complexityCorrect ? 'Complexity ✓' : 'Complexity ✗'}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${report.coding.clarifications} clarifying ${report.coding.clarifications === 1 ? 'question' : 'questions'}`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${report.coding.hints} ${report.coding.hints === 1 ? 'hint' : 'hints'}`}
              />
              {report.coding.timedOut && (
                <Chip size="small" color="warning" label="Ran out of time" />
              )}
            </Stack>
          </Card>
        )}

        {report.design && (
          <Card sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              System design
            </Typography>
            <Link component={NextLink} href={`/questions/${report.design.id}`}>
              {report.design.title}
            </Link>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {report.design.steps.map((st) => (
                <Stack key={st.id} direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {st.label}
                    {st.grade !== 'good' && st.missing.length > 0 && (
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}
                        · missed {st.missing.slice(0, 2).join(', ')}
                      </Typography>
                    )}
                  </Typography>
                  <Chip
                    size="small"
                    color={
                      st.grade === 'good'
                        ? 'success'
                        : st.grade === 'partial'
                          ? 'warning'
                          : 'default'
                    }
                    label={
                      st.grade === 'good' ? 'Strong' : st.grade === 'partial' ? 'Partial' : 'Light'
                    }
                  />
                </Stack>
              ))}
            </Stack>
            {report.design.pushbacks.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Handled {report.design.pushbacks.filter((p) => p.good).length} of{' '}
                {report.design.pushbacks.length} pushback{' '}
                {report.design.pushbacks.length === 1 ? 'question' : 'questions'}.
              </Typography>
            )}
          </Card>
        )}

        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography fontWeight={600}>Full transcript</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {transcript.map((l, i) => (
                <Typography key={i} variant="body2">
                  <b>{l.who === 'interviewer' ? INTERVIEWER.name : 'You'}:</b> {l.text}
                </Typography>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Button
            variant="contained"
            startIcon={<ReplayRoundedIcon />}
            component={NextLink}
            href={PATHS.mockInterview}
          >
            Back to mock interviews
          </Button>
          <ShareButton
            title={`I scored ${report.score}% in a lead frontend mock interview`}
            kind="live_interview"
          />
        </Stack>
      </Box>
    </Box>
  );
}
