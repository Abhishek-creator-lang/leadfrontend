## TL;DR

Mocks and stubs are **test doubles**: stand-ins for real dependencies (network, database, time, third-party SDKs) that make tests **fast, deterministic and isolated**. A **stub** returns **canned answers** so the code under test can run ("the API returns this user"); you assert on the code's *output*. A **mock** is pre-programmed with **expectations about how it's called**, and the test verifies those *interactions* ("`analytics.track` was called once with `'purchase'`"). A **spy** records calls on a real or fake function; a **fake** is a working lightweight implementation (in-memory DB). Use doubles at the **boundaries**, not for everything.

## The family of test doubles

| Double | Purpose | Example |
|---|---|---|
| Dummy | Fills a parameter, never used | `new Service(null)` |
| Stub | Returns fixed data | `getUser = () => Promise.resolve({ id: 1 })` |
| Spy | Records calls (may call through) | `vi.spyOn(console, 'error')` |
| Mock | Spy + expectations verified by the test | `expect(track).toHaveBeenCalledWith('purchase', …)` |
| Fake | Simplified working implementation | In-memory repository, MSW request handlers |

In Jest/Vitest, `vi.fn()`/`jest.fn()` creates a function that can act as stub, spy or mock depending on how you use it.

## Stub example: control inputs

```js
import { vi, test, expect } from 'vitest';
import { loadGreeting } from './greeting';

test('greets the user by name', async () => {
  const api = { getUser: vi.fn().mockResolvedValue({ name: 'Ada' }) }; // stub
  await expect(loadGreeting(api, 1)).resolves.toBe('Hello, Ada');
});

test('falls back when the user cannot be loaded', async () => {
  const api = { getUser: vi.fn().mockRejectedValue(new Error('500')) };
  await expect(loadGreeting(api, 1)).resolves.toBe('Hello, guest');
});
```

## Mock example: verify interactions

```js
test('tracks a purchase once the order succeeds', async () => {
  const analytics = { track: vi.fn() };                 // mock
  const orders = { create: vi.fn().mockResolvedValue({ id: 'o1', total: 42 }) };

  await checkout({ orders, analytics }, cart);

  expect(analytics.track).toHaveBeenCalledTimes(1);
  expect(analytics.track).toHaveBeenCalledWith('purchase', { orderId: 'o1', value: 42 });
});
```

Interaction checks make sense when the side effect *is* the behaviour (sending an event, calling a callback prop, writing to storage).

## Module mocking and spies

```js
vi.mock('./payments', () => ({ charge: vi.fn().mockResolvedValue({ ok: true }) }));

const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
// … assert errorSpy calls …
errorSpy.mockRestore();
```

## Network fakes with MSW

```js
import { http, HttpResponse } from 'msw';
server.use(
  http.get('/api/user/:id', ({ params }) => HttpResponse.json({ id: params.id, name: 'Ada' }))
);
```

Mocking at the network boundary lets the real `fetch` code, error handling and parsing run, so tests break only when actual behaviour changes. It's usually preferable to mocking your own `apiClient` module in component tests.

## Time and randomness

```js
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
startCountdown();
vi.advanceTimersByTime(1000);
vi.useRealTimers();

vi.spyOn(Math, 'random').mockReturnValue(0.42);
```

## Pitfalls

- **Over-mocking**: when every collaborator is mocked, tests only verify that the code calls what it currently calls. Refactors break them, while real bugs pass. Mock at boundaries (network, clock, browser APIs, third-party SDKs), use real implementations inside.
- **Mocks drifting from reality**: a stub returns a shape the real API no longer sends. Generate mocks from schemas/OpenAPI, share MSW handlers, add contract tests.
- **Leaking state**: forgetting `mockReset`/`restoreAllMocks` between tests causes order-dependent failures. Enable `restoreMocks`/`clearMocks` in config.
- **Hoisting surprises**: `vi.mock`/`jest.mock` calls are hoisted above imports; variables they reference must be prefixed or defined with `vi.hoisted`.
- **Asserting on implementation details** (internal function calls, component state) instead of outcomes.

## In an interview, mention…

- Stub = control inputs/state verification; mock = verify interactions/behaviour verification.
- The wider double family (spy, fake) and how `vi.fn()` covers several roles.
- Mocking at boundaries, MSW for HTTP, fake timers for time.
- The over-mocking trap and keeping mocks honest with contracts.
