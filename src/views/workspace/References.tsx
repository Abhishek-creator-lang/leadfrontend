import { Box, Stack, Typography } from '@mui/material';
import { ExternalLink } from '@/components/ExternalLink';
import type { QuestionMeta } from '@/content/types';
import { stripProtocol } from '@/utils/format';

/** "References" list of external links for a question; renders nothing when there are none. */
export function References({ q }: { q: QuestionMeta }) {
  if (!q.references.length) return null;
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle2" gutterBottom>
        References
      </Typography>
      <Stack component="ul" sx={{ m: 0, pl: 2.5 }} spacing={0.5}>
        {q.references.map((r) => (
          <li key={r}>
            <ExternalLink href={r} variant="body2">
              {stripProtocol(r)}
            </ExternalLink>
          </li>
        ))}
      </Stack>
    </Box>
  );
}
