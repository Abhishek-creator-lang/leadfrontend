Implement a small **dependency injection (DI) container**. Instead of modules creating their own dependencies (`new ApiClient(new HttpClient(config))`), they are registered once and the container builds them, wiring dependencies automatically. That makes swapping implementations (for tests, or per tenant) a one-line change.

```js
const container = new Container();

container.registerValue('config', { baseUrl: 'https://api.example.com' });
container.register('http', (c) => new HttpClient(c.resolve('config')), { lifetime: 'singleton' });
container.register('userApi', (c) => new UserApi(c.resolve('http')));
container.register('session', () => ({ id: crypto.randomUUID() }), { lifetime: 'scoped' });

const api = container.resolve('userApi'); // builds HttpClient once, UserApi on every resolve

const request = container.createScope();  // e.g. one scope per request or per page
request.resolve('session') === request.resolve('session'); // true
request.resolve('session') === container.createScope().resolve('session'); // false

// Tests can override a dependency in a child scope:
const testScope = container.createScope();
testScope.registerValue('http', fakeHttp);
```

## API

| Member | Behaviour |
|---|---|
| `register(token, factory, { lifetime = 'transient' }?)` | Registers a provider. `token` can be any value (string, symbol, class...). `factory(c)` receives an object with a `resolve(token)` method for its own dependencies. Returns the container. |
| `registerValue(token, value)` | Registers a fixed value (behaves like a singleton). Returns the container. |
| `resolve(token)` | Returns an instance, building it (and its dependencies) as needed. |
| `has(token)` | `true` if this container or any ancestor can provide `token`. |
| `createScope()` | Returns a child container that inherits all registrations. Registrations made on the child override the parent's for that child only. |

## Lifetimes

| Lifetime | Instances |
|---|---|
| `transient` | A new instance on every `resolve`. |
| `singleton` | One instance per **registering** container, shared by all its descendant scopes. Its factory resolves dependencies from the container where it was registered (so a singleton can never capture a child scope's services). |
| `scoped` | One instance per container that resolves it (each scope gets its own). |

## Errors

- Resolving an unknown token throws an `Error` whose message includes the token's name (`String(token)`, or `token.name` for functions/classes).
- A circular dependency throws an `Error` whose message shows the cycle path, e.g. `Circular dependency: A -> B -> A`.
- If a factory throws, nothing is cached, so a later `resolve` tries again.

Factories run lazily: nothing is built until it's resolved.

## Follow-up

- How does Angular's hierarchical injector relate to `createScope`?
- What is a **captive dependency**, and why is it a bug?
- What do you lose and gain compared with plain ES module imports or React context?
