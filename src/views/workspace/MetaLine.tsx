import { Stack } from '@mui/material';
import { DifficultyChip, FormatChip, TagChip } from '@/components/Chips';
import { DurationLabel } from '@/components/DurationLabel';
import type { QuestionMeta } from '@/content/types';

/** Format, difficulty, duration and topic chips shown under a question title. */
export function MetaLine({ q }: { q: QuestionMeta }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <FormatChip format={q.format} quizCategory={q.quizCategory} />
      <DifficultyChip difficulty={q.difficulty} />
      <DurationLabel minutes={q.duration} />
      {q.topics.map((t) => (
        <TagChip key={t} label={t} />
      ))}
    </Stack>
  );
}
