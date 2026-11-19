## TL;DR

The common stack today: **Vitest** or **Jest** as the test runner for unit and component tests, **Testing Library** for querying the DOM like a user, **MSW** for mocking the network, and **Playwright** (or **Cypress**) for end-to-end tests in real browsers. **Node's built-in `node:test`** is a zero-dependency option for libraries and backend code. **Storybook** test tooling covers component and visual testing. Choose based on your build tool, environment and team familiarity.

## Test runners (unit / integration)

**Vitest**

- Uses Vite's pipeline, so ESM, TypeScript and JSX work with the same config as your app; very fast watch mode.
- Jest-compatible API (`describe`, `it`, `expect`, `vi.fn()`, `vi.mock()`), snapshot testing, built-in coverage (V8 or Istanbul).
- **Browser mode** runs tests in real browsers via Playwright/WebdriverIO.
- The default choice for Vite-based projects and increasingly elsewhere.

**Jest**

- Long-time standard, huge ecosystem, built-in mocking, snapshots, fake timers, jsdom environment.
- ESM support has historically required configuration; transforms via Babel or SWC.
- Still common in React Native and many existing codebases.

**`node:test`** (Node 18+, stable in 20)

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('adds', () => assert.equal(1 + 1, 2));
```

No dependencies, built-in mocking and coverage; less tooling for DOM testing.

Older/other runners you may see: **Mocha** (+ Chai assertions, Sinon mocks), **Jasmine**, **AVA**, Bun's and Deno's built-in test runners.

## DOM / component testing

**Testing Library** (`@testing-library/react`, `/vue`, `/svelte`, `/dom`, `user-event`):

```jsx
render(<Login />);
await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
expect(await screen.findByText(/welcome/i)).toBeTruthy();
```

Encourages testing behaviour through accessible roles and labels rather than implementation details. Works with either runner, typically on jsdom or happy-dom.

## End-to-end

**Playwright**

- Chromium, Firefox and WebKit from one API; auto-waiting locators; parallel by default; tracing with DOM snapshots, network and console; codegen; API testing; component testing (experimental).
- Strong choice for new projects.

**Cypress**

- Runs inside the browser with a great interactive runner and time-travel debugging; component testing support.
- Historically limited around multiple tabs/origins and Safari (WebKit support is experimental).

**WebdriverIO / Selenium**: WebDriver-based, broad device and cloud grid support, common in QA-heavy organisations.

## Supporting tools

- **MSW (Mock Service Worker)**: intercepts `fetch`/XHR at the network level in browser and Node, so the same mocks serve tests, Storybook and local development.
- **Storybook** with interaction tests, a11y addon, and visual testing services (Chromatic).
- **axe-core** (`vitest-axe`, `@axe-core/playwright`) for automated accessibility checks.
- **fast-check** for property-based testing, **Stryker** for mutation testing.

## How to choose

| Context | Reasonable default |
|---|---|
| Vite / modern ESM app | Vitest + Testing Library + MSW + Playwright |
| Existing Jest setup that works | Keep Jest; migrate only with a reason (speed, ESM pain) |
| Node library | `node:test` or Vitest |
| Heavy cross-browser needs | Playwright (or a WebDriver grid) |

## In an interview, mention…

- Runner vs DOM utility vs E2E framework: they're layers, not competitors.
- Why Testing Library's user-centric queries lead to resilient tests.
- Why you'd pick Playwright or Cypress, and Vitest vs Jest trade-offs.
- MSW for consistent network mocking across environments.
