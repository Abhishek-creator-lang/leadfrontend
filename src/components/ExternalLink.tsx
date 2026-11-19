import { Link, LinkProps } from '@mui/material';

/** Link to another site, opened in a new tab. */
export function ExternalLink(props: Omit<LinkProps, 'target' | 'rel'>) {
  return <Link target="_blank" rel="noreferrer" {...props} />;
}

export const isExternalUrl = (href?: string) => !!href && /^https?:\/\//.test(href);
