'use client';

import { useState } from 'react';
import { Box, Button, Divider, Tab, Tabs, Typography } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Markdown } from '@/components/Markdown';
import { SourceNote } from '@/components/SourceNote';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import type { QuestionMeta } from '@/content/types';
import { FileMap } from '@/utils/files';
import { MetaLine } from './MetaLine';
import { NotesTab } from './NotesTab';
import { References } from './References';
import { RelatedQuestions } from './RelatedQuestions';

/** Single-column layout for quiz, system design and behavioral questions. */
export function ReaderLayout({ q, files }: { q: QuestionMeta; files: FileMap }) {
  // Behavioral answers start hidden so the reader drafts their own first.
  // The parent remounts this component per question (`key={q.id}`), which resets it.
  const hideAnswer = q.format === 'behavioral';
  const [revealed, setRevealed] = useState(!hideAnswer);
  const [tab, setTab] = useState(0);
  const prompt = files['prompt.md'];

  return (
    <Box sx={{ overflow: 'auto', flex: 1 }}>
      <Box sx={{ maxWidth: CONTENT_MAX_WIDTH.reading, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {q.title}
        </Typography>
        <MetaLine q={q} />
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={q.format === 'system-design' ? 'Question & solution' : 'Answer'} />
          <Tab label="Notes" />
        </Tabs>
        {tab === 0 && (
          <>
            {prompt && (
              <Box sx={{ mb: 3 }}>
                <Markdown>{prompt}</Markdown>
              </Box>
            )}
            {revealed ? (
              <>
                {hideAnswer && <Divider sx={{ my: 3 }}>Model answer</Divider>}
                <Markdown>{files['solution.md'] ?? ''}</Markdown>
              </>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  border: 1,
                  borderColor: 'divider',
                  borderStyle: 'dashed',
                  borderRadius: 3,
                }}
              >
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Draft your own answer first (STAR: Situation, Task, Action, Result), then compare.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<VisibilityRoundedIcon />}
                  onClick={() => setRevealed(true)}
                >
                  Reveal model answer
                </Button>
              </Box>
            )}
            <References q={q} />
            <SourceNote source={q.source} />
            <RelatedQuestions q={q} />
          </>
        )}
        {tab === 1 && <NotesTab id={q.id} />}
      </Box>
    </Box>
  );
}
