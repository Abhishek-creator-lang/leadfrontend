## TL;DR

A **Singleton** ensures a class has **only one instance** and provides a **global access point** to it. Typical candidates: a configuration object, a logger, an API client, a connection or cache. In JavaScript you rarely need the class-based ceremony, because **an ES module is evaluated once** and every importer shares its exports, so `export const logger = createLogger()` already is a singleton. The main downsides are **hidden global state**, **tight coupling** and **harder testing**, so use singletons sparingly and prefer injecting dependencies.

## Class-based version

```js
class Config {
  static #instance;
  #values = {};

  constructor() {
    if (Config.#instance) return Config.#instance; // return the existing one
    Config.#instance = this;
  }

  static getInstance() {
    return Config.#instance ?? new Config();
  }

  get(key) { return this.#values[key]; }
  set(key, value) { this.#values[key] = value; }
}

const a = Config.getInstance();
const b = new Config();
a === b; // true
```

Returning an object from a constructor replaces the newly created `this`, which is how `new Config()` hands back the existing instance.

## Idiomatic JavaScript: module singletons

```js
// api-client.js
function createApiClient(baseUrl) {
  return {
    get: (path) => fetch(baseUrl + path).then((r) => r.json()),
  };
}
export const apiClient = createApiClient(import.meta.env.VITE_API_URL);

// anywhere
import { apiClient } from './api-client.js'; // always the same object
```

Lazy initialisation when creation is expensive:

```js
let instance;
export function getDb() {
  instance ??= openDatabase(); // created on first use
  return instance;
}
```

`Object.freeze` is useful when the singleton is read-only configuration.

## Where singletons appear in front-end code

- A store instance (Redux store, Zustand store) created once per app.
- A query client, i18n instance, analytics or logging client.
- A WebSocket connection shared by all components.
- Browser globals are themselves singletons (`window`, `document`, `localStorage`).

## Problems

- **Hidden dependencies**: functions that import a singleton don't declare that they depend on it, which makes data flow hard to follow.
- **Testing**: state persists across tests in the same module registry. You need reset hooks, module mocking, or `vi.resetModules()`.
- **Server-side rendering**: a module-level singleton is shared across **all requests** on the server. Putting per-user data (current user, a request-scoped store) in one leaks data between users. Create per-request instances (e.g. a store per request, React context to provide it).
- **Multiple copies**: if a bundle includes two versions of a package (or micro-frontends each bundle their own), you get two "singletons". Shared dependencies or `globalThis` registries work around this.
- **Concurrency of initialisation**: async lazy creation needs to cache the *promise*, not the result, or parallel callers create duplicates:

```js
let ready;
export const getClient = () => (ready ??= connect()); // all callers share one promise
```

## Better alternatives in many cases

- **Dependency injection**: create the instance once at the composition root and pass it down (function parameters, React context, framework DI in Angular). You still get one instance, without global access.
- **Factories with explicit lifetime** (per request, per test).

## In an interview, mention…

- Definition and the module-is-already-a-singleton insight.
- Lazy and async-safe initialisation (cache the promise).
- Testing and SSR cross-request leakage as the major pitfalls.
- DI/context as a way to keep "one instance" without global coupling.
