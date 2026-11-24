'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Box } from '@mui/material';

/**
 * Thin progress bar at the top of the viewport during client-side navigation.
 *
 * The App Router gives no feedback while the next page's server data loads, so users clicked
 * links repeatedly. The bar starts on internal link clicks (or `startNavigationProgress()` for
 * programmatic `router.push`) and finishes when the URL actually changes.
 */

const START_EVENT = 'app:navigation-start';
/** Navigations faster than this never show the bar, so instant ones don't flicker. */
const SHOW_DELAY_MS = 120;
/** Safety net: a cancelled navigation or one that ends on the same URL never changes the route. */
const MAX_DURATION_MS = 10_000;
const FINISH_MS = 250;

const currentUrl = () => window.location.pathname + window.location.search;

/**
 * Start the bar for navigations that don't come from a link click (e.g. `router.push`).
 * Does nothing when `href` is the current URL, since the route wouldn't change to finish it.
 */
export function startNavigationProgress(href: string) {
  const url = new URL(href, window.location.href);
  if (url.pathname + url.search === currentUrl()) return;
  window.dispatchEvent(new Event(START_EVENT));
}

/** True when a click on this anchor will trigger a same-origin client navigation to a new URL. */
function isNavigatingClick(e: MouseEvent, a: HTMLAnchorElement) {
  if (e.defaultPrevented || e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return false;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Hash-only and same-URL links don't navigate.
  return url.pathname + url.search !== currentUrl();
}

type Phase = 'idle' | 'loading' | 'finishing';

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const start = () => {
      clearTimers();
      timers.current.push(
        window.setTimeout(() => setPhase('loading'), SHOW_DELAY_MS),
        window.setTimeout(() => setPhase('idle'), MAX_DURATION_MS)
      );
    };
    // Capture phase: runs before next/link calls preventDefault on the click.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (a instanceof HTMLAnchorElement && isNavigatingClick(e, a)) start();
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener(START_EVENT, start);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener(START_EVENT, start);
      clearTimers();
    };
  }, []);

  // The route changed: complete the bar (if it was shown) and reset.
  useEffect(() => {
    clearTimers();
    setPhase((p) => (p === 'loading' ? 'finishing' : 'idle'));
    timers.current.push(window.setTimeout(() => setPhase('idle'), FINISH_MS));
  }, [pathname, searchParams]);

  return (
    <Box
      aria-hidden
      sx={(t) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        height: 3,
        zIndex: t.zIndex.tooltip + 1,
        bgcolor: 'primary.main',
        boxShadow: `0 0 8px ${t.palette.primary.main}`,
        pointerEvents: 'none',
        width: phase === 'idle' ? 0 : phase === 'loading' ? '85%' : '100%',
        opacity: phase === 'loading' ? 1 : 0,
        // Grows quickly at first and slows down while waiting; jumps to full width on finish.
        transition:
          phase === 'loading'
            ? 'width 8s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.1s'
            : phase === 'finishing'
              ? `width ${FINISH_MS * 0.6}ms ease-out, opacity ${FINISH_MS}ms ease ${FINISH_MS * 0.4}ms`
              : 'none',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'opacity 0.1s',
          width: phase === 'idle' ? 0 : '100%',
        },
      })}
    />
  );
}

/** `useSearchParams` needs a Suspense boundary in the App Router. */
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
