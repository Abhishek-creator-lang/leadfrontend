'use client';

import { useState, type ReactNode } from 'react';
import NextLink from 'next/link';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Skeleton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { ShareButton } from '@/components/ShareButton';
import { INTERVIEWER, ROLE_LABEL } from '@/content/interviewer/script';
import { PATHS } from '@/routes/paths';
import type { BreakdownItem, InterviewReport, Line, StageStatus } from '@/utils/interview/engine';
import { LENGTHS, type LiveInterviewConfig } from '@/utils/interview/plan';

const GRADE_LABEL = {
  good: 'Good',
  partial: 'Partial',
  weak: 'Weak',
  dontKnow: "Didn't know",
  skipped: 'Skipped',
} as const;

const GRADE_COLOR = {
  good: 'success',
  partial: 'warning',
  weak: 'error',
  dontKnow: 'default',
  skipped: 'default',
} as const;

const STATUS: Record<StageStatus, { label: string; color: 'success' | 'warning' | 'default' }> = {
  completed: { label: 'Completed', color: 'success' },
  partial: { label: 'Ended here', color: 'warning' },
  skipped: { label: 'Skipped', color: 'default' },
  notReached: { label: 'Not reached', color: 'default' },
};

const GAPS_SHOWN = 5;

const fmtPoints = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function formatDuration(sec: number | null | undefined): string | null {
  if (sec == null) return null;
  const m = Math.round(sec / 60);
  return m < 1 ? 'under a minute' : `${m} min`;
}

export function InterviewReportView({
  report,
  transcript,
  at,
  config,
  legacy = false,
  readOnly = false,
  onDelete,
  summary = null,
  onWriteSummary,
}: {
  report: InterviewReport;
  transcript?: Line[];
  at?: number;
  config?: LiveInterviewConfig;
  /** Saved by an older version: details were not recorded. */
  legacy?: boolean;
  /** Viewing a saved report (no share button). */
  readOnly?: boolean;
  onDelete?: () => void;
  /** Summary written by Chrome's on-device AI: '' while it is being written, null for none. */
  summary?: string | null;
  /** Offer to write a summary now (saved reports, when the on-device AI is available). */
  onWriteSummary?: () => void;
}) {
  const [allGaps, setAllGaps] = useState(false);
  const meta = [
    config ? ROLE_LABEL[config.role] : null,
    config ? LENGTHS[config.length]?.label : null,
    at ? new Date(at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : null,
    formatDuration(report.durationSec),
  ].filter(Boolean);
  const gaps = allGaps ? report.gaps : report.gaps.slice(0, GAPS_SHOWN);
  const hintRounds = Object.entries(report.hintsByRound ?? {}).filter(([, n]) => n > 0);

  return (
    <Box sx={{ overflowY: 'auto', flex: 1, p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 820, mx: 'auto' }}>
        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary">
              Interview feedback
            </Typography>
            {meta.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {meta.join(' · ')}
              </Typography>
            )}
            <Typography variant="h2" component="h1" fontWeight={700}>
              {report.score}%
            </Typography>
            <Chip
              color={report.verdict.color}
              label={report.verdict.label}
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {summary !== null && (
            <Box
              aria-live="polite"
              sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: 'action.hover', textAlign: 'left' }}
            >
              {summary ? (
                <Typography variant="body2">{summary}</Typography>
              ) : (
                <>
                  <Skeleton width="95%" />
                  <Skeleton width="80%" />
                </>
              )}
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} color="action" />
                <Typography variant="caption" color="text.secondary">
                  {summary
                    ? 'Written on your device by Chrome’s AI. It can be wrong.'
                    : 'Writing a summary on your device…'}
                </Typography>
              </Stack>
            </Box>
          )}
          {summary === null && onWriteSummary && (
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button size="small" startIcon={<AutoAwesomeRoundedIcon />} onClick={onWriteSummary}>
                Write a summary
              </Button>
            </Box>
          )}

          {!report.completed && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You ended the interview during {report.endedDuring?.toLowerCase() ?? 'a round'}.
              Rounds you didn&apos;t reach count as 0 in the overall score
              {report.completedScore !== null &&
                `; across the rounds you did, you scored ${report.completedScore}%`}
              .
            </Alert>
          )}

          <Stack spacing={0.5} sx={{ mt: 3 }}>
            {report.stages.map((s) => (
              <StageRow
                key={s.id}
                label={s.label}
                status={s.status}
                score={s.score}
                breakdown={s.breakdown}
              />
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
            {report.hintsUsed > 0
              ? `Hints you asked for: ${report.hintsUsed} (${hintRounds
                  .map(([k, n]) => `${ROUND_NAME[k] ?? k} ${n}`)
                  .join(', ')}). `
              : 'No hints asked. '}
            Practice estimate from key-point coverage
            {report.checkedBy === 'keywords+ai' ? ', double-checked by Chrome’s on-device AI' : ''},
            not a hiring decision.
          </Typography>
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
                {report.strengths.map((s, i) => (
                  <li key={i}>
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
            {report.gaps.length ? (
              <>
                <Box component="ol" sx={{ pl: 2.5, m: 0 }}>
                  {gaps.map((g, i) => (
                    <li key={i}>
                      <Typography variant="body2">{g}</Typography>
                    </li>
                  ))}
                </Box>
                {report.gaps.length > GAPS_SHOWN && (
                  <Button size="small" onClick={() => setAllGaps((v) => !v)} sx={{ mt: 1 }}>
                    {allGaps ? 'Show fewer' : `Show all ${report.gaps.length}`}
                  </Button>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nothing major. Try the full loop or the lead role next.
              </Typography>
            )}
          </Card>
        </Box>

        {legacy && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Details aren&apos;t available for interviews taken before reports were expanded.
          </Alert>
        )}

        {report.warmup.length > 0 && (
          <Section title="Fundamentals">
            {report.warmup.map((w, i) => (
              <Detail
                key={i}
                title={w.title}
                chips={
                  <>
                    {w.hinted && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={w.hints > 1 ? `${w.hints} hints asked` : 'Hint asked'}
                      />
                    )}
                    <Chip size="small" color={GRADE_COLOR[w.grade]} label={GRADE_LABEL[w.grade]} />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ minWidth: 40, textAlign: 'right' }}
                    >
                      {w.score}%
                    </Typography>
                  </>
                }
              >
                <Labelled label="Your answer">{w.answer || '(no answer)'}</Labelled>
                {(w.hit.length > 0 || w.missing.length > 0) && (
                  <Labelled label="Key points">
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                      {w.hit.map((k) => (
                        <Tooltip key={k} title={w.matched[k] ? `You said: “${w.matched[k]}”` : ''}>
                          <Chip size="small" color="success" variant="outlined" label={`✓ ${k}`} />
                        </Tooltip>
                      ))}
                      {w.contradicted.map((k) => (
                        <Tooltip key={k} title="You said this isn't the case">
                          <Chip size="small" color="warning" variant="outlined" label={`⚠ ${k}`} />
                        </Tooltip>
                      ))}
                      {w.missing
                        .filter((k) => !w.contradicted.includes(k))
                        .map((k) => (
                          <Chip key={k} size="small" variant="outlined" label={`✗ ${k}`} />
                        ))}
                    </Stack>
                  </Labelled>
                )}
                {w.incorrect.length > 0 && (
                  <Labelled label="Possibly wrong (on-device AI)">
                    {w.incorrect.map((x) => `“${x}”`).join(' · ')}
                  </Labelled>
                )}
                {w.summary && <Labelled label="Short answer">{w.summary}</Labelled>}
                {w.id && (
                  <Link component={NextLink} href={`/questions/${w.id}`} variant="body2">
                    Practise this question
                  </Link>
                )}
              </Detail>
            ))}
          </Section>
        )}

        {report.coding && (
          <Section title="Coding">
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
                  report.coding.skipped
                    ? 'Skipped'
                    : report.coding.total
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
                label={`${report.coding.hints} ${report.coding.hints === 1 ? 'hint' : 'hints'} asked`}
              />
              {report.coding.timedOut && (
                <Chip size="small" color="warning" label="Ran out of time" />
              )}
            </Stack>
            <Breakdown items={report.coding.breakdown} />
          </Section>
        )}

        {report.design && (
          <Section title="System design">
            <Link component={NextLink} href={`/questions/${report.design.id}`}>
              {report.design.title}
            </Link>
            <Box sx={{ mt: 1 }}>
              {report.design.steps.map((st, i) => (
                <Detail
                  key={i}
                  title={st.label}
                  chips={
                    <Chip
                      size="small"
                      color={
                        !st.reached
                          ? 'default'
                          : st.grade === 'good'
                            ? 'success'
                            : st.grade === 'partial'
                              ? 'warning'
                              : 'error'
                      }
                      label={
                        !st.reached
                          ? 'Not reached'
                          : st.grade === 'good'
                            ? 'Strong'
                            : st.grade === 'partial'
                              ? 'Partial'
                              : 'Light'
                      }
                    />
                  }
                >
                  <Labelled label="What you said">{st.answer || '(nothing said)'}</Labelled>
                  {st.notes && <Labelled label="Your notes">{st.notes}</Labelled>}
                  {st.hit.length > 0 && <Labelled label="Covered">{st.hit.join(', ')}</Labelled>}
                  {st.missing.length > 0 && (
                    <Labelled label="Also worth covering">{st.missing.join(', ')}</Labelled>
                  )}
                </Detail>
              ))}
              {report.design.pushbacks.map((p, i) => (
                <Detail
                  key={`pb${i}`}
                  title={`Pushback: ${p.q}`}
                  chips={
                    <Chip
                      size="small"
                      color={p.good ? 'success' : 'warning'}
                      label={p.good ? 'Handled' : 'Needs work'}
                    />
                  }
                >
                  <Labelled label="Your answer">{p.answer || '(no answer)'}</Labelled>
                </Detail>
              ))}
            </Box>
            <Breakdown items={report.design.breakdown} />
          </Section>
        )}

        {report.behavioral.length > 0 && (
          <Section title="Leadership">
            {report.behavioral.map((b, i) => (
              <Detail
                key={i}
                title={b.title}
                chips={
                  <Typography variant="body2" fontWeight={700}>
                    {b.score}%
                  </Typography>
                }
              >
                <Labelled label="Your story">
                  {b.noStory ? '(no example given)' : b.answer || '(no answer)'}
                </Labelled>
                {!b.noStory && b.answer && (
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                    {(
                      [
                        ['detail', 'Context'],
                        ['ownership', 'Your own part'],
                        ['result', 'Result'],
                        ['reflection', 'What you learned'],
                      ] as const
                    ).map(([k, label]) => (
                      <Chip
                        key={k}
                        size="small"
                        variant="outlined"
                        color={b.signals[k] ? 'success' : 'default'}
                        label={`${b.signals[k] ? '✓' : '✗'} ${label}`}
                      />
                    ))}
                  </Stack>
                )}
                {b.notes.length > 0 && (
                  <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
                    {b.notes.map((n, j) => (
                      <li key={j}>
                        <Typography variant="body2">{n.text}</Typography>
                      </li>
                    ))}
                  </Box>
                )}
              </Detail>
            ))}
          </Section>
        )}

        {transcript && transcript.length > 0 && (
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
        )}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ flexWrap: 'wrap', rowGap: 1 }}
        >
          <Button
            variant="contained"
            startIcon={<ReplayRoundedIcon />}
            component={NextLink}
            href={PATHS.mockInterview}
          >
            Back to mock interviews
          </Button>
          <Button
            startIcon={<ListAltRoundedIcon />}
            component={NextLink}
            href={PATHS.mockInterviewReports}
          >
            All my reports
          </Button>
          {!readOnly && report.completed && (
            <ShareButton
              title={`I scored ${report.score}% in a lead frontend mock interview`}
              kind="live_interview"
            />
          )}
          {onDelete && (
            <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={onDelete}>
              Delete
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

const ROUND_NAME: Record<string, string> = {
  warmup: 'fundamentals',
  coding: 'coding',
  design: 'design',
  behavioral: 'leadership',
};

function StageRow({
  label,
  status,
  score,
  breakdown,
}: {
  label: string;
  status: StageStatus;
  score: number | null;
  breakdown: BreakdownItem[];
}) {
  const head = (
    <Box sx={{ width: '100%', pr: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" sx={{ flex: 1 }}>
          {label}
        </Typography>
        {status !== 'completed' && (
          <Chip
            size="small"
            variant="outlined"
            color={STATUS[status].color}
            label={STATUS[status].label}
          />
        )}
        <Typography variant="body2" fontWeight={700} sx={{ minWidth: 40, textAlign: 'right' }}>
          {score === null ? '—' : `${score}%`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score ?? 0}
        sx={{ height: 8, borderRadius: 4, mt: 0.5, opacity: score === null ? 0.4 : 1 }}
      />
    </Box>
  );
  if (!breakdown.length) return <Box sx={{ py: 1, pr: 5 }}>{head}</Box>;
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{ '&:before': { display: 'none' }, bgcolor: 'transparent' }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        aria-label={`How ${label} was scored`}
        sx={{ px: 0, '& .MuiAccordionSummary-content': { my: 1 } }}
      >
        {head}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0 }}>
        <Typography variant="caption" color="text.secondary">
          How this was scored
        </Typography>
        <Breakdown items={breakdown} />
      </AccordionDetails>
    </Accordion>
  );
}

function Breakdown({ items }: { items: BreakdownItem[] }) {
  if (!items.length) return null;
  return (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mt: 1 }}>
      <tbody>
        {items.map((x, i) => (
          <Box component="tr" key={i} sx={{ borderTop: 1, borderColor: 'divider' }}>
            <Box component="td" sx={{ py: 0.5 }}>
              <Typography variant="body2">{x.label}</Typography>
            </Box>
            <Box component="td" sx={{ py: 0.5, textAlign: 'right', whiteSpace: 'nowrap' }}>
              <Typography
                variant="body2"
                fontFamily="var(--font-mono)"
                color={
                  x.points < 0 ? 'error.main' : x.points < x.max ? 'text.secondary' : 'text.primary'
                }
              >
                {x.max ? `${fmtPoints(x.points)} / ${fmtPoints(x.max)}` : fmtPoints(x.points)}
              </Typography>
            </Box>
          </Box>
        ))}
      </tbody>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Card>
  );
}

function Detail({
  title,
  chips,
  children,
}: {
  title: string;
  chips: ReactNode;
  children: ReactNode;
}) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{ '&:before': { display: 'none' }, borderTop: 1, borderColor: 'divider' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', pr: 1 }}>
          <Typography variant="body2" sx={{ flex: 1 }}>
            {title}
          </Typography>
          {chips}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0 }}>
        <Stack spacing={1}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div">
        {children}
      </Typography>
    </Box>
  );
}
