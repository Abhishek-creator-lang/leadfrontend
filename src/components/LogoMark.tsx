'use client';

import { useId } from 'react';

/**
 * Brand mark: an "L" growing a leaf, on a soft gold tile. Same artwork as public/favicon.svg
 * and src/app/apple-icon.tsx; keep the three in sync.
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  const id = `logo-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBDB9D" />
          <stop offset="1" stopColor="#EEB444" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill={`url(#${id})`} />
      <path
        d="M11.5 13.5V24H21.5"
        fill="none"
        stroke="#121416"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 12.2C10.9 7.4 14.4 4.6 21.6 4.9C21.7 10.6 17.6 13.2 11.5 12.2Z"
        fill="#248F77"
      />
      <path
        d="M12.2 11.5C14.4 9.4 16.9 7.8 19.8 6.4"
        fill="none"
        stroke="#FDF1DD"
        strokeWidth=".85"
        strokeLinecap="round"
      />
    </svg>
  );
}
