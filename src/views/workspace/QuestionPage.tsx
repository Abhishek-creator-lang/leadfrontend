'use client';

import { useEffect } from 'react';
import { Box } from '@mui/material';
import { FULL_HEIGHT_BELOW_APP_BAR } from '@/constants/layout';
import { isCodingFormat } from '@/content/formats';
import { useProgressHydrated } from '@/context/ProgressHydrationContext';
import type { QuestionMeta } from '@/content/types';
import { useAppDispatch } from '@/store';
import { visit } from '@/store/progressSlice';
import { FileMap } from '@/utils/files';
import { CodingLayout } from './CodingLayout';
import { QuestionHeader } from './QuestionHeader';
import { ReaderLayout } from './ReaderLayout';

/** `files` (prompt, solution, starter, tests) are read on the server and passed in. */
export default function QuestionPage({ q, files }: { q: QuestionMeta; files: FileMap }) {
  const dispatch = useAppDispatch();
  const hydrated = useProgressHydrated();

  // Record the visit after stored progress is loaded, otherwise loading it would discard the visit.
  useEffect(() => {
    if (hydrated) dispatch(visit(q.id));
  }, [q.id, hydrated, dispatch]);

  const Layout = isCodingFormat(q.format) ? CodingLayout : ReaderLayout;

  return (
    <Box sx={{ height: FULL_HEIGHT_BELOW_APP_BAR, display: 'flex', flexDirection: 'column' }}>
      <QuestionHeader q={q} />
      <Layout key={q.id} q={q} files={files} />
    </Box>
  );
}
