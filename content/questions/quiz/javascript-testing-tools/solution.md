## TL;DR

A complete JavaScript testing toolbox has several layers: **static checks** (TypeScript, ESLint), a **test runner** (Vitest, Jest, `node:test`), **DOM/component utilities** (Testing Library, `user-event`, jsdom/happy-dom or a real browser), **mocking** (built-in `vi.fn`/`jest.fn`, **MSW** for HTTP), **E2E browser automation** (Playwright, Cypress, WebdriverIO), **visual regression** (Playwright screenshots, Chromatic, Percy), **accessibility** (axe-core), **performance** (Lighthouse CI, size budgets), **coverage/mutation** (V8/Istanbul, Stryker) and **CI** to run it all. Each answers a different question.

## The layers and what they catch

| Layer | Tools | Catches |
|---|---|---|
| Static analysis | TypeScript, ESLint (+ `eslint-plugin-testing-library`, `jsx-a11y`, `react-hooks`), Prettier | Type errors, misuse of APIs, hook mistakes, some a11y issues |
| Test runner | Vitest, Jest, `node:test`, Mocha + Chai | Logic bugs in units and modules |
| DOM environment | jsdom, happy-dom, Vitest browser mode | Lets component tests run outside or inside a real browser |
| Component utilities | Testing Library, `user-event` | Behavioural bugs in components, from the user's perspective |
| Network mocking | MSW, nock (Node) | Deterministic API scenarios: errors, slow responses, empty data |
| Test data | Data factories (fishery, @faker-js/faker) | Readable, varied fixtures |
| E2E | Playwright, Cypress, WebdriverIO | Broken user journeys across pages, auth, real browsers |
| Visual | Playwright `toHaveScreenshot`, Chromatic, Percy, Storybook | Unintended UI changes (CSS regressions) |
| Accessibility | axe-core (`@axe-core/playwright`, `vitest-axe`), Storybook a11y addon, Lighthouse | Missing labels, contrast, ARIA misuse (a subset of real issues) |
| Performance | Lighthouse CI, size-limit, bundle analysers, web-vitals in E2E | Regressions in load metrics and bundle size |
| Contract/API | Pact, schema validation (Zod/OpenAPI) | Front end and back end drifting apart |
| Quality of tests | Coverage (V8/Istanbul), Stryker mutation testing | Untested code and weak assertions |
| Cross-browser/device | Playwright projects, BrowserStack, Sauce Labs | Engine-specific bugs |

## A typical modern setup

```bash
npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event \
        happy-dom msw @playwright/test @axe-core/playwright
```

```js
// a Playwright test that also checks accessibility
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('checkout page has no detectable a11y violations', async ({ page }) => {
  await page.goto('/checkout');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Debugging aids

- **Vitest UI** and watch mode for quick feedback.
- **Playwright trace viewer** (DOM snapshots, network, console per step), UI mode, and codegen for recording locators.
- **Cypress runner** time-travel snapshots.
- `screen.debug()` / `logRoles()` in Testing Library to see what's queryable.

## Choosing tools as a lead

- Prefer tools that **share configuration with the app** (Vitest with Vite) and **share mocks across environments** (MSW in tests, Storybook and local dev).
- Optimise for **feedback speed**: fast unit/integration suites locally, parallelised and sharded E2E in CI.
- Standardise with lint rules and shared helpers (`renderWithProviders`, data builders) so tests look the same across teams.
- Automated a11y and visual checks complement, but don't replace, manual testing with keyboard and screen readers.

## In an interview, mention…

- The layered toolbox and what each layer catches.
- The specific stack you'd choose for a new project and why.
- How you'd wire it into CI (stages, parallelism, artifacts on failure) and keep it fast and trustworthy.
