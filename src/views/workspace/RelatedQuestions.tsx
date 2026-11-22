'use client';

import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { TextLink } from '@/components/links';
import { useContent } from '@/context/ContentContext';
import type { QuestionMeta } from '@/content/types';
import { questionPath } from '@/routes/paths';

const LIMIT = 6;

/**
 * "Related questions": shared topics first, then the same format, then shared companies. Plain links
 * rendered on the server, so they also spread link equity across the catalog.
 */
export function RelatedQuestions({
  q,
}: {
  q: Pick<QuestionMeta, 'id' | 'format' | 'topics' | 'companies'>;
}) {
  const { content } = useContent();
  const related = useMemo(() => {
    const topics = new Set(q.topics);
    const companies = new Set(q.companies);
    return content.questions
      .filter((o) => o.id !== q.id)
      .map((o) => ({
        o,
        score:
          o.topics.filter((t) => topics.has(t)).length * 3 +
          (o.format === q.format ? 2 : 0) +
          o.companies.filter((c) => companies.has(c)).length,
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.o.title.localeCompare(b.o.title))
      .slice(0, LIMIT)
      .map((x) => x.o);
  }, [content.questions, q]);

  if (!related.length) return null;
  return (
    <Box component="nav" aria-label="Related questions" sx={{ mt: 4 }}>
      <Typography variant="subtitle2" component="h2" gutterBottom>
        Related questions
      </Typography>
      <Stack component="ul" sx={{ m: 0, pl: 2.5 }} spacing={0.5}>
        {related.map((r) => (
          <li key={r.id}>
            <TextLink href={questionPath(r)} variant="body2">
              {r.title}
            </TextLink>
          </li>
        ))}
      </Stack>
    </Box>
  );
}
