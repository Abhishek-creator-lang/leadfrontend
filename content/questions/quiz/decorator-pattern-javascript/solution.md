## TL;DR

The **Decorator pattern** **wraps an object or function to add behaviour without changing the original** or creating a subclass for every combination. The wrapper exposes the same interface, does something extra (logging, caching, retries, auth checks), and delegates to the wrapped thing. In JavaScript the most common form is the **higher-order function** (`withRetry(fetchUser)`), with **higher-order components** in React and the **TC39 decorator syntax** (`@logged`) for classes, which TypeScript 5+ supports and engines are implementing.

## Function decorators (most common)

```js
function withLogging(fn, label = fn.name) {
  return function (...args) {
    console.time(label);
    try {
      return fn.apply(this, args);
    } finally {
      console.timeEnd(label);
    }
  };
}

function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}

function withRetry(fn, { attempts = 3, delayMs = 200 } = {}) {
  return async (...args) => {
    for (let i = 1; ; i++) {
      try {
        return await fn(...args);
      } catch (err) {
        if (i >= attempts) throw err;
        await new Promise((r) => setTimeout(r, delayMs * 2 ** (i - 1)));
      }
    }
  };
}

// decorators compose
const getUser = withRetry(withLogging(fetchUser), { attempts: 4 });
```

Each decorator handles one concern; you stack them as needed instead of building `RetryingLoggingCachedFetcher`.

## Object decorators

Wrap an object and forward the interface:

```js
function withCache(storage) {
  const memory = new Map();
  return {
    ...storage,
    async get(key) {
      if (memory.has(key)) return memory.get(key);
      const value = await storage.get(key);
      memory.set(key, value);
      return value;
    },
  };
}
```

A `Proxy` can decorate every method generically (e.g. tracing all calls on an API client).

## React: higher-order components and hooks

```jsx
const withAuth = (Component) => function Authed(props) {
  const user = useUser();
  return user ? <Component {...props} user={user} /> : <Navigate to="/login" />;
};
export default withAuth(Dashboard);
```

HOCs are decorators for components. Hooks replaced many of them, because stacking HOCs creates "wrapper hell" and prop-name collisions, but they're still used for cross-cutting concerns (error boundaries, `memo`, `forwardRef` in older code).

## Class decorator syntax (TC39 Stage 3)

```js
function logged(method, context) {
  return function (...args) {
    console.log(`→ ${String(context.name)}`, args);
    return method.apply(this, args);
  };
}

class Cart {
  @logged
  add(item) { /* … */ }
}
```

The standard decorator receives the value and a `context` object (`kind`, `name`, `addInitializer`, …). It's **different** from the older "experimental" decorators (TypeScript `experimentalDecorators`, Babel legacy) used by Angular, NestJS and MobX 5, so check which semantics a framework expects. Native engine support is still rolling out, so you typically compile them with TypeScript or Babel.

## Decorator vs related patterns

- **Proxy**: controls access to an object (same interface) — often for lazy loading, validation or remote access. Decorators add behaviour; the distinction is about intent.
- **Adapter**: changes the interface; a decorator keeps it.
- **Inheritance**: fixed at definition time and combinatorial; decorators compose at runtime.

## Pitfalls

- **Losing `this` and metadata**: forward `this` with `apply`, and be aware that wrappers change `fn.name` and `fn.length` (set them explicitly if anything depends on them).
- **Order matters**: `withRetry(withCache(f))` vs `withCache(withRetry(f))` behave differently.
- **Debugging**: deep wrapper stacks clutter stack traces and React DevTools; name inner functions (`Authed`).
- **Identity**: decorating inside a React render creates a new component/function each time, resetting state; decorate at module level.
- **Unbounded caches** in memoize decorators leak memory; add limits.

## In an interview, mention…

- Wrap-and-delegate with the same interface, composing behaviour at runtime.
- Higher-order functions and HOCs as idiomatic JS forms; TC39 decorators vs legacy decorators.
- Ordering, `this` forwarding and the difference from Proxy/Adapter.
