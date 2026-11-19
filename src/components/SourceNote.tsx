import { Typography } from '@mui/material';
import type { SourceInfo } from '@/content/types';
import { ExternalLink } from './ExternalLink';

const ATTRIBUTION: Record<Exclude<SourceInfo['type'], 'original'>, string> = {
  'mit-handbook':
    'Adapted from the Front End Interview Handbook by Yangshun Tay and contributors (MIT License).',
  'mit-awesome-fesd':
    'Adapted from Awesome Front End System Design by GreatFrontEnd (MIT License).',
};

/** Attribution line for imported, MIT-licensed content. Renders nothing for original content. */
export function SourceNote({ source }: { source: SourceInfo }) {
  if (source.type === 'original') return null;
  return (
    <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 4 }}>
      {ATTRIBUTION[source.type]}{' '}
      {source.url && <ExternalLink href={source.url}>Source</ExternalLink>}
    </Typography>
  );
}
