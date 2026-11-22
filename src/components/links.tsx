'use client';

import NextLink from 'next/link';
import { Button, ButtonProps, Link, LinkProps } from '@mui/material';

/**
 * MUI + next/link wrappers that Server Components can render (a Server Component can't pass the
 * `component={NextLink}` function prop to an MUI component itself).
 */
export function LinkButton({ href, ...rest }: Omit<ButtonProps, 'href'> & { href: string }) {
  return <Button component={NextLink} href={href} {...rest} />;
}

export function TextLink({ href, ...rest }: Omit<LinkProps, 'href'> & { href: string }) {
  return <Link component={NextLink} href={href} {...rest} />;
}
