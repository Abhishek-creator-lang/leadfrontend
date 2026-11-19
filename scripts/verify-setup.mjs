import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Sandpack's runner is Jest-like; expose `jest` as an alias so tests written for it also run here.
globalThis.jest = globalThis.vi;
afterEach(() => cleanup());
