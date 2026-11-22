'use client';

import { useRef, useState, useTransition } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  InputAdornment,
  Link,
  MenuItem,
  Pagination,
  PaginationItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { EmptyState } from '@/components/EmptyState';
import { FORMAT_INFO, FORMAT_ORDER } from '@/content/formats';
import type { Format } from '@/content/types';
import type { ContentType } from '@/lib/validation/content';
import type { EntryStatus } from '@/server/repositories/content';
import { bulkContentAction, type ContentActionResult } from '@/app/admin/content/actions';
import { contentEditPath, STATUS_INFO } from './contentTypes';
import { ContentStatusChip } from './StatusChip';

export interface ContentRow {
  id: string;
  key: string;
  title: string;
  status: EntryStatus;
  format?: string;
  updated: string;
  updatedBy: string | null;
}

type Bulk = 'publish' | 'unpublish' | 'archive' | 'restore';

/** Filterable, paginated list of one content type with bulk publish / archive. */
export function ContentListTable({
  type,
  filters,
  rows,
  total,
  page,
  pageCount,
  pageHrefs,
}: {
  type: ContentType;
  filters: { q?: string; status?: string; format?: string };
  rows: ContentRow[];
  total: number;
  page: number;
  pageCount: number;
  pageHrefs: Record<number, string>;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<ContentActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const submit = () => setTimeout(() => formRef.current?.requestSubmit());

  const allChecked = rows.length > 0 && selected.length === rows.length;
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulk = (action: Bulk) =>
    startTransition(async () => {
      const r = await bulkContentAction(action, selected);
      setResult(r);
      setSelected([]);
      router.refresh();
    });

  return (
    <>
      <form ref={formRef} method="get">
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
          <TextField
            name="q"
            size="small"
            placeholder="Search title or slug…"
            defaultValue={filters.q}
            sx={{ flex: '1 1 260px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {type === 'question' && (
            <TextField
              select
              name="format"
              size="small"
              label="Format"
              defaultValue={filters.format ?? ''}
              onChange={submit}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="">All formats</MenuItem>
              {FORMAT_ORDER.map((f) => (
                <MenuItem key={f} value={f}>
                  {FORMAT_INFO[f].short}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            select
            name="status"
            size="small"
            label="Status"
            defaultValue={filters.status ?? ''}
            onChange={submit}
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {(Object.keys(STATUS_INFO) as EntryStatus[]).map((s) => (
              <MenuItem key={s} value={s}>
                {STATUS_INFO[s].label}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="outlined">
            Search
          </Button>
        </Stack>
      </form>

      {result && (
        <Alert severity={result.ok ? 'success' : 'warning'} sx={{ mb: 2 }} onClose={() => setResult(null)}>
          {result.message}
        </Alert>
      )}

      {selected.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 1.5, p: 1, borderRadius: 1, bgcolor: 'action.hover' }}
        >
          <Typography variant="body2" sx={{ mr: 1 }}>
            {selected.length} selected
          </Typography>
          <Button size="small" variant="contained" disabled={pending} onClick={() => bulk('publish')}>
            Publish
          </Button>
          <Button size="small" disabled={pending} onClick={() => bulk('unpublish')}>
            Unpublish
          </Button>
          <Button size="small" disabled={pending} onClick={() => bulk('archive')}>
            Archive
          </Button>
          <Button size="small" disabled={pending} onClick={() => bulk('restore')}>
            Restore
          </Button>
        </Stack>
      )}

      {rows.length === 0 ? (
        <EmptyState title="Nothing found" description="Try another search or filter." />
      ) : (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allChecked}
                      indeterminate={selected.length > 0 && !allChecked}
                      onChange={() => setSelected(allChecked ? [] : rows.map((r) => r.id))}
                      inputProps={{ 'aria-label': 'Select all on this page' }}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  {type === 'question' && <TableCell>Format</TableCell>}
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Last edited</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover selected={selected.includes(r.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(r.id)}
                        onChange={() => toggle(r.id)}
                        inputProps={{ 'aria-label': `Select ${r.title}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Link component={NextLink} href={contentEditPath(type, r.id)} fontWeight={600} underline="hover">
                        {r.title}
                      </Link>
                      <Typography variant="caption" color="text.secondary" component="div">
                        {r.key}
                      </Typography>
                    </TableCell>
                    {type === 'question' && (
                      <TableCell>{r.format ? FORMAT_INFO[r.format as Format]?.short ?? r.format : '—'}</TableCell>
                    )}
                    <TableCell>
                      <ContentStatusChip status={r.status} />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2">{r.updated}</Typography>
                      {r.updatedBy && (
                        <Typography variant="caption" color="text.secondary">
                          {r.updatedBy}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {total} item{total === 1 ? '' : 's'}
            </Typography>
            {pageCount > 1 && (
              <Pagination
                page={page}
                count={pageCount}
                size="small"
                renderItem={(item) => (
                  <PaginationItem component={NextLink} href={pageHrefs[item.page ?? 1] ?? '#'} {...item} />
                )}
              />
            )}
          </Box>
        </Card>
      )}
    </>
  );
}
