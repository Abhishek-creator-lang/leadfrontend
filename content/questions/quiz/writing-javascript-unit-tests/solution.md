## TL;DR

Pick a runner (Vitest, Jest, `node:test`), then for each behaviour write a small test that follows **Arrange → Act → Assert**: set up inputs, call the code, check the output or observable effect. Test **behaviour through the public interface**, not internals; cover the **happy path, edge cases and error cases**; keep tests **isolated, deterministic and fast**; and replace only true external dependencies (network, time, randomness) with test doubles.

## A worked example

```js
// cart.js
export function cartTotal(items, { discountPercent = 0 } = {}) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array');
  const subtotal = items.reduce((sum, { price, qty }) => sum + price * qty, 0);
  const discounted = subtotal * (1 - Math.min(discountPercent, 100) / 100);
  return Math.round(discounted * 100) / 100;
}
```

```js
// cart.test.js
import { describe, it, expect } from 'vitest';
import { cartTotal } from './cart.js';

describe('cartTotal', () => {
  it('sums price × quantity', () => {
    // Arrange
    const items = [{ price: 10, qty: 2 }, { price: 5.5, qty: 1 }];
    // Act
    const total = cartTotal(items);
    // Assert
    expect(total).toBe(25.5);
  });

  it('returns 0 for an empty cart', () => {
    expect(cartTotal([])).toBe(0);
  });

  it('applies a percentage discount', () => {
    expect(cartTotal([{ price: 200, qty: 1 }], { discountPercent: 15 })).toBe(170);
  });

  it('never goes below zero for discounts over 100%', () => {
    expect(cartTotal([{ price: 50, qty: 1 }], { discountPercent: 150 })).toBe(0);
  });

  it('rounds to cents', () => {
    expect(cartTotal([{ price: 0.1, qty: 3 }])).toBe(0.3);
  });

  it('rejects non-array input', () => {
    expect(() => cartTotal(null)).toThrow(TypeError);
  });
});
```

Table-driven tests keep many similar cases readable:

```js
it.each([
  [[], 0],
  [[{ price: 1, qty: 1 }], 1],
  [[{ price: 2.5, qty: 4 }], 10],
])('cartTotal(%j) = %d', (items, expected) => {
  expect(cartTotal(items)).toBe(expected);
});
```

## Choosing what to test

- **Inputs at boundaries**: empty, one item, many; zero, negative, maximum; `null`/`undefined`; unusual strings (Unicode, whitespace).
- **Branches**: each `if` path, error paths, early returns.
- **Contracts**: return values, thrown errors, calls to injected collaborators, emitted events.
- Skip trivial getters and framework glue; test the logic that can actually be wrong.

## Handling dependencies

Design for testability: pass dependencies in rather than importing singletons.

```js
export function createGreeter({ now = () => new Date() } = {}) {
  return (name) => (now().getHours() < 12 ? `Good morning, ${name}` : `Hello, ${name}`);
}

it('greets in the morning', () => {
  const greet = createGreeter({ now: () => new Date('2026-01-01T09:00:00') });
  expect(greet('Ada')).toBe('Good morning, Ada');
});
```

When injection isn't possible, use the runner's tools: `vi.fn()`/`jest.fn()` spies, module mocks (`vi.mock`), fake timers (`vi.useFakeTimers()`, `vi.setSystemTime()`), and MSW for HTTP.

## Qualities of a good unit test

- **One reason to fail**: a focused assertion set per behaviour; the name says what's expected ("rounds to cents").
- **Independent**: no shared mutable state between tests; reset mocks in `beforeEach`/`afterEach` (or enable `restoreMocks` in config).
- **Deterministic**: control time, randomness, locale and time zone.
- **Fast**: milliseconds, so the whole suite runs on every save.
- **Readable**: test code is documentation; prefer explicit data over clever helpers.
- **Fails for the right reason**: watch a new test fail first (or temporarily break the code) to prove it can catch a bug.

## Running

```bash
npx vitest           # watch mode
npx vitest run --coverage
```

Run tests in CI on every pull request and treat flaky tests as bugs.

## In an interview, mention…

- AAA structure, behaviour over implementation, edge and error cases.
- Dependency injection for testability, and runner-level mocks/fake timers when needed.
- Determinism and independence, and verifying a test can fail.
