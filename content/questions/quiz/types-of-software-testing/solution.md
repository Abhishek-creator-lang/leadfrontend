## TL;DR

Testing splits into **functional** testing (does it do the right thing?) and **non-functional** testing (does it do it well enough: fast, secure, accessible, reliable?). Functional tests are usually grouped by **scope**: **static analysis**, **unit**, **integration**, **end-to-end**, plus **contract**, **regression**, **smoke** and **acceptance** tests. Non-functional ones include **performance/load**, **accessibility**, **security**, **visual regression**, **compatibility** and **usability**. A good strategy mixes them by **cost vs confidence**, not by dogma.

## Functional, by scope

| Type | What it checks | Front-end example | Tools |
|---|---|---|---|
| Static | Types, lint rules, formatting | Catch `undefined` access or a missing hook dependency | TypeScript, ESLint |
| Unit | One function/module in isolation | `formatPrice(1234.5, 'EUR')` | Vitest, Jest, node:test |
| Integration / component | Several units together, real DOM | `<CheckoutForm>` validates and calls the API (mocked at the network) | Testing Library, MSW |
| End-to-end | Full app in a real browser, real or staging backend | User signs up, buys, sees confirmation | Playwright, Cypress |
| Contract | API producer and consumer agree on shapes | Front end's expectations of `/orders` stay valid | Pact, schema validation |

## Functional, by purpose

- **Regression**: rerunning tests to make sure changes didn't break existing behaviour (every test suite in CI serves this role).
- **Smoke**: a tiny, fast set of critical checks after a deploy ("homepage loads, login works").
- **Acceptance / UAT**: verifies business requirements, often written from user stories (BDD tools like Cucumber, or Playwright tests named after scenarios).
- **Exploratory**: unscripted manual testing to find what automation didn't anticipate.

## Non-functional

- **Performance**: Lighthouse CI budgets, bundle-size limits, load tests for APIs (k6, Artillery).
- **Accessibility**: automated axe checks in unit/E2E tests, plus manual screen-reader and keyboard testing (automation catches only a portion of issues).
- **Visual regression**: screenshot diffs of components or pages (Playwright screenshots, Chromatic, Percy).
- **Security**: dependency audits, SAST, DAST scans, penetration tests.
- **Compatibility**: cross-browser and device runs (Playwright's Chromium/Firefox/WebKit projects, BrowserStack).
- **Usability**: real users attempting tasks.
- **Resilience/chaos**: behaviour under slow networks, API failures, offline.

## Other dimensions you may be asked about

- **Black-box vs white-box**: testing through the public interface vs with knowledge of internals.
- **Manual vs automated**.
- **Snapshot tests**: cheap to write but easy to rubber-stamp; best for small, stable outputs.
- **Property-based tests**: generate many inputs to check invariants (fast-check).
- **Mutation testing**: measure test-suite quality by injecting bugs (Stryker).

## Building a strategy

The **test pyramid** (many unit, fewer integration, few E2E) optimises for speed. The **testing trophy** (static at the base, *most* effort in integration tests) reflects that component-level integration tests give the most confidence per cost in UI work. Practical guidance:

- Static checks everywhere, for free.
- Unit tests for pure logic with many edge cases (pricing, date handling, reducers).
- Integration tests for components and features, interacting like a user.
- A focused set of E2E tests for critical journeys (auth, checkout), run against production-like environments.
- Automated a11y and visual checks in CI, plus periodic manual audits.

## In an interview, mention…

- Functional vs non-functional and the scope ladder.
- Pyramid vs trophy, and how you'd allocate effort for a front-end app.
- The cost/speed/flakiness trade-off of each layer, and that tests are judged by the confidence they give.
