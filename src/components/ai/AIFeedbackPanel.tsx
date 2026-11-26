'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Markdown } from '@/components/Markdown';
import type { Format } from '@/content/types';
import { track } from '@/lib/analytics';
import { promptStream, type AIAvailability } from '@/lib/builtInAI';
import { AI_SYSTEM_PROMPT, buildFeedbackPrompt, MAX_ANSWER_CHARS } from '@/utils/aiFeedbackPrompt';

/**
 * "Get AI feedback" on a written answer, using Chrome's on-device model. Only rendered when the
 * browser supports it (see useBuiltInAI); nothing is sent to any server.
 */
export default function AIFeedbackPanel({
  availability,
  format,
  title,
  excerpt,
  rubric,
}: {
  availability: Exclude<AIAvailability, 'unavailable'>;
  format: Format;
  title: string;
  excerpt: string;
  rubric: string[];
}) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [download, setDownload] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(false);
    setFeedback('');
    track('ai_feedback', { format });
    try {
      await promptStream(
        AI_SYSTEM_PROMPT,
        buildFeedbackPrompt({ format, title, excerpt, rubric, answer }),
        setFeedback,
        setDownload
      );
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      setDownload(null);
    }
  };

  const placeholder =
    format === 'behavioral'
      ? 'Write your STAR answer the way you would say it.'
      : format === 'system-design'
        ? 'Summarise your design: requirements, architecture, data model, API, trade-offs…'
        : 'Paste your solution and a few lines on your approach and complexity.';

  return (
    <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <AutoAwesomeRoundedIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={600}>
          AI feedback
        </Typography>
        <Chip size="small" label="Experimental · runs on your device" variant="outlined" />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Uses Chrome&apos;s built-in AI. Your answer never leaves this browser.
        {availability === 'downloadable' &&
          ' The first time, Chrome downloads the on-device model, which can take a few minutes.'}
      </Typography>
      <TextField
        multiline
        minRows={4}
        maxRows={14}
        fullWidth
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={placeholder}
        inputProps={{ maxLength: MAX_ANSWER_CHARS, 'aria-label': 'Your answer for AI feedback' }}
        sx={{ mb: 1.5 }}
      />
      <Button
        variant="outlined"
        startIcon={<AutoAwesomeRoundedIcon />}
        onClick={run}
        disabled={busy || answer.trim().length < 40}
      >
        {busy ? 'Thinking…' : 'Get AI feedback'}
      </Button>
      {download !== null && download < 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Downloading the on-device model… {Math.round(download * 100)}%
          </Typography>
          <LinearProgress variant="determinate" value={download * 100} />
        </Box>
      )}
      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Chrome&apos;s built-in AI could not answer right now. Try again, or use the checklist
          above.
        </Alert>
      )}
      {feedback && (
        <Box sx={{ mt: 2 }} aria-live="polite">
          <Markdown>{feedback}</Markdown>
          <Typography variant="caption" color="text.secondary">
            AI feedback can be wrong. Use it as a second opinion, not a verdict.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
