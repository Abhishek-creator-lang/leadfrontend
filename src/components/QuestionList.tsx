'use client';

import NextLink from 'next/link';
import { Box, Card, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import type { QuestionMeta } from '@/content/types';
import { questionPath } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleComplete } from '@/store/progressSlice';
import { DifficultyChip, FormatChip } from './Chips';
import { DurationLabel } from './DurationLabel';
import { EmptyState } from './EmptyState';

export function QuestionRow({ q, index }: { q: QuestionMeta; index?: number }) {
  const dispatch = useAppDispatch();
  const done = useAppSelector((s) => !!s.progress.completed[q.id]);
  const bookmarked = useAppSelector((s) => !!s.progress.bookmarked[q.id]);
  const toggleLabel = done ? 'Mark as not completed' : 'Mark as completed';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        '&:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Tooltip title={toggleLabel}>
        <IconButton
          size="small"
          onClick={() => dispatch(toggleComplete(q.id))}
          aria-label={toggleLabel}
        >
          {done ? (
            <CheckCircleRoundedIcon color="success" />
          ) : (
            <RadioButtonUncheckedRoundedIcon sx={{ color: 'text.disabled' }} />
          )}
        </IconButton>
      </Tooltip>
      <Box
        component={NextLink}
        href={questionPath(q)}
        sx={{ flex: 1, minWidth: 0, color: 'inherit', textDecoration: 'none' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight={600} noWrap>
            {index !== undefined && (
              <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                {index + 1}.
              </Box>
            )}
            {q.title}
          </Typography>
          {bookmarked && <BookmarkRoundedIcon fontSize="small" color="primary" />}
        </Stack>
        <Typography variant="body2" color="text.secondary" noWrap>
          {q.excerpt}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0 }}
      >
        <FormatChip format={q.format} quizCategory={q.quizCategory} />
        <DifficultyChip difficulty={q.difficulty} />
        <DurationLabel minutes={q.duration} sx={{ width: 64 }} />
      </Stack>
    </Box>
  );
}

export function QuestionList({
  questions,
  numbered,
}: {
  questions: QuestionMeta[];
  numbered?: boolean;
}) {
  if (!questions.length) {
    return <EmptyState title="No questions match" description="Try clearing some filters." />;
  }
  return (
    <Card>
      {questions.map((q, i) => (
        <QuestionRow key={q.id} q={q} index={numbered ? i : undefined} />
      ))}
    </Card>
  );
}
