'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionState } from '@/lib/actionState';
import { fieldErrors } from '@/lib/validation/auth';
import { supportSettingsSchema } from '@/lib/validation/support';
import { PATHS } from '@/routes/paths';
import { requireSuperAdmin } from '@/server/auth/dal';
import { setSetting } from '@/server/repositories/settings';
import { SUPPORT_CACHE_TAG, SUPPORT_SETTINGS_KEY } from '@/server/support';

const bool = (form: FormData, key: string) => form.get(key) === 'on';

/** Comma/space separated rupee amounts → sorted unique positive integers. */
const parseAmounts = (raw: FormDataEntryValue | null) =>
  [
    ...new Set(
      String(raw ?? '')
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number)
    ),
  ].sort((a, b) => a - b);

export async function saveSupportSettingsAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  const user = await requireSuperAdmin(PATHS.adminSupport);
  const str = (key: string) => String(form.get(key) ?? '');

  const parsed = supportSettingsSchema.safeParse({
    enabled: bool(form, 'enabled'),
    upiId: str('upiId'),
    payeeName: str('payeeName'),
    amounts: parseAmounts(form.get('amounts')),
    heading: str('heading'),
    message: str('message'),
    paymentNote: str('paymentNote'),
    thankYou: str('thankYou'),
    externalUrl: str('externalUrl'),
    externalLabel: str('externalLabel'),
    showInHeader: bool(form, 'showInHeader'),
    showInSidebar: bool(form, 'showInSidebar'),
    showOnDashboard: bool(form, 'showOnDashboard'),
  });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.amounts)
      errors.amounts = 'Use up to 6 whole amounts between 1 and 100000, e.g. 49, 99, 199';
    return { errors };
  }

  await setSetting(SUPPORT_SETTINGS_KEY, parsed.data, user.id);
  revalidateTag(SUPPORT_CACHE_TAG);
  // The header, sidebar and dashboard on every page read these settings.
  revalidatePath('/', 'layout');
  return {
    ok: true,
    message: parsed.data.enabled
      ? 'Saved. The support button is live.'
      : 'Saved. Support is turned off.',
  };
}
