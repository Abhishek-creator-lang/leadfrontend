import { Chip, Stack } from '@mui/material';
import type { StudyPlan } from '@/content/types';
import { pluralize } from '@/utils/format';
import { formatHours, planQuestionIds, totalMinutes } from '@/utils/progress';

/** Duration / workload chips for a study plan. `detailed` adds the audience and merges the schedule. */
export function PlanStats({ plan, detailed = false }: { plan: StudyPlan; detailed?: boolean }) {
  const ids = planQuestionIds(plan);
  const weeks = pluralize(plan.weeks, 'week');
  const total = formatHours(totalMinutes(ids));

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
      {detailed ? (
        <>
          <Chip size="small" label={`For: ${plan.audience}`} />
          <Chip
            size="small"
            variant="outlined"
            label={`${weeks} · ${plan.hoursPerWeek} hrs/week`}
          />
          <Chip size="small" variant="outlined" label={`~${total} of practice`} />
        </>
      ) : (
        <>
          <Chip size="small" variant="outlined" label={pluralize(ids.length, 'question')} />
          <Chip size="small" variant="outlined" label={weeks} />
          <Chip size="small" variant="outlined" label={`${plan.hoursPerWeek} hrs/week`} />
          <Chip size="small" variant="outlined" label={`~${total} total`} />
        </>
      )}
    </Stack>
  );
}
