'use client';

import { ReactNode, useMemo } from 'react';
import NextLink from 'next/link';
import {
  Breadcrumbs,
  Button,
  Divider,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { questionsByFormat } from '@/content';
import { FORMAT_INFO } from '@/content/formats';
import type { QuestionMeta } from '@/content/types';
import { formatPath, questionPath } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleBookmark, toggleComplete } from '@/store/progressSlice';

/** Prev/next arrow: a link when there is a sibling, otherwise a disabled button (no `href="#"`). */
function SiblingLink({
  sibling,
  direction,
  icon,
}: {
  sibling?: QuestionMeta;
  direction: 'Previous' | 'Next';
  icon: ReactNode;
}) {
  const label = `${direction} question`;
  return (
    <Tooltip title={sibling ? `${direction}: ${sibling.title}` : ''}>
      <span>
        {sibling ? (
          <IconButton component={NextLink} href={questionPath(sibling)} aria-label={label}>
            {icon}
          </IconButton>
        ) : (
          <IconButton disabled aria-label={label}>
            {icon}
          </IconButton>
        )}
      </span>
    </Tooltip>
  );
}

/** Breadcrumb, bookmark/complete toggles and prev/next navigation within the question's format. */
export function QuestionHeader({ q }: { q: QuestionMeta }) {
  const dispatch = useAppDispatch();
  const done = useAppSelector((s) => !!s.progress.completed[q.id]);
  const bookmarked = useAppSelector((s) => !!s.progress.bookmarked[q.id]);
  const siblings = useMemo(() => questionsByFormat(q.format), [q.format]);
  const idx = siblings.findIndex((s) => s.id === q.id);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexWrap: 'wrap',
        rowGap: 1,
      }}
    >
      <Breadcrumbs sx={{ flex: 1, minWidth: 0 }}>
        <Link
          component={NextLink}
          href={formatPath(q.format)}
          underline="hover"
          color="text.secondary"
        >
          {FORMAT_INFO[q.format].short}
        </Link>
        <Typography color="text.primary" fontWeight={600} noWrap>
          {q.title}
        </Typography>
      </Breadcrumbs>
      <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <IconButton
          onClick={() => dispatch(toggleBookmark(q.id))}
          aria-label="Bookmark"
          aria-pressed={bookmarked}
        >
          {bookmarked ? <BookmarkRoundedIcon color="primary" /> : <BookmarkBorderRoundedIcon />}
        </IconButton>
      </Tooltip>
      <Button
        variant={done ? 'contained' : 'outlined'}
        color="success"
        startIcon={<CheckCircleRoundedIcon />}
        onClick={() => dispatch(toggleComplete(q.id))}
      >
        {done ? 'Completed' : 'Mark complete'}
      </Button>
      <Divider orientation="vertical" flexItem />
      <SiblingLink
        sibling={siblings[idx - 1]}
        direction="Previous"
        icon={<ChevronLeftRoundedIcon />}
      />
      <Typography variant="caption" color="text.secondary">
        {idx + 1}/{siblings.length}
      </Typography>
      <SiblingLink
        sibling={siblings[idx + 1]}
        direction="Next"
        icon={<ChevronRightRoundedIcon />}
      />
    </Stack>
  );
}
