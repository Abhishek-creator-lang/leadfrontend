import { Chip, ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BRAND_COLORS } from '@/constants/colors';
import { FORMAT_INFO, QUIZ_CATEGORY_LABEL } from '@/content/formats';
import type { Difficulty, Format, QuizCategory } from '@/content/types';
import { capitalize } from '@/utils/format';

const CHIP_HEIGHT = 22;

/** Coloured text on a 10% tint of the same colour. */
const tintedChipSx = (color: string) => ({
  color,
  bgcolor: alpha(color, 0.1),
  fontWeight: 600,
  height: CHIP_HEIGHT,
});

export function DifficultyChip({ difficulty, ...rest }: { difficulty: Difficulty } & ChipProps) {
  return (
    <Chip
      size="small"
      label={capitalize(difficulty)}
      sx={tintedChipSx(BRAND_COLORS[difficulty])}
      {...rest}
    />
  );
}

export function FormatChip({
  format,
  quizCategory,
}: {
  format: Format;
  quizCategory?: QuizCategory;
}) {
  const info = FORMAT_INFO[format];
  const label =
    format === 'quiz' && quizCategory ? `Quiz · ${QUIZ_CATEGORY_LABEL[quizCategory]}` : info.short;
  return <Chip size="small" label={label} sx={tintedChipSx(info.color)} />;
}

export function TagChip({ label }: { label: string }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={label}
      sx={{ height: CHIP_HEIGHT, fontWeight: 500 }}
    />
  );
}
