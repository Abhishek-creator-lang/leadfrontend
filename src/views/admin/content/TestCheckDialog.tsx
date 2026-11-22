'use client';

import { useState } from 'react';
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackTests,
} from '@codesandbox/sandpack-react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { UI_TEST_DEPENDENCIES } from '@/constants/sandpack';
import { sandpackTheme } from '@/theme/sandpack';
import { buildSandpackFiles, isTestFile } from '@/utils/files';

type Variant = 'solution' | 'starter';

const EXPECTATION: Record<Variant, string> = {
  solution: 'Expected: every test passes with the reference solution.',
  starter: 'Expected: at least one test fails with the starter code (so learners have something to solve).',
};

/**
 * Runs the question's tests in Sandpack against the reference solution or the starter, exactly as
 * learners would. Advisory only: publishing is never blocked by the result.
 */
export function TestCheckDialog({
  files,
  format,
  onClose,
}: {
  files: Record<string, string>;
  format: string;
  onClose: () => void;
}) {
  const [variant, setVariant] = useState<Variant>('solution');
  const mode = useTheme().palette.mode;
  const isUI = format === 'user-interface';
  const sandpackFiles = buildSandpackFiles(files, variant);
  const hasTests = Object.keys(files).some(isTestFile);

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Check tests</DialogTitle>
      <DialogContent>
        <Tabs value={variant} onChange={(_, v: Variant) => setVariant(v)} sx={{ mb: 1 }}>
          <Tab value="solution" label="Reference solution" />
          <Tab value="starter" label="Starter code" />
        </Tabs>
        <Alert severity="info" sx={{ mb: 1.5 }}>
          {EXPECTATION[variant]} Tests run automatically; this check never blocks publishing.
        </Alert>
        {!hasTests && <Alert severity="warning">This question has no test files.</Alert>}
        <Box sx={{ '& .sp-layout': { height: 460 }, '& .sp-stack': { height: '100%' } }}>
          <SandpackProvider
            key={variant}
            template={isUI ? 'react' : 'vanilla'}
            theme={sandpackTheme(mode)}
            files={sandpackFiles}
            customSetup={isUI && hasTests ? { dependencies: UI_TEST_DEPENDENCIES } : undefined}
            options={{ activeFile: isUI ? '/App.js' : '/index.js' }}
          >
            <SandpackLayout>
              {isUI && <SandpackPreview style={{ flex: 1 }} showOpenInCodeSandbox={false} />}
              <SandpackTests style={{ flex: 1 }} verbose />
            </SandpackLayout>
          </SandpackProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
