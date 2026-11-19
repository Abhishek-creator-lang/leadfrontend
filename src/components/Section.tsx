import { ReactNode } from 'react';
import NextLink from 'next/link';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

/** A titled block of a page, with an optional action on the right of the heading. */
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" fontWeight={700}>
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Box>
  );
}

/** "View all →" style link button, typically used as a `Section` action. */
export function ViewAllButton({
  href,
  children = 'View all',
}: {
  href: string;
  children?: ReactNode;
}) {
  return (
    <Button component={NextLink} href={href} endIcon={<ArrowForwardRoundedIcon />}>
      {children}
    </Button>
  );
}
