'use client';

import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { DEBOUNCE_MS } from '@/constants/timing';
import { useProgressHydrated } from '@/context/ProgressHydrationContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '@/store';
import { setNote } from '@/store/progressSlice';

/** Free-form notes for a question, autosaved (debounced) to the progress store. */
export function NotesTab({ id }: { id: string }) {
  // Seed the editor only after stored notes are loaded, or the empty default would overwrite them.
  return useProgressHydrated() ? <NotesEditor id={id} /> : null;
}

function NotesEditor({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((s) => s.progress.notes[id] ?? '');
  const [value, setValue] = useState(saved);
  const debounced = useDebounce(value, DEBOUNCE_MS.note);

  useEffect(() => {
    if (debounced !== saved) dispatch(setNote({ id, note: debounced }));
    // Only react to the user's (debounced) edits, not to the stored value changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, id, dispatch]);

  return (
    <TextField
      multiline
      minRows={14}
      fullWidth
      placeholder="Your notes for this question (saved automatically in this browser)…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
