'use client';

import { useEffect, useState } from 'react';
import { getAvailability, type AIAvailability } from '@/lib/builtInAI';

/** Whether Chrome's on-device AI can be used here. 'unavailable' until checked (and on the server). */
export function useBuiltInAI(): AIAvailability {
  const [availability, setAvailability] = useState<AIAvailability>('unavailable');
  useEffect(() => {
    let cancelled = false;
    getAvailability().then((a) => !cancelled && setAvailability(a));
    return () => {
      cancelled = true;
    };
  }, []);
  return availability;
}
