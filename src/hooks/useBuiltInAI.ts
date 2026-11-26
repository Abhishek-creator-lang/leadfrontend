'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { getAvailability, type AIAvailability } from '@/lib/builtInAI';
import type AIFeedbackPanelType from '@/components/ai/AIFeedbackPanel';

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

type PanelComponent = typeof AIFeedbackPanelType;

/**
 * Availability plus the feedback panel component, loaded only once the browser supports built-in
 * AI, so other browsers never download it.
 */
export function useBuiltInAIPanel(): {
  availability: AIAvailability;
  Panel: PanelComponent | null;
} {
  const availability = useBuiltInAI();
  const [Panel, setPanel] = useState<PanelComponent | null>(null);
  useEffect(() => {
    if (availability === 'unavailable') return;
    let cancelled = false;
    import('@/components/ai/AIFeedbackPanel').then(
      (m) => !cancelled && setPanel(() => m.default as ComponentType as PanelComponent)
    );
    return () => {
      cancelled = true;
    };
  }, [availability]);
  return { availability, Panel };
}
