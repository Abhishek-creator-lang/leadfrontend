'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackTests,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { Box, Button, ButtonGroup, Stack, Tooltip, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import { DEBOUNCE_MS } from '@/constants/timing';
import type { QuestionMeta } from '@/content/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearDraft, saveDraft } from '@/store/progressSlice';
import { buildSandpackFiles, FileMap, isTestFile } from '@/utils/files';

/** Testing Library versions installed in the Sandpack runtime for UI questions that ship tests. */
const UI_TEST_DEPENDENCIES = {
  '@testing-library/react': '^14.3.1',
  '@testing-library/dom': '^9.3.4',
};

/** Max number of visible files before the file explorer is shown for UI questions. */
const MAX_FILES_WITHOUT_EXPLORER = 2;

/**
 * Sandpack's own "Run tests" button inside the tests panel. Its run function isn't exposed as an API,
 * so our toolbar button and the keyboard shortcut click this one.
 */
const SANDPACK_RUN_TESTS_BUTTON = 'button[title="Run tests"]';

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const PANEL_COLUMN_SX = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  height: '100%',
} as const;

/** Saves the editor contents as a draft (debounced) whenever they differ from the starter. */
function DraftSync({ id, initial }: { id: string; initial: FileMap }) {
  const { sandpack } = useSandpack();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current: FileMap = {};
      let dirty = false;
      for (const path of Object.keys(initial)) {
        const code = sandpack.files[path]?.code ?? '';
        current[path] = code;
        if (code !== initial[path]) dirty = true;
      }
      if (dirty) dispatch(saveDraft({ id, files: current }));
    }, DEBOUNCE_MS.draft);
    return () => window.clearTimeout(timer);
  }, [sandpack.files, dispatch, id, initial]);

  return null;
}

function Toolbar({
  id,
  starter,
  solution,
  onRunTests,
}: {
  id: string;
  starter: FileMap;
  solution: FileMap;
  /** Present only when the question has tests. */
  onRunTests?: () => void;
}) {
  const { sandpack } = useSandpack();
  const dispatch = useAppDispatch();
  const load = (files: FileMap) => {
    Object.entries(files).forEach(([path, code]) => sandpack.updateFile(path, code));
  };

  const onReset = () => {
    if (!window.confirm('Reset your code to the starter? Your draft will be lost.')) return;
    load(starter);
    dispatch(clearDraft(id));
  };
  const onLoadSolution = () => {
    if (window.confirm('Replace your code with the reference solution?')) load(solution);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      {onRunTests && (
        <Tooltip title={`Run the tests (${isMac() ? '⌘' : 'Ctrl'}+Enter)`}>
          <Button
            size="small"
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={onRunTests}
          >
            Run tests
          </Button>
        </Tooltip>
      )}
      <ButtonGroup size="small" variant="outlined">
        <Tooltip title="Discard your code and restore the starter">
          <Button startIcon={<RestartAltRoundedIcon />} onClick={onReset}>
            Reset
          </Button>
        </Tooltip>
        <Tooltip title="Load the reference solution into the editor">
          <Button startIcon={<LightbulbRoundedIcon />} onClick={onLoadSolution}>
            Load solution
          </Button>
        </Tooltip>
      </ButtonGroup>
    </Stack>
  );
}

/** Sandpack editor + preview/tests for a coding question. Browser-only (loaded with `ssr: false`). */
export function CodeWorkspace({
  q,
  files,
  dark,
}: {
  q: QuestionMeta;
  files: FileMap;
  dark: boolean;
}) {
  const draft = useAppSelector((s) => s.progress.drafts[q.id]);
  const starter = useMemo(() => buildSandpackFiles(files, 'starter'), [files]);
  const solution = useMemo(() => buildSandpackFiles(files, 'solution'), [files]);
  // The draft only seeds the editor once; later edits flow back through DraftSync.
  const [initialFiles] = useState(() => ({ ...starter, ...(draft ?? {}) }));

  const isUI = q.format === 'user-interface';
  const codeFiles = Object.keys(starter).filter((f) => !isTestFile(f));
  const testFiles = Object.keys(starter).filter(isTestFile);
  const hasTests = testFiles.length > 0;

  // Tests never run on their own (watchMode off): only from the button or Ctrl/Cmd+Enter.
  const panelRef = useRef<HTMLDivElement>(null);
  const runTests = useCallback(() => {
    // While a run is in progress Sandpack shows a spinner instead of the button, so this is a no-op.
    panelRef.current?.querySelector<HTMLButtonElement>(SANDPACK_RUN_TESTS_BUTTON)?.click();
  }, []);

  useEffect(() => {
    if (!hasTests) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runTests();
      }
    };
    // Capture phase, so the shortcut also works while the code editor has focus.
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [hasTests, runTests]);

  const testsHint = (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        px: 1.5,
        py: 0.75,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      Tests run only when you click <b>Run tests</b> ({isMac() ? '⌘' : 'Ctrl'}+Enter).
    </Typography>
  );

  return (
    <SandpackProvider
      key={q.id}
      template={isUI ? 'react' : 'vanilla'}
      theme={dark ? 'dark' : 'light'}
      files={initialFiles}
      customSetup={isUI && testFiles.length ? { dependencies: UI_TEST_DEPENDENCIES } : undefined}
      options={{
        activeFile: isUI ? '/App.js' : '/index.js',
        visibleFiles: [...codeFiles, ...testFiles],
        recompileMode: 'delayed',
        recompileDelay: 400,
      }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <DraftSync id={q.id} initial={starter} />
      <Toolbar
        id={q.id}
        starter={starter}
        solution={solution}
        onRunTests={hasTests ? runTests : undefined}
      />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          '& .sp-layout': { height: '100%', borderRadius: 0, border: 0 },
          '& .sp-stack': { height: '100%' },
        }}
      >
        <SandpackLayout>
          {isUI && codeFiles.length > MAX_FILES_WITHOUT_EXPLORER && (
            <SandpackFileExplorer style={{ height: '100%', maxWidth: 170 }} />
          )}
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            showInlineErrors
            wrapContent
            closableTabs={false}
            style={{ height: '100%' }}
          />
          <Box ref={panelRef} sx={PANEL_COLUMN_SX}>
            {isUI ? (
              <>
                <SandpackPreview
                  style={{ flex: 2 }}
                  showOpenInCodeSandbox={false}
                  showRefreshButton
                />
                {hasTests && (
                  <>
                    {testsHint}
                    <SandpackTests style={{ flex: 1 }} watchMode={false} showWatchButton={false} />
                  </>
                )}
              </>
            ) : (
              <>
                {testsHint}
                <SandpackTests
                  style={{ flex: 2 }}
                  verbose
                  watchMode={false}
                  showWatchButton={false}
                />
                <SandpackConsole style={{ flex: 1 }} standalone resetOnPreviewRestart />
              </>
            )}
          </Box>
        </SandpackLayout>
      </Box>
    </SandpackProvider>
  );
}
