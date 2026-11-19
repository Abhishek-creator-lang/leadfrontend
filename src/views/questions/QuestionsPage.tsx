'use client';

import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { ProgressSummary } from '@/components/ProgressSummary';
import { QuestionList } from '@/components/QuestionList';
import { PAGE_TITLES } from '@/constants/navigation';
import { DEBOUNCE_MS } from '@/constants/timing';
import { content, FORMAT_COUNTS, questionsByFormat } from '@/content';
import { FORMAT_INFO, FORMAT_ORDER, QUIZ_CATEGORY_LABEL } from '@/content/formats';
import type { Format, QuestionMeta, QuizCategory } from '@/content/types';
import { useDebounce } from '@/hooks/useDebounce';
import { Page, PageHeader } from '@/layout/Page';
import { useAppSelector } from '@/store';
import { capitalize, pluralize } from '@/utils/format';
import { countCompleted } from '@/utils/progress';
import { MultiSelect } from './MultiSelect';
import {
  DIFFICULTIES,
  NON_FILTER_PARAMS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  sortQuestions,
  uniqueSorted,
} from './filters';

/** Reads and writes filters in the URL query string, so links and reloads keep them. */
function useQueryFilters() {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const params = useMemo(() => new URLSearchParams(searchParams?.toString() ?? ''), [searchParams]);

  const replace = (next: URLSearchParams) => {
    const qs = next.toString();
    // Next keeps useSearchParams in sync with history.replaceState, without a navigation per keystroke.
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  };

  const getList = (key: string) => params.get(key)?.split(',').filter(Boolean) ?? [];
  const set = (key: string, value: string[] | string) => {
    const next = new URLSearchParams(params);
    const joined = Array.isArray(value) ? value.join(',') : value;
    if (joined) next.set(key, joined);
    else next.delete(key);
    replace(next);
  };
  const clear = () => replace(new URLSearchParams());

  return { params, getList, set, clear };
}

export default function QuestionsPage({ format }: { format?: Format }) {
  const { params, getList, set, clear } = useQueryFilters();
  const completed = useAppSelector((s) => s.progress.completed);

  const search = params.get('q') ?? '';
  const debounced = useDebounce(search, DEBOUNCE_MS.search).toLowerCase();
  const formats = format ? [format] : getList('format');
  const difficulty = getList('difficulty');
  const category = getList('category');
  const topics = getList('topic');
  const companies = getList('company');
  const status = params.get('status') ?? '';
  const sort = params.get('sort') ?? 'default';

  const base = useMemo(() => (format ? questionsByFormat(format) : content.questions), [format]);
  const topicOptions = useMemo(() => uniqueSorted(base.flatMap((q) => q.topics)), [base]);
  const companyOptions = useMemo(() => uniqueSorted(base.flatMap((q) => q.companies)), [base]);
  const categoryOptions = useMemo(
    () => [...new Set(base.map((q) => q.quizCategory).filter((c): c is QuizCategory => !!c))],
    [base]
  );

  const filtered = useMemo(() => {
    const matches = (q: QuestionMeta) =>
      (!formats.length || formats.includes(q.format)) &&
      (!difficulty.length || difficulty.includes(q.difficulty)) &&
      (!category.length || (!!q.quizCategory && category.includes(q.quizCategory))) &&
      (!topics.length || q.topics.some((t) => topics.includes(t))) &&
      (!companies.length || q.companies.some((c) => companies.includes(c))) &&
      (!status || (status === 'completed') === !!completed[q.id]) &&
      (!debounced ||
        q.title.toLowerCase().includes(debounced) ||
        q.excerpt.toLowerCase().includes(debounced) ||
        q.topics.some((t) => t.toLowerCase().includes(debounced)));
    return sortQuestions(base.filter(matches), sort);
    // `params` covers every filter read above; the derived arrays are rebuilt each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, params, debounced, completed]);

  const info = format ? FORMAT_INFO[format] : null;
  const activeFilters = [...params.keys()].filter((k) => !NON_FILTER_PARAMS.has(k)).length;

  return (
    <Page>
      <PageHeader
        title={info ? info.label : PAGE_TITLES.questions}
        subtitle={info ? info.description : 'Every question across every format, in one place.'}
      />
      <Card sx={{ p: 2, mb: 3 }}>
        <ProgressSummary
          label="Progress"
          done={countCompleted(
            base.map((q) => q.id),
            completed
          )}
          total={base.length}
        />
      </Card>

      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }} alignItems="center">
        <TextField
          size="small"
          placeholder="Search title, topic…"
          value={search}
          onChange={(e) => set('q', e.target.value)}
          sx={{ flex: '1 1 240px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {!format && (
          <MultiSelect
            label="Format"
            value={formats}
            options={FORMAT_ORDER}
            onChange={(v) => set('format', v)}
            render={(f) => FORMAT_INFO[f as Format].short}
          />
        )}
        <MultiSelect
          label="Difficulty"
          value={difficulty}
          options={DIFFICULTIES}
          onChange={(v) => set('difficulty', v)}
          render={capitalize}
        />
        <MultiSelect
          label="Category"
          value={category}
          options={categoryOptions}
          onChange={(v) => set('category', v)}
          render={(c) => QUIZ_CATEGORY_LABEL[c as QuizCategory] ?? c}
        />
        <MultiSelect
          label="Topic"
          value={topics}
          options={topicOptions}
          onChange={(v) => set('topic', v)}
        />
        <MultiSelect
          label="Company"
          value={companies}
          options={companyOptions}
          onChange={(v) => set('company', v)}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={(e) => set('status', e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort</InputLabel>
          <Select
            label="Sort"
            value={sort}
            onChange={(e) => set('sort', e.target.value === 'default' ? '' : e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {activeFilters > 0 && <Button onClick={clear}>Clear filters</Button>}
      </Stack>

      {!format && !formats.length && (
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          {FORMAT_ORDER.map((f) => (
            <Chip
              key={f}
              label={`${FORMAT_INFO[f].short} · ${FORMAT_COUNTS[f]}`}
              onClick={() => set('format', [f])}
              variant="outlined"
            />
          ))}
        </Stack>
      )}

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {pluralize(filtered.length, 'question')}
        </Typography>
      </Box>
      <QuestionList questions={filtered} />
    </Page>
  );
}
