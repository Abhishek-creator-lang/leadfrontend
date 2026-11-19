## TL;DR

They differ in **scope**: a **unit test** checks one small piece (a function, hook or class) in isolation; an **integration test** checks that several pieces **work together** (a component with its children, state and a mocked network); an **end-to-end (E2E) test** drives the **whole system through a real browser**, like a user would. Moving up the ladder gives **more confidence** but costs **more time, more flakiness and harder debugging**.

## Side by side

| | Unit | Integration | End-to-end |
|---|---|---|---|
| Scope | One function/module | A feature or component tree | Whole app + backend |
| Dependencies | Mocked or none | Real modules, network mocked | Real (or staging) services |
| Speed | Milliseconds | Tens to hundreds of ms | Seconds to minutes |
| Failure tells you | Exactly which function broke | Which feature broke | That a user journey broke (somewhere) |
| Flakiness | Very low | Low | Highest (timing, environments, data) |
| Typical tools | Vitest/Jest | Testing Library + MSW, jsdom/happy-dom or browser mode | Playwright, Cypress |

## Examples for the same feature (applying a discount code)

**Unit**: pure logic.

```js
import { applyDiscount } from './pricing';

test('caps percentage discounts at the subtotal', () => {
  expect(applyDiscount(50, { type: 'percent', value: 120 })).toBe(0);
});
```

**Integration**: component, state and (mocked) API together.

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './test/server';

test('shows the discounted total after applying a code', async () => {
  server.use(http.post('/api/discounts', () => HttpResponse.json({ type: 'percent', value: 10 })));
  render(<Cart items={[{ id: 1, price: 100, qty: 1 }]} />);

  await userEvent.type(screen.getByLabelText(/discount code/i), 'SAVE10');
  await userEvent.click(screen.getByRole('button', { name: /apply/i }));

  expect(await screen.findByText('Total: $90.00')).toBeTruthy();
});
```

**End-to-end**: real browser, real routing, real backend (test environment).

```js
import { test, expect } from '@playwright/test';

test('customer can check out with a discount', async ({ page }) => {
  await page.goto('/products/blue-mug');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByLabel('Discount code').fill('SAVE10');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText('Total: $90.00')).toBeVisible();
});
```

## Where the boundaries blur

- "Unit" in React often means testing one component, which is really an integration test of the component with React and the DOM. Don't argue labels; agree on what is mocked.
- **Mocking at the network boundary** (MSW) keeps integration tests realistic: the component's real fetch code runs.
- E2E tests can stub some third parties (payments) with sandboxes or route interception.

## How to balance them

- **Unit**: complex pure logic with many edge cases (pricing, parsing, date math, reducers, utilities).
- **Integration**: the bulk of front-end tests. Test features through the UI the way users interact, using accessible queries.
- **E2E**: a small set of high-value journeys (sign-up, login, checkout, critical admin flows), plus smoke tests after deploy.

Keep E2E reliable: isolated test data, auto-waiting locators (no fixed sleeps), retries only as a diagnostic aid, traces/videos on failure, and running them in parallel.

## In an interview, mention…

- Scope, speed, confidence and debugging trade-offs.
- Integration tests as the sweet spot for UI, with network-level mocking.
- A small, stable E2E suite on critical paths and how you'd keep it unflaky.
