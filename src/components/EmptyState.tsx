import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

// Adapted from mt-business-frontend/src/components/feedback/EmptyState.tsx
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2, color: 'text.secondary' }}>
      <InboxRoundedIcon sx={{ fontSize: 48, opacity: 0.5 }} />
      <Typography variant="h6" color="text.primary" sx={{ mt: 1 }}>
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
