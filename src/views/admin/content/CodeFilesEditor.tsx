'use client';

import { KeyboardEvent, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import { useConfirm } from '@/components/ConfirmDialog';
import { isTestFile } from '@/utils/files';
import { TestCheckDialog } from './TestCheckDialog';
import { FONT_MONO } from '@/theme/fonts';


type Group = 'starter' | 'solution' | 'tests';

const GROUPS: { id: Group; label: string; hint: string }[] = [
  { id: 'starter', label: 'Starter', hint: 'What learners start from' },
  { id: 'solution', label: 'Reference solution', hint: 'Shown after "Load solution"' },
  { id: 'tests', label: 'Tests', hint: 'Shared by starter and solution (*.test.js)' },
];

const groupOf = (path: string): Group =>
  path.startsWith('starter/') ? 'starter' : path.startsWith('solution/') ? 'solution' : 'tests';
const prefixOf = (g: Group) => (g === 'tests' ? '' : `${g}/`);
const nameOf = (path: string) => path.replace(/^(starter|solution)\//, '');

/**
 * Edits a coding question's files (`starter/…`, `solution/…`, root `*.test.js`) and checks them in the
 * sandbox: the solution should pass and the starter should fail. Results are advisory only.
 */
export function CodeFilesEditor({
  files,
  format,
  onChange,
}: {
  files: Record<string, string>;
  format: string;
  onChange: (files: Record<string, string>) => void;
}) {
  const paths = useMemo(() => Object.keys(files).sort(), [files]);
  const [active, setActive] = useState<string | null>(paths[0] ?? null);
  const [dialog, setDialog] = useState<{ mode: 'add' | 'rename'; group: Group; from?: string } | null>(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [checking, setChecking] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const current = active && active in files ? active : paths[0] ?? null;
  const missing = [
    !paths.some((p) => p.startsWith('starter/')) && 'starter',
    !paths.some((p) => p.startsWith('solution/')) && 'solution',
    !paths.some(isTestFile) && 'tests',
  ].filter(Boolean);

  const openDialog = (mode: 'add' | 'rename', group: Group, from?: string) => {
    setDialog({ mode, group, from });
    setName(from ? nameOf(from) : group === 'tests' ? 'index.test.js' : 'index.js');
    setNameError('');
  };

  const applyDialog = () => {
    if (!dialog) return;
    const clean = name.trim().replace(/^\/+/, '');
    const path = prefixOf(dialog.group) + clean;
    if (!/^[A-Za-z0-9_.\-/]+$/.test(clean)) return setNameError('Use letters, numbers, ".", "-", "_" and "/"');
    if (dialog.group === 'tests' && !isTestFile(clean)) return setNameError('Test files must end in .test.js or .test.jsx');
    if (path !== dialog.from && path in files) return setNameError('A file with this name already exists');
    if (dialog.mode === 'add') {
      onChange({ ...files, [path]: '' });
    } else if (dialog.from) {
      const next = { ...files };
      next[path] = next[dialog.from];
      if (path !== dialog.from) delete next[dialog.from];
      onChange(next);
    }
    setActive(path);
    setDialog(null);
  };

  const remove = async (path: string) => {
    if (!(await confirm({ title: `Delete ${path}?`, confirmLabel: 'Delete file', tone: 'error' }))) return;
    const next = { ...files };
    delete next[path];
    onChange(next);
  };

  // Tab inserts two spaces instead of leaving the editor.
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab' || !current) return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end, value } = el;
    onChange({ ...files, [current]: `${value.slice(0, s)}  ${value.slice(end)}` });
    requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
  };

  return (
    <Stack spacing={1.5}>
      {missing.length > 0 && (
        <Alert severity="info">
          Coding questions need {missing.join(', ')} files. JavaScript and algorithm questions use
          <code> index.js</code> + <code>index.test.js</code>; UI questions use <code>App.js</code> + <code>App.test.js</code>.
        </Alert>
      )}
      <Card variant="outlined" sx={{ display: 'flex', minHeight: 460 }}>
        <Box sx={{ width: 230, flexShrink: 0, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          {GROUPS.map((g) => (
            <List
              key={g.id}
              dense
              subheader={
                <ListSubheader sx={{ display: 'flex', alignItems: 'center', lineHeight: '36px' }}>
                  <Tooltip title={g.hint}>
                    <span style={{ flex: 1 }}>{g.label}</span>
                  </Tooltip>
                  <IconButton size="small" onClick={() => openDialog('add', g.id)} aria-label={`Add ${g.label} file`}>
                    <AddRoundedIcon fontSize="small" />
                  </IconButton>
                </ListSubheader>
              }
            >
              {paths
                .filter((p) => groupOf(p) === g.id)
                .map((p) => (
                  <ListItemButton key={p} selected={p === current} onClick={() => setActive(p)} sx={{ pl: 3 }}>
                    <ListItemText primary={nameOf(p)} primaryTypographyProps={{ fontFamily: FONT_MONO, fontSize: 13 }} />
                  </ListItemButton>
                ))}
            </List>
          ))}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontFamily: FONT_MONO, flex: 1 }} noWrap>
              {current ?? 'No file selected'}
            </Typography>
            {current && (
              <>
                <Tooltip title="Rename">
                  <IconButton size="small" onClick={() => openDialog('rename', groupOf(current), current)} aria-label="Rename file">
                    <DriveFileRenameOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => remove(current)} aria-label="Delete file">
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Button size="small" variant="contained" startIcon={<ScienceRoundedIcon />} onClick={() => setChecking(true)} disabled={missing.length > 0}>
              Check tests
            </Button>
          </Stack>
          {current ? (
            <Box
              component="textarea"
              value={files[current]}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...files, [current]: e.target.value })}
              onKeyDown={onKeyDown}
              spellCheck={false}
              aria-label={`Contents of ${current}`}
              sx={{
                flex: 1,
                minHeight: 420,
                border: 0,
                outline: 0,
                resize: 'vertical',
                p: 2,
                fontFamily: FONT_MONO,
                fontSize: 13,
                lineHeight: 1.6,
                tabSize: 2,
                whiteSpace: 'pre',
                bgcolor: 'background.paper',
                color: 'text.primary',
              }}
            />
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">Add a file with the + buttons.</Typography>
            </Box>
          )}
        </Box>
      </Card>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialog?.mode === 'rename' ? 'Rename file' : `Add ${GROUPS.find((g) => g.id === dialog?.group)?.label.toLowerCase()} file`}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="File name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyDialog()}
            error={!!nameError}
            helperText={nameError || (dialog ? `Saved as ${prefixOf(dialog.group)}${name.trim()}` : '')}
            InputProps={{ sx: { fontFamily: FONT_MONO } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={applyDialog} variant="contained">
            {dialog?.mode === 'rename' ? 'Rename' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      {checking && <TestCheckDialog files={files} format={format} onClose={() => setChecking(false)} />}
      {confirmDialog}
    </Stack>
  );
}
