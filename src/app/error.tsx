'use client';

import { Alert, Box, Button } from '@mui/material';

// Replaces the old <ErrorBoundary> around the router.
export default function RouteError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Box sx={{ p: 4, maxWidth: 720, mx: 'auto' }}>
      <Alert severity="error" action={<Button onClick={() => reset()}>Retry</Button>}>
        Something went wrong: {error.message}
      </Alert>
    </Box>
  );
}
