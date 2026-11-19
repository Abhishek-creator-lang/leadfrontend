## Approach

Each container has:

- `providers: Map<token, { factory, lifetime }>`, its own registrations;
- `instances: Map<provider, instance>`, its cache;
- `parent`, for scope inheritance.

A `Map` lets tokens be anything: strings, symbols (collision-free tokens, like Angular's `InjectionToken`), or classes themselves.

### Resolution

```text
_resolve(token, path):
  1. token already in path?          → throw "Circular dependency: A -> B -> A"
  2. find provider, walking up parents → remember the owning container
  3. pick the cache host:
       singleton → owner   (shared by every descendant scope)
       scoped    → this    (one per resolving scope)
       transient → none
  4. cached? return it
  5. call factory with a resolver whose resolve() calls _resolve(t, [...path, token])
     on the owner (singleton) or on this (others)
  6. cache (if a host) and return
```

**Caching by provider, not by token.** If a child scope overrides `http`, the child's provider is a different object, so its instances never collide with the parent's.

**Where a singleton resolves its dependencies.** A singleton lives as long as the container that registered it. If its factory resolved dependencies through the **child** scope that happened to ask first, it could capture a scoped service (say, the current request's user) and keep handing it to every later request. That's the **captive dependency** bug, and it's a real security issue in server-side code. Resolving a singleton's dependencies from its owner makes it impossible: the owner can't see child registrations.

**Cycle detection** carries the resolution path through the resolver closures. When a token appears twice, the path from its first occurrence is the cycle, and printing it (`A -> B -> A`) makes the error actionable. Without detection, a cycle is infinite recursion ending in "Maximum call stack size exceeded" with no hint where it came from.

**Errors aren't cached.** The instance is stored only after the factory returns, so a factory that failed (say, config not loaded yet) will be retried.

## Complexity

`resolve` is O(depth of scope chain) to find a provider plus O(path length) for the cycle check, plus the cost of building uncached dependencies once. Cached resolves are effectively O(1).

## Edge cases

- `registerValue(token, undefined)`: still "registered"; use `instances.has` rather than truthiness when checking the cache.
- Scoped services resolved from the **root** container behave like root-level singletons.
- Re-registering a token in the same container replaces the provider; old cached instances are no longer reachable through it.
- Factories that resolve lazily (inside a method, after construction) don't get cycle detection for that later call, which is also a standard way to break legitimate cycles.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Caching by token | A child override returns the parent's cached instance |
| Resolving singleton deps from the requesting scope | Captive dependencies, data leaking between requests or users |
| Global "currently resolving" set | Concurrent or nested containers produce false cycle errors |
| Building everything eagerly at registration | Slow startup; order-dependent registration |
| Caching before the factory returns | A failed construction is cached as `undefined` |

## Real-world connection

- **Angular** has a hierarchical injector: root, then route/module, then component injectors. `providedIn: 'root'` is a singleton; providing in a component's `providers` array is like a scoped registration, and child components see the nearest provider. Angular reports cycles as `NG0200: Circular dependency in DI detected`.
- **NestJS** (and .NET's `IServiceCollection`) use exactly these three lifetimes: default singleton, `REQUEST` scope and `TRANSIENT`.
- **InversifyJS / tsyringe** bring decorators-based DI to TypeScript.
- **React:** context plus a provider tree is a form of hierarchical DI, and testing libraries often wrap components in providers with fakes. That's the same "override in a child scope" move.

## Trade-offs vs plain imports

- **Gain:** swapping implementations per environment or test without module mocking; explicit lifetimes; per-request state on servers.
- **Lose:** "go to definition" no longer shows where an instance comes from; errors move from compile time to runtime unless tokens are typed; another abstraction for the team to learn. In most front-end apps, module imports plus React context are enough; DI containers shine in large Angular/Nest codebases and plugin systems.

## Follow-ups

- **Disposal:** track created instances per scope and call `dispose()` on them when the scope ends (`scope.dispose()`), in reverse creation order.
- **Async factories:** `resolveAsync`, caching the promise (see *Cache Async*) so concurrent resolves share one construction.
- **Multi-providers:** register several providers under one token and resolve them as an array (Angular's `multi: true`, used for interceptors and plugins).
