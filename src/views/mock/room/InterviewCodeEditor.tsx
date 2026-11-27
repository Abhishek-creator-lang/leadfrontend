'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackTests,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { UI_TEST_DEPENDENCIES } from '@/constants/sandpack';
import { sandpackTheme } from '@/theme/sandpack';
import type { CodingMaterial } from '@/utils/interview/material';
import { countTests, type TestNode } from '@/utils/interview/testResults';

/** Sandpack's own run button inside the tests panel (see CodeWorkspace for why this selector). */
const RUN_TESTS_BUTTON = '.sp-tests .sp-icon-standalone';

const isTestFile = (f: string) => /\.test\.jsx?$/.test(f);

/** Tells the room when the candidate edits code (for "are they stuck?" nudges). */
function ActivityWatcher({ onActivity }: { onActivity: () => void }) {
  const { sandpack } = useSandpack();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onActivity();
  }, [sandpack.files, onActivity]);
  return null;
}

/**
 * The coding round's editor: starter code and tests only (no solution, no drafts). Reports each
 * test run to the interviewer. Browser-only (loaded with `ssr: false`).
 */
export default function InterviewCodeEditor({
  material,
  dark,
  onTests,
  onActivity,
}: {
  material: CodingMaterial;
  dark: boolean;
  onTests: (result: { passed: number; total: number }) => void;
  onActivity: () => void;
}) {
  const isUI = material.format === 'user-interface';
  const files = material.files;
  const codeFiles = Object.keys(files).filter((f) => !isTestFile(f));
  const testFiles = Object.keys(files).filter(isTestFile);
  const panelRef = useRef<HTMLDivElement>(null);

  const runTests = useCallback(() => {
    panelRef.current?.querySelector<HTMLButtonElement>(RUN_TESTS_BUTTON)?.click();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runTests();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [runTests]);

  return (
    <SandpackProvider
      key={material.id}
      template={isUI ? 'react' : 'vanilla'}
      theme={sandpackTheme(dark ? 'dark' : 'light')}
      files={files}
      customSetup={isUI && testFiles.length ? { dependencies: UI_TEST_DEPENDENCIES } : undefined}
      options={{
        activeFile: codeFiles.includes('/App.js') ? '/App.js' : codeFiles[0],
        visibleFiles: [...codeFiles, ...testFiles],
        recompileMode: 'delayed',
        recompileDelay: 400,
      }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <ActivityWatcher onActivity={onActivity} />
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tooltip title="Run the tests (Ctrl/⌘+Enter)">
          <Button
            size="small"
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={runTests}
          >
            Run tests
          </Button>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          The interviewer sees your test results.
        </Typography>
      </Stack>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          '& .sp-layout': { height: '100%', borderRadius: 0, border: 0 },
          '& .sp-stack': { height: '100%' },
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            showInlineErrors
            wrapContent
            closableTabs={false}
            style={{ height: '100%' }}
          />
          <Box
            ref={panelRef}
            sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}
          >
            {isUI && <SandpackPreview style={{ flex: 1 }} showOpenInCodeSandbox={false} />}
            <SandpackTests
              style={{ flex: 2 }}
              verbose
              watchMode={false}
              showWatchButton={false}
              onComplete={(specs) =>
                onTests(countTests(specs as unknown as Record<string, TestNode>))
              }
            />
            {!isUI && <SandpackConsole style={{ flex: 1 }} standalone resetOnPreviewRestart />}
          </Box>
        </SandpackLayout>
      </Box>
    </SandpackProvider>
  );
}
