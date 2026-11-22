import 'server-only';
import { unstable_cache } from 'next/cache';
import {
  DEFAULT_SUPPORT_SETTINGS,
  supportSettingsSchema,
  type SupportSettings,
} from '@/lib/validation/support';
import { getSetting } from './repositories/settings';

export const SUPPORT_SETTINGS_KEY = 'support';
export const SUPPORT_CACHE_TAG = 'settings:support';

/** Stored settings merged over the defaults; invalid or missing data falls back to the defaults. */
export async function readSupportSettings(): Promise<SupportSettings> {
  const stored = await getSetting<Partial<SupportSettings>>(SUPPORT_SETTINGS_KEY);
  const parsed = supportSettingsSchema.safeParse({ ...DEFAULT_SUPPORT_SETTINGS, ...stored });
  return parsed.success ? parsed.data : DEFAULT_SUPPORT_SETTINGS;
}

const cached = unstable_cache(readSupportSettings, [SUPPORT_CACHE_TAG], {
  tags: [SUPPORT_CACHE_TAG],
});

/**
 * Support settings for rendering, cached across requests (refreshed when an admin saves them).
 * Never throws: without a database the widget is simply hidden.
 */
export async function getSupportSettings(): Promise<SupportSettings> {
  try {
    return await cached();
  } catch {
    return DEFAULT_SUPPORT_SETTINGS;
  }
}
