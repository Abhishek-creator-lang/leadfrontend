'use client';

import { ReactNode, useContext, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { PAGE_TITLES } from '@/constants/navigation';
import { useContent } from '@/context/ContentContext';
import { ThemeModeContext } from '@/context/ThemeModeContext';
import { Page, PageHeader } from '@/layout/Page';
import { useCurrentUser } from '@/context/SessionContext';
import { useAppDispatch, useAppStore } from '@/store';
import { importProgress, ProgressState, resetProgress } from '@/store/progressSlice';
import { toISODate } from '@/utils/date';
import { downloadJson } from '@/utils/download';

type Message = { type: 'success' | 'error'; text: string };

/** Parses an exported progress file, throwing a readable error when it is not one. */
async function readProgressFile(file: File): Promise<ProgressState> {
  const data = JSON.parse(await file.text()) as ProgressState;
  if (typeof data !== 'object' || !data || typeof data.completed !== 'object') {
    throw new Error('Not a progress file');
  }
  return data;
}

function SettingsCard({
  title,
  children,
  last,
}: {
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <Card sx={{ p: 3, mb: last ? 0 : 2 }}>
      <Typography fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {children}
    </Card>
  );
}

export default function SettingsPage() {
  const { content } = useContent();
  const { mode, setMode } = useContext(ThemeModeContext);
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const user = useCurrentUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<Message | null>(null);

  const onExport = () =>
    downloadJson(`lead-frontend-progress-${toISODate()}.json`, store.getState().progress);

  const onImport = async (file: File) => {
    try {
      const data = await readProgressFile(file);
      dispatch(importProgress(data));
      setMsg({
        type: 'success',
        text: `Imported progress: ${Object.keys(data.completed).length} completed questions.`,
      });
    } catch (e) {
      setMsg({ type: 'error', text: `Import failed: ${(e as Error).message}` });
    }
  };

  const onReset = () => {
    if (
      window.confirm(
        user
          ? 'Delete all progress, notes and drafts from your account? This cannot be undone.'
          : 'Delete all progress, notes and drafts? This cannot be undone.'
      )
    ) {
      dispatch(resetProgress());
    }
  };

  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.form}>
      <PageHeader title={PAGE_TITLES.settings} />
      {msg && (
        <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg(null)}>
          {msg.text}
        </Alert>
      )}
      <SettingsCard title="Appearance">
        <ToggleButtonGroup exclusive value={mode} onChange={(_, v) => v && setMode(v)} size="small">
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
        </ToggleButtonGroup>
      </SettingsCard>
      <SettingsCard title="Progress data">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user
            ? 'Progress, notes and code drafts are saved to your account and sync across devices. Import replaces your account data; reset deletes it.'
            : 'Progress, notes and code drafts are stored only in this browser. Sign in to keep them in your account, or export a backup to move them to another device.'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={onExport}>
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileUploadRoundedIcon />}
            onClick={() => fileRef.current?.click()}
          >
            Import
          </Button>
          <Button color="error" startIcon={<DeleteForeverRoundedIcon />} onClick={onReset}>
            Reset all progress
          </Button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept="application/json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = '';
            }}
          />
        </Stack>
      </SettingsCard>
      <SettingsCard title="About the content" last>
        <Typography variant="body2" color="text.secondary">
          {content.questions.length} questions indexed. Most content is written for this app.
          Material imported from the Front End Interview Handbook and Awesome Front End System
          Design (both MIT-licensed) is credited on each page. See <code>LICENSES.md</code> in the
          repository.
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" suppressHydrationWarning>
            Index generated {new Date(content.generatedAt).toLocaleString()}
          </Typography>
        </Box>
      </SettingsCard>
    </Page>
  );
}
