'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAvailability, type AIAvailability } from '@/lib/builtInAI';

/** Chrome's on-device AI status, plus `refresh` to check again (e.g. after downloading the model). */
export function useBuiltInAIState(): {
  availability: AIAvailability;
  refresh: () => Promise<void>;
} {
  const [availability, setAvailability] = useState<AIAvailability>('unavailable');
  const refresh = useCallback(async () => setAvailability(await getAvailability()), []);
  useEffect(() => {
    let cancelled = false;
    getAvailability().then((a) => !cancelled && setAvailability(a));
    return () => {
      cancelled = true;
    };
  }, []);
  return { availability, refresh };
}

/** Whether Chrome's on-device AI can be used here. 'unavailable' until checked (and on the server). */
export function useBuiltInAI(): AIAvailability {
  return useBuiltInAIState().availability;
}
