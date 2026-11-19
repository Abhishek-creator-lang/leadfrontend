## TL;DR

Good tests **verify behaviour, not implementation**, so they survive refactors and fail only when something users or callers care about breaks. They're **deterministic** (no flakiness), **independent**, **fast**, and **readable**: the name states the expectation, the body shows Arrange/Act/Assert with explicit data. Put most effort where it buys the most confidence (integration tests for UI, unit tests for tricky logic), mock only at boundaries, and treat test code with the same care as production code.

## 1. Test behaviour through public interfaces

```jsx
// brittle: tied to internals
expect(wrapper.state('isOpen')).toBe(true);
expect(container.querySelector('.dropdown__menu--visible')).toBeTruthy();

// resilient: what the user experiences
await user.click(screen.getByRole('button', { name: /filters/i }));
expect(screen.getByRole('menu')).toBeTruthy();
```

Query by role, label and text (Testing Library's priority order). This also nudges you toward accessible markup. Use `data-testid` only when there's no accessible handle.

## 2. Make tests deterministic

- Control **time** (fake timers, `setSystemTime`), **randomness** (seeded or stubbed), **locale/time zone** (set `TZ` in CI), and **network** (MSW).
- No dependence on test order or shared mutable state; reset mocks and stores in `afterEach` (or config: `restoreMocks: true`).
- In E2E, create isolated test data per test and wait for conditions, never fixed sleeps.
- Treat a flaky test as a bug: quarantine, fix the root cause, don't just add retries.

## 3. Keep them readable

```js
describe('formatDuration', () => {
  it('shows minutes and seconds under an hour', () => {
    expect(formatDuration(125)).toBe('2:05');
  });
  it('adds hours when needed', () => {
    expect(formatDuration(3725)).toBe('1:02:05');
  });
});
```

- Names describe behaviour ("shows an error when the email is taken"), not mechanics ("test case 3").
- Prefer **explicit, local setup** over deep shared fixtures. A small factory (`buildUser({ role: 'admin' })`) with sensible defaults keeps tests short while showing what matters.
- DAMP over DRY: some repetition in tests is fine if it makes each test self-explanatory.
- Avoid logic (loops, conditionals) in tests; use `it.each` for tables of cases.

## 4. One behaviour per test, meaningful assertions

- Multiple `expect`s are fine if they describe one behaviour; split tests that verify unrelated things.
- Assert on specific values, not just truthiness. `toEqual` with the exact object beats `toBeDefined()`.
- Snapshot tests: keep them small and reviewed. Giant snapshots get updated blindly and protect nothing.

## 5. Mock at boundaries only

Mock network, clock, browser APIs and third-party SDKs. Use real implementations of your own modules wherever practical. Over-mocked tests pass while the app is broken and break when it isn't.

## 6. Balance the suite

- Static analysis (TypeScript, ESLint) catches a whole class of bugs for free.
- Unit tests for complex pure logic, integration tests for features, a few E2E tests for critical journeys.
- Run fast tests on every commit and slower suites on merge or nightly; parallelise.
- Coverage is a tool for finding untested areas, not a target to game.

## 7. Write tests that can fail

Watch each new test fail at least once (write it first, or temporarily break the code). Mutation testing (Stryker) reveals tests that execute code without really checking it.

## 8. Maintain the suite like production code

- Shared test utilities (custom `render` with providers, MSW handlers, data builders) live in one place.
- Delete tests that duplicate others or test removed behaviour.
- Fix warnings (React `act`, console errors) instead of silencing them; fail tests on unexpected `console.error`.
- Review tests in code review: do they check the important behaviour and edge cases?

## In an interview, mention…

- Behaviour over implementation, with accessible queries as the concrete technique.
- Determinism and flake management, including a policy for flaky tests.
- Data builders and DAMP readability, mocking at boundaries.
- How you'd set team standards: lint rules, shared utilities, test reviews.
