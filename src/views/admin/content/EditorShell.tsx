'use client';

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useConfirm } from '@/components/ConfirmDialog';
import type { ContentType } from '@/lib/validation/content';
import type { EntryStatus } from '@/server/repositories/content';
import {
  archiveContentAction,
  createContentAction,
  deleteContentAction,
  publishContentAction,
  restoreContentAction,
  restoreRevisionAction,
  revisionsAction,
  saveContentAction,
  unpublishContentAction,
  type ContentActionResult,
} from '@/app/admin/content/actions';
import { CONTENT_TYPE_INFO, contentEditPath, contentListPath } from './contentTypes';
import { ContentStatusChip } from './StatusChip';

export type Doc = Record<string, unknown>;
export type FieldErrors = Record<string, string>;

export interface EditorFormProps<D extends Doc = Doc> {
  doc: D;
  /** Shallow-merges a patch into the document. */
  update: (patch: Partial<D>) => void;
  errors: FieldErrors;
}

type Revision = { id: string; kind: string; createdAt: string; by: string | null };

const REVISION_LABEL: Record<string, string> = {
  save: 'Saved draft',
  publish: 'Published',
  restore: 'Restored',
  import: 'Imported from files',
};

/**
 * Shared editor frame for every content type: header with status and actions (save, publish,
 * unpublish, archive/restore/delete, history), unsaved-changes guard and Ctrl/Cmd+S.
 * The type-specific form is rendered by `children(props)`.
 */
export function EditorShell<D extends Doc>({
  type,
  id,
  status,
  initialDoc,
  title,
  livePath,
  children,
}: {
  type: ContentType;
  /** Missing for a new, unsaved entry. */
  id?: string;
  status?: EntryStatus;
  initialDoc: D;
  title: string;
  /** Learner URL of the published version, if any. */
  livePath?: string;
  children: (props: EditorFormProps<D>) => ReactNode;
}) {
  const router = useRouter();
  const [confirm, confirmDialog] = useConfirm();
  const [doc, setDoc] = useState<D>(initialDoc);
  const [saved, setSaved] = useState(() => JSON.stringify(initialDoc));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [revisions, setRevisions] = useState<Revision[] | null>(null);

  const dirty = useMemo(() => JSON.stringify(doc) !== saved, [doc, saved]);
  const info = CONTENT_TYPE_INFO[type];
  const update = useCallback((patch: Partial<D>) => setDoc((d) => ({ ...d, ...patch })), []);

  // Adopt a fresh server copy (after save / restore / refresh) only when there are no unsaved edits,
  // so a refresh can never wipe out what the admin is typing.
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  useEffect(() => {
    if (dirtyRef.current) return;
    setDoc(initialDoc);
    setSaved(JSON.stringify(initialDoc));
  }, [initialDoc]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const report = (r: ContentActionResult, onOk?: () => void) => {
    if (r.ok) {
      setErrors({});
      onOk?.();
      router.refresh();
    } else {
      setErrors(r.fieldErrors ?? {});
    }
    setNotice({ ok: r.ok, text: r.message ?? (r.ok ? 'Done.' : 'Something went wrong.') });
  };

  const save = useCallback(() => {
    startTransition(async () => {
      if (!id) {
        const r = await createContentAction(type, doc);
        report(r, () => {
          setSaved(JSON.stringify(doc));
          if (r.ok && r.id) router.replace(contentEditPath(type, r.id));
        });
        return;
      }
      const r = await saveContentAction(id, doc);
      report(r, () => setSaved(JSON.stringify(doc)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, doc, type]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const publish = () =>
    startTransition(async () => {
      if (!id) return;
      const r = await publishContentAction(id, dirty ? doc : undefined);
      report(r, () => setSaved(JSON.stringify(doc)));
    });

  const simple = (fn: (id: string) => Promise<ContentActionResult>, question?: { title: string; message: string; tone?: 'error' | 'warning' }) =>
    startTransition(async () => {
      if (!id) return;
      if (question && !(await confirm({ ...question, confirmLabel: question.title.replace(/\?$/, '') }))) return;
      report(await fn(id));
    });

  const remove = () =>
    startTransition(async () => {
      if (!id) return;
      const ok = await confirm({
        title: `Delete this ${info.singular}?`,
        message: 'It has never been published. This cannot be undone.',
        confirmLabel: 'Delete',
        tone: 'error',
      });
      if (!ok) return;
      const r = await deleteContentAction(id);
      if (r.ok) router.replace(contentListPath(type));
      else report(r);
    });

  const openHistory = () => {
    setHistoryOpen(true);
    if (id) revisionsAction(id).then(setRevisions);
  };

  const restore = (revisionId: string) =>
    startTransition(async () => {
      if (!id) return;
      if (
        dirty &&
        !(await confirm({
          title: 'Discard unsaved changes?',
          message: 'Restoring a revision replaces the current draft.',
          confirmLabel: 'Restore revision',
        }))
      )
        return;
      const r = await restoreRevisionAction(id, revisionId);
      report(r, () => {
        if (r.ok && r.doc) {
          setDoc(r.doc as D);
          setSaved(JSON.stringify(r.doc));
        }
        setHistoryOpen(false);
      });
    });

  const archived = status === 'archived';
  const published = status === 'published' || status === 'changed';

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{
          position: 'sticky',
          top: 56,
          zIndex: 5,
          bgcolor: 'background.default',
          py: 1.5,
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tooltip title={`Back to ${info.label.toLowerCase()}`}>
          <IconButton component={NextLink} href={contentListPath(type)} aria-label="Back">
            <ArrowBackRoundedIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h6" fontWeight={800} noWrap>
            {title || `New ${info.singular}`}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {status ? <ContentStatusChip status={status} /> : <ContentStatusChip status="draft" />}
            {dirty && (
              <Typography variant="caption" color="warning.main">
                Unsaved changes
              </Typography>
            )}
          </Stack>
        </Box>
        {livePath && published && (
          <Button href={livePath} target="_blank" rel="noreferrer" endIcon={<OpenInNewRoundedIcon />}>
            View live
          </Button>
        )}
        {id && (
          <Tooltip title="Revision history">
            <IconButton onClick={openHistory} aria-label="Revision history">
              <HistoryRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
        {id && archived && (
          <Button disabled={pending} onClick={() => simple(restoreContentAction)}>
            Restore
          </Button>
        )}
        {id && !archived && type !== 'taxonomy' && (
          published ? (
            <Button
              color="inherit"
              disabled={pending}
              onClick={() =>
                simple(unpublishContentAction, {
                  title: 'Unpublish?',
                  message: 'Learners will no longer see it. Their progress is kept.',
                })
              }
            >
              Unpublish
            </Button>
          ) : status === 'draft' ? (
            <Button color="error" disabled={pending} onClick={remove}>
              Delete
            </Button>
          ) : null
        )}
        {id && !archived && published && type !== 'taxonomy' && (
          <Button
            color="inherit"
            disabled={pending}
            onClick={() =>
              simple(archiveContentAction, {
                title: 'Archive?',
                message: 'It disappears for learners but their progress is kept. You can restore it later.',
                tone: 'warning',
              })
            }
          >
            Archive
          </Button>
        )}
        <Button variant="outlined" disabled={pending || (!dirty && !!id)} onClick={save}>
          {id ? 'Save draft' : 'Create draft'}
        </Button>
        {id && !archived && (
          <Button
            variant="contained"
            disabled={pending || (status === 'published' && !dirty)}
            onClick={publish}
          >
            {type === 'taxonomy' ? 'Save & apply' : 'Publish'}
          </Button>
        )}
      </Stack>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fix these fields:{' '}
          {Object.entries(errors)
            .slice(0, 6)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ')}
        </Alert>
      )}

      {children({ doc, update, errors })}

      {confirmDialog}
      <Snackbar
        open={!!notice}
        autoHideDuration={notice?.ok ? 3500 : 8000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notice?.ok ? 'success' : 'error'} variant="filled" onClose={() => setNotice(null)}>
          {notice?.text}
        </Alert>
      </Snackbar>

      <Drawer anchor="right" open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <Box sx={{ width: 360, p: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Revision history
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Restoring copies a revision into the draft. Publish to make it live.
          </Typography>
          {!revisions ? (
            <Typography color="text.secondary">Loading…</Typography>
          ) : (
            <List dense>
              {revisions.map((r) => (
                <ListItem
                  key={r.id}
                  secondaryAction={
                    <Button size="small" disabled={pending} onClick={() => restore(r.id)}>
                      Restore
                    </Button>
                  }
                >
                  <ListItemText
                    primary={REVISION_LABEL[r.kind] ?? r.kind}
                    secondary={`${new Date(r.createdAt).toLocaleString()}${r.by ? ` · ${r.by}` : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
