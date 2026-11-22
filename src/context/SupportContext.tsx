'use client';

import { createContext, useContext } from 'react';
import type { SupportSettings } from '@/lib/validation/support';

/** Active "Buy me a coffee" settings, or null when the feature is off or not configured. */
export const SupportContext = createContext<SupportSettings | null>(null);

export const useSupportSettings = () => useContext(SupportContext);
