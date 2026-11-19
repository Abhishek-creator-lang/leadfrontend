## TL;DR

The **Strategy pattern** defines a **family of interchangeable algorithms behind a common interface** and lets the caller **pick one at runtime**. The code that uses the algorithm (the *context*) doesn't care which strategy it gets. It replaces growing `if/else` or `switch` chains with a **lookup of pluggable behaviours**, so adding a new variant doesn't require modifying existing code. In JavaScript, a strategy is usually **just a function**, and a set of strategies is an **object or Map of functions**.

## Before: conditionals everywhere

```js
function shippingCost(order, method) {
  if (method === 'standard') return order.weightKg * 1.5;
  if (method === 'express') return 10 + order.weightKg * 3;
  if (method === 'pickup') return 0;
  throw new Error(`Unknown method ${method}`);
}
```

Every new carrier edits this function (and its tests), and logic for different carriers is tangled together.

## After: strategies

```js
const shippingStrategies = {
  standard: (order) => order.weightKg * 1.5,
  express: (order) => 10 + order.weightKg * 3,
  pickup: () => 0,
};

function shippingCost(order, method) {
  const strategy = shippingStrategies[method];
  if (!strategy) throw new Error(`Unknown shipping method: ${method}`);
  return strategy(order);
}

// extending: add an entry (or register one from a plugin module)
shippingStrategies.drone = (order) => (order.weightKg <= 2 ? 25 : Infinity);
```

Use `Object.hasOwn(shippingStrategies, method)` or a `Map` if `method` comes from user input, so a value like `'toString'` can't resolve to an inherited function.

## Strategies you already use

```js
items.sort((a, b) => a.price - b.price);   // comparator = sorting strategy
items.toSorted(byName);
arr.filter(isActive);                       // predicate strategy
new Intl.Collator('de', { sensitivity: 'base' }).compare; // comparison strategy
JSON.stringify(data, replacer);             // serialisation strategy
```

Passing behaviour as an argument is the functional form of Strategy.

## Class-based form (when strategies carry state or several methods)

```js
class RetryPolicy {
  constructor(strategy) { this.strategy = strategy; }
  async run(task) {
    for (let attempt = 1; ; attempt++) {
      try { return await task(); }
      catch (err) {
        const delay = this.strategy.nextDelay(attempt, err);
        if (delay == null) throw err;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}

const exponential = { nextDelay: (n) => (n < 5 ? 100 * 2 ** n : null) };
const noRetry = { nextDelay: () => null };

await new RetryPolicy(exponential).run(() => fetch('/api/report'));
```

## Front-end use cases

- **Validation rules** selected per field type (`email`, `phone`, `iban`).
- **Rendering by type**: a map from block type to component in a CMS page renderer (`const Component = blocks[block.type]`).
- **Pricing, tax and discount rules** per region or customer tier.
- **Auth providers** (password, OAuth, passkey) behind one `signIn()` interface.
- **Caching strategies** in service workers (cache-first, network-first, stale-while-revalidate), which is exactly how Workbox models them.
- **Feature flags / A/B tests** choosing between implementations.
- **Layout algorithms** (grid vs list) or chart scales.

## Benefits

- **Open/closed**: add behaviour without editing the context.
- **Testability**: each strategy is a small pure function you can test alone; the context can be tested with a fake strategy.
- **Runtime flexibility**: choose based on config, user settings or environment.

## Pitfalls

- **Overkill for two stable branches**: an `if` is clearer. Introduce strategies when variants grow or vary independently.
- **Inconsistent interfaces** between strategies; define the contract (TypeScript type or JSDoc).
- **Leaking selection logic**: the code choosing the strategy can become the new giant `switch`. Keep selection in one place (a registry or factory).
- **Unvalidated keys** from user input (see `Object.hasOwn` note above).

## In an interview, mention…

- Interchangeable algorithms behind one interface, chosen at runtime.
- Functions and lookup maps as the idiomatic JS form, with comparators as a familiar example.
- Concrete UI examples (block renderers, validators, SW caching strategies) and when not to use it.
