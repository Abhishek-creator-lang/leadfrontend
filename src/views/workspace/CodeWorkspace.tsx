'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Box, Button, ButtonGroup, Stack, Tooltip } from '@mui/material';
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

function Toolbar({ id, starter, solution }: { id: string; starter: FileMap; solution: FileMap }) {
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
      sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
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
      <Toolbar id={q.id} starter={starter} solution={solution} />
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
          <Box sx={PANEL_COLUMN_SX}>
            {isUI ? (
              <>
                <SandpackPreview
                  style={{ flex: 2 }}
                  showOpenInCodeSandbox={false}
                  showRefreshButton
                />
                {testFiles.length > 0 && <SandpackTests style={{ flex: 1 }} />}
              </>
            ) : (
              <>
                <SandpackTests style={{ flex: 2 }} verbose />
                <SandpackConsole style={{ flex: 1 }} standalone resetOnPreviewRestart />
              </>
            )}
          </Box>
        </SandpackLayout>
      </Box>
    </SandpackProvider>
  );
}
