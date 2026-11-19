import { Stack, SxProps, Theme, Typography } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

/** Clock icon + "`minutes` min". */
export function DurationLabel({ minutes, sx }: { minutes: number; sx?: SxProps<Theme> }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={[{ color: 'text.secondary' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
      <Typography variant="caption">{minutes} min</Typography>
    </Stack>
  );
}
