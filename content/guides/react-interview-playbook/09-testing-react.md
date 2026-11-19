---
title: Testing React
description: A practical testing strategy for React apps, covering React Testing Library, user-event, mocking the network with MSW, testing hooks and async UI, end-to-end tests, and what to say about strategy at senior level.
source: original
---
Testing questions come in three forms: "write a test for this component", "how do you test X (async, hooks, context)?", and "what's your testing strategy?". The first two check hands-on skill. The third is where senior and lead candidates stand out.

## The guiding principle

> Test the way users use your software.

Tests should interact with rendered output (roles, labels, text) and assert on visible outcomes, not on component internals like state values or which hooks ran. Tests written this way survive refactors and catch real regressions.

## The tool landscape

| Layer | Tools | What it verifies |
| --- | --- | --- |
| Static | TypeScript, ESLint (including `react-hooks` and `jsx-a11y`) | Types, hooks rules, common a11y mistakes |
| Unit | Vitest or Jest | Pure functions, reducers, utilities |
| Component / integration | React Testing Library (RTL) + `@testing-library/user-event` + MSW, in jsdom or happy-dom | Components and features with realistic interactions |
| Browser component tests | Vitest Browser Mode, Playwright component testing, Storybook interaction tests | Real browser rendering, layout-dependent behavior |
| End-to-end | Playwright, Cypress | Critical user journeys against a running app |
| Visual regression | Chromatic, Playwright screenshots | Unintended visual changes |
| Accessibility | axe-core (jest-axe, @axe-core/playwright) | Automated WCAG checks (catches only a portion of issues) |

Enzyme is effectively dead (no React 18 adapter). `react-test-renderer` is deprecated as of React 19. If you mention them, mention them as legacy.

## RTL essentials

### Query priority

1. `getByRole` (with `name`): the closest match to how assistive technology sees the page
2. `getByLabelText`: form fields
3. `getByPlaceholderText`, `getByText`, `getByDisplayValue`
4. `getByAltText`, `getByTitle`
5. `getByTestId`: last resort

| Variant | Not found | Use for |
| --- | --- | --- |
| `getBy…` | Throws | Elements that should be present now |
| `queryBy…` | Returns `null` | Asserting absence |
| `findBy…` | Async, retries until timeout | Elements that appear after async work |

### A complete example

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SearchUsers } from './SearchUsers';

const server = setupServer(
  http.get('/api/users', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q');
    return HttpResponse.json(q === 'ada' ? [{ id: '1', name: 'Ada Lovelace' }] : []);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('shows matching users as the user types', async () => {
  const user = userEvent.setup();
  render(<SearchUsers />);

  await user.type(screen.getByRole('searchbox', { name: /search users/i }), 'ada');

  expect(await screen.findByRole('option', { name: 'Ada Lovelace' })).toBeInTheDocument();
});

test('shows an empty state when nothing matches', async () => {
  const user = userEvent.setup();
  render(<SearchUsers />);
  await user.type(screen.getByRole('searchbox', { name: /search users/i }), 'zzz');
  expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
});

test('shows an error when the request fails', async () => {
  server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 })));
  const user = userEvent.setup();
  render(<SearchUsers />);
  await user.type(screen.getByRole('searchbox', { name: /search users/i }), 'ada');
  expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
});
```

Points worth calling out:

- **`userEvent.setup()`** simulates real interaction sequences (focus, keydown, input, keyup), unlike `fireEvent`.
- **MSW** intercepts at the network level, so the component's real fetch code runs. No mocking of `fetch` or your API module.
- **`onUnhandledRequest: 'error'`** catches unexpected calls.
- Tests cover the happy path, the empty state, and the error state.
- Queries by role double as an accessibility check: if you can't find it by role, a screen reader user may not find it either.

## Async patterns

- Prefer `findBy…` over `waitFor(() => getBy…)`.
- Use `waitFor` for assertions that aren't about one element appearing, and keep it to a single assertion with no side effects inside.
- `waitForElementToBeRemoved` for loading spinners.
- **Fake timers** for debounce and intervals: `vi.useFakeTimers()` and `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.

### The `act` warning

RTL wraps `render` and user-event in `act` for you. If you see "not wrapped in act(…)" warnings, a state update happened *after* the test stopped waiting, usually a missing `await findBy…`. Fix the test so it waits for the final UI, rather than wrapping things in `act` yourself. In React 18.3+/19, import `act` from `react` (`react-dom/test-utils` `act` is deprecated).

## Testing hooks

Test custom hooks through a component that uses them when possible. For reusable hooks, `renderHook` (now part of RTL):

```ts
import { renderHook, act } from '@testing-library/react';

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter(5));
  act(() => result.current.increment());
  expect(result.current.count).toBe(6);
});
```

## Testing with providers

Create a custom render that wraps components with your app's providers:

```tsx
function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}
```

Use a **fresh QueryClient per test** (to avoid cache leakage) and turn off retries so failure tests don't time out.

## What not to test

- Implementation details: internal state, private functions, number of renders (unless performance is the feature).
- Third-party library internals.
- Exact styles (use visual regression instead).
- Snapshot tests of large trees. They're brittle and get approved without being read. Small, targeted inline snapshots are fine.

## Server Components and Next.js

Async Server Components aren't well supported by jsdom-based RTL yet. Common approaches:

- Unit-test the data functions and the client components separately.
- Cover server-rendered pages with Playwright E2E tests.
- Test Server Functions as plain async functions (validation, authorization).

## End-to-end tests

Keep them few and focused on revenue-critical or risk-critical journeys: sign-up, login, checkout, the core create/edit flow.

```ts
import { test, expect } from '@playwright/test';

test('user can add an item to the cart and check out', async ({ page }) => {
  await page.goto('/products/red-shoes');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: /cart \(1\)/i }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
});
```

Playwright's locators and auto-waiting cut down on flakiness. Use test ids only where roles aren't practical.

## Testing strategy (senior/lead answer)

Two common shapes:

| Model | Shape | When |
| --- | --- | --- |
| Testing pyramid | Many unit, fewer integration, few E2E | Logic-heavy libraries |
| Testing trophy | Static analysis base, **most at integration**, some unit and E2E | Typical React apps, where integration tests give the best confidence per cost |

A lead-level strategy covers:

1. **Risk-based coverage:** test what breaks the business, not a coverage percentage. Track coverage, but don't gate on a single global number.
2. **Speed budgets:** unit and integration suites under about 5 minutes in CI, parallelized. E2E on merge and nightly.
3. **Flake policy:** quarantine flaky tests within a day, track flake rate, fix or delete.
4. **Ownership:** tests live next to code; the owning team fixes failures.
5. **Contract tests** between front end and APIs (schema validation, generated types, MSW handlers derived from OpenAPI).
6. **Accessibility:** axe checks in component and E2E tests plus periodic manual audits with screen readers.
7. **Preview environments:** each PR deploys a preview for product and design review, and runs smoke E2E tests.

## Common interview questions

1. Why prefer `getByRole`? (It mirrors assistive tech, encourages accessible markup, and survives refactors.)
2. How do you test a debounced input? (Fake timers plus user-event with `advanceTimers`.)
3. How do you mock API calls? (MSW at the network layer.)
4. What's wrong with testing internal state? (Couples the test to implementation, so refactors break it without any behavior change.)
5. How do you deal with flaky E2E tests? (Auto-waiting locators, isolated test data, no arbitrary sleeps, a quarantine process.)
