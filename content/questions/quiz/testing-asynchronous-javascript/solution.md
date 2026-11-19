## TL;DR

Make the test runner **wait for the async work**: write the test as an **`async` function and `await`** the code (or `return` the promise). Assert rejections with **`await expect(p).rejects.toThrow()`**. Control timers with **fake timers** instead of real waiting, mock the network at a boundary (MSW), and in UI tests use **`findBy*`/`waitFor`** to wait for the DOM to update. The classic bug is a test that **finishes before the assertion runs** and passes for the wrong reason.

## Promises and async/await

```js
import { test, expect } from 'vitest';
import { fetchUser } from './api';

test('resolves with the user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('Ada');
});

test('rejects for unknown users', async () => {
  await expect(fetchUser(999)).rejects.toThrow(/not found/i);
});
```

The broken version:

```js
test('passes even though it should fail', () => {
  fetchUser(1).then((u) => expect(u.name).toBe('WRONG')); // no await/return
}); // test ends immediately; the failing assertion fires later (or is lost)
```

Guard against this with `expect.assertions(n)` / `expect.hasAssertions()` in tests with conditional or callback-based assertions, and enable lint rules such as `@typescript-eslint/no-floating-promises` or the testing plugins' `valid-expect`.

## Callback-style APIs

Wrap them in a promise, or use the runner's callback support:

```js
test('emits ready', async () => {
  const emitter = createConnection();
  const payload = await new Promise((resolve) => emitter.once('ready', resolve));
  expect(payload.ok).toBe(true);
});
```

Jest's `done` callback still exists but is easy to misuse (an exception thrown in the callback may not reach the runner); prefer promises.

## Timers: don't actually wait

```js
import { vi, beforeEach, afterEach } from 'vitest';
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('debounced save fires once after 500 ms', () => {
  const save = vi.fn();
  const debounced = debounce(save, 500);
  debounced('a'); debounced('b');
  vi.advanceTimersByTime(499);
  expect(save).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(save).toHaveBeenCalledWith('b');
});
```

When timers and promises interleave (e.g. retry with backoff), use the async variants (`await vi.advanceTimersByTimeAsync(1000)`, `await vi.runAllTimersAsync()`) so pending microtasks run between timer callbacks. Some setups can't use fake timers (a policy, or a library that captured the real `setTimeout`); then use very short real delays with generous margins.

## Network

Mock at the HTTP boundary with MSW (or a stubbed `fetch`) so tests are deterministic and offline:

```js
server.use(http.get('/api/user/1', () => HttpResponse.json({ name: 'Ada' })));
server.use(http.get('/api/user/2', () => new HttpResponse(null, { status: 500 })));
```

Test loading, success, error, empty and slow states, plus **race conditions** (the second request resolves before the first) and **cancellation** (`AbortController` aborts on unmount).

## UI updates (Testing Library)

```jsx
render(<Profile id={1} />);
expect(screen.getByRole('status')).toBeTruthy();             // loading state
expect(await screen.findByRole('heading', { name: 'Ada' })).toBeTruthy(); // waits up to 1 s
await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
```

- `findBy*` = `getBy*` + `waitFor`. Use it for elements that appear asynchronously.
- Put **one assertion** in `waitFor` callbacks and no side effects (it retries the callback).
- "not wrapped in `act(...)`" warnings in React usually mean an update happened after the test finished; await the final UI state.

## End-to-end

Playwright/Cypress assertions auto-retry (`await expect(locator).toBeVisible()`). Never use fixed sleeps (`waitForTimeout(3000)`), which are slow and flaky; wait for a condition, a network response (`page.waitForResponse`) or a UI state.

## Pitfalls

- Unawaited promises → false positives.
- Real timers/network → slow, flaky tests.
- Leaking async work between tests (timers left running, unresolved promises): clean up in `afterEach`, restore real timers, close servers.
- Unhandled rejections in tests: configure the runner to fail on them.

## In an interview, mention…

- `async`/`await` in tests, `.rejects`, and assertion counting.
- Fake timers (including async variants) for time-based logic.
- MSW for network, `findBy`/`waitFor` for UI, auto-waiting in E2E.
- How you'd hunt and fix flaky async tests.
