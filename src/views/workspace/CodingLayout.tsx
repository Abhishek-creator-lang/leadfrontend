'use client';

import { useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Alert, Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import { Markdown } from '@/components/Markdown';
import { SourceNote } from '@/components/SourceNote';
import type { QuestionMeta } from '@/content/types';
import { useProgressHydrated } from '@/context/ProgressHydrationContext';
import { ThemeModeContext } from '@/context/ThemeModeContext';
import { FileMap, solutionCodeMarkdown } from '@/utils/files';
import { MetaLine } from './MetaLine';
import { NotesTab } from './NotesTab';
import { References } from './References';
import { SplitPane } from './SplitPane';

const WorkspaceLoading = () => (
  <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
    <CircularProgress />
  </Box>
);

// Sandpack touches browser APIs on mount; render it on the client only.
const CodeWorkspace = dynamic(() => import('./CodeWorkspace').then((m) => m.CodeWorkspace), {
  ssr: false,
  loading: WorkspaceLoading,
});

const TABS = ['Description', 'Solution', 'Notes'] as const;

/** Prompt / solution / notes on the left, Sandpack editor on the right. */
export function CodingLayout({ q, files }: { q: QuestionMeta; files: FileMap }) {
  const [tab, setTab] = useState(0);
  const { mode } = useContext(ThemeModeContext);
  const hydrated = useProgressHydrated();
  const solutionMd = useMemo(
    () => `${files['solution.md'] ?? ''}\n\n## Reference code\n\n${solutionCodeMarkdown(files)}`,
    [files]
  );

  return (
    <SplitPane
      left={
        <Box>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              px: 2,
              borderBottom: 1,
              borderColor: 'divider',
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 1,
            }}
          >
            {TABS.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          <Box sx={{ p: 3 }}>
            {tab === 0 && (
              <>
                <Typography variant="h5" component="h1" fontWeight={800} gutterBottom>
                  {q.title}
                </Typography>
                <MetaLine q={q} />
                <Markdown>{files['prompt.md'] ?? ''}</Markdown>
                <SourceNote source={q.source} />
              </>
            )}
            {tab === 1 && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Try it yourself first. Interviewers care more about your reasoning than a
                  memorized answer.
                </Alert>
                <Markdown>{solutionMd}</Markdown>
                <References q={q} />
              </>
            )}
            {tab === 2 && <NotesTab id={q.id} />}
          </Box>
        </Box>
      }
      right={
        // The editor is seeded once from the saved draft, so wait until drafts are loaded.
        hydrated ? (
          <CodeWorkspace q={q} files={files} dark={mode === 'dark'} />
        ) : (
          <WorkspaceLoading />
        )
      }
    />
  );
}
