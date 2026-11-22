'use client';

import NextLink from 'next/link';
import { Box, Button, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { EmptyState } from '@/components/EmptyState';
import { Markdown } from '@/components/Markdown';
import { SourceNote } from '@/components/SourceNote';
import { APP_BAR_HEIGHT, CONTENT_MAX_WIDTH, FULL_HEIGHT_BELOW_APP_BAR } from '@/constants/layout';
import { useContent } from '@/context/ContentContext';
import { guidePath } from '@/routes/paths';

const TOC_WIDTH = 280;

/** `md` is loaded on the server; `null` means the chapter file was not found. */
export default function GuideChapterPage({
  guideId,
  chapter,
  md,
}: {
  guideId: string;
  chapter: string;
  md: string | null;
}) {
  const { getGuide } = useContent();
  const guide = getGuide(guideId);
  if (!guide) return <EmptyState title="Guide not found" />;

  const idx = guide.chapters.findIndex((c) => c.slug === chapter);
  const current = guide.chapters[idx];
  const prev = guide.chapters[idx - 1];
  const next = guide.chapters[idx + 1];

  return (
    <Box sx={{ display: 'flex', maxWidth: CONTENT_MAX_WIDTH.wide, mx: 'auto' }}>
      <Box
        component="nav"
        aria-label={`${guide.title} chapters`}
        sx={{
          width: TOC_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          borderRight: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: APP_BAR_HEIGHT,
          alignSelf: 'flex-start',
          maxHeight: FULL_HEIGHT_BELOW_APP_BAR,
          overflowY: 'auto',
          p: 2,
        }}
      >
        <Typography variant="overline" color="text.secondary">
          {guide.title}
        </Typography>
        <List dense>
          {guide.chapters.map((c, i) => (
            <ListItemButton
              key={c.slug}
              component={NextLink}
              href={guidePath(guide.id, c.slug)}
              selected={c.slug === chapter}
            >
              <ListItemText
                primary={`${i + 1}. ${c.title}`}
                primaryTypographyProps={{ fontSize: 14 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, md: 6 },
          py: 4,
          maxWidth: CONTENT_MAX_WIDTH.reading,
        }}
      >
        {md === null || !current ? (
          <EmptyState title="Chapter not found" />
        ) : (
          <>
            <Typography variant="overline" color="text.secondary">
              {guide.title} · Chapter {idx + 1} of {guide.chapters.length}
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              {current.title}
            </Typography>
            <Markdown>{md}</Markdown>
            <SourceNote source={current.source} />
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}
            >
              {prev ? (
                <Button
                  component={NextLink}
                  href={guidePath(guide.id, prev.slug)}
                  startIcon={<ArrowBackRoundedIcon />}
                >
                  {prev.title}
                </Button>
              ) : (
                <span />
              )}
              {next && (
                <Button
                  component={NextLink}
                  href={guidePath(guide.id, next.slug)}
                  endIcon={<ArrowForwardRoundedIcon />}
                >
                  {next.title}
                </Button>
              )}
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
}
