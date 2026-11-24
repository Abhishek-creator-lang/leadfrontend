'use client';

import type { ReactNode } from 'react';
import { Box, Grid, Skeleton, Stack } from '@mui/material';
import { CONTENT_MAX_WIDTH, FULL_HEIGHT_BELOW_APP_BAR } from '@/constants/layout';
import { Page } from '@/layout/Page';

/**
 * Route-level loading placeholders (used by `loading.tsx`). Each mirrors the real page's outer
 * layout (widths, header, spacing) so nothing jumps when the content streams in.
 */

/** Screen readers get one status message instead of a pile of empty shapes. */
function Busy({ children }: { children: ReactNode }) {
  return (
    <Box role="status" aria-busy="true" aria-label="Loading">
      {children}
    </Box>
  );
}

function HeaderSkeleton({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="text" sx={{ fontSize: '2.125rem', width: '40%', maxWidth: 360 }} />
      {subtitle && <Skeleton variant="text" sx={{ width: '65%', maxWidth: 560 }} />}
    </Box>
  );
}

function RowsSkeleton({ rows }: { rows: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} variant="rounded" height={56} />
      ))}
    </Stack>
  );
}

/** Header, filter bar and a list of rows: question lists, bookmarks, study plan / focus area detail. */
export function ListPageSkeleton({
  maxWidth = CONTENT_MAX_WIDTH.default,
  filters = false,
  rows = 8,
}: {
  maxWidth?: number;
  filters?: boolean;
  rows?: number;
}) {
  return (
    <Busy>
      <Page maxWidth={maxWidth}>
        <HeaderSkeleton />
        {filters && (
          <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
            <Skeleton variant="rounded" height={40} sx={{ flex: '1 1 240px' }} />
            {[140, 140, 140].map((w, i) => (
              <Skeleton key={i} variant="rounded" width={w} height={40} />
            ))}
          </Stack>
        )}
        <RowsSkeleton rows={rows} />
      </Page>
    </Busy>
  );
}

/** Header and a grid of cards: guides, study plans, focus areas, companies, dashboard. */
export function CardGridSkeleton({
  panel = false,
  cards = 6,
}: {
  panel?: boolean;
  cards?: number;
}) {
  return (
    <Busy>
      <Page>
        {panel ? <Skeleton variant="rounded" height={180} sx={{ mb: 5 }} /> : <HeaderSkeleton />}
        <Grid container spacing={2}>
          {Array.from({ length: cards }, (_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      </Page>
    </Busy>
  );
}

function ParagraphsSkeleton({ paragraphs = 4 }: { paragraphs?: number }) {
  return (
    <Stack spacing={3}>
      {Array.from({ length: paragraphs }, (_, i) => (
        <Box key={i}>
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" sx={{ width: '70%' }} />
        </Box>
      ))}
    </Stack>
  );
}

/** Reading-width title and paragraphs: company guides, legal pages and other text pages. */
export function ArticleSkeleton({ maxWidth = CONTENT_MAX_WIDTH.reading }: { maxWidth?: number }) {
  return (
    <Busy>
      <Page maxWidth={maxWidth}>
        <HeaderSkeleton subtitle={false} />
        <ParagraphsSkeleton />
      </Page>
    </Busy>
  );
}

/** Guide chapter: chapter list on the left (desktop) and the reading column. */
export function GuideChapterSkeleton() {
  return (
    <Busy>
      <Box sx={{ display: 'flex', maxWidth: CONTENT_MAX_WIDTH.wide, mx: 'auto' }}>
        <Stack
          spacing={1}
          sx={{ display: { xs: 'none', md: 'flex' }, width: 260, flexShrink: 0, p: 3 }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={32} />
          ))}
        </Stack>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: CONTENT_MAX_WIDTH.reading,
            px: { xs: 2, md: 4 },
            py: { xs: 3, md: 4 },
          }}
        >
          <HeaderSkeleton subtitle={false} />
          <ParagraphsSkeleton paragraphs={5} />
        </Box>
      </Box>
    </Busy>
  );
}

/** Question workspace: header bar, then the description pane and the editor / answer pane. */
export function WorkspaceSkeleton() {
  return (
    <Busy>
      <Box sx={{ height: FULL_HEIGHT_BELOW_APP_BAR, display: 'flex', flexDirection: 'column' }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ px: 3, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Skeleton variant="text" sx={{ width: 220, fontSize: '1.25rem' }} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="rounded" width={150} height={36} />
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <Box sx={{ flex: 1, minWidth: 0, p: 3, borderRight: { md: 1 }, borderColor: 'divider' }}>
            <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
              {[90, 70, 60].map((w, i) => (
                <Skeleton key={i} variant="text" width={w} />
              ))}
            </Stack>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '45%', mb: 2 }} />
            <ParagraphsSkeleton paragraphs={3} />
            <Skeleton variant="rounded" height={120} sx={{ mt: 3 }} />
          </Box>
          <Box sx={{ flex: 1.2, minWidth: 0, display: { xs: 'none', md: 'block' }, p: 2 }}>
            <Skeleton variant="rounded" height="100%" />
          </Box>
        </Box>
      </Box>
    </Busy>
  );
}
