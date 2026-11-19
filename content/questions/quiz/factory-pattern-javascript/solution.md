## TL;DR

The **Factory pattern** creates objects through a **function (or method) that decides what to build and how**, instead of callers using `new SomeClass()` directly. It **hides construction details**, lets you **choose the concrete type at runtime** (based on config, input or environment), and returns objects that share a common interface. In JavaScript a factory is usually just a **function returning an object**, often with closures for private state.

## Simple factory function

```js
function createUser({ name, role = 'viewer' }) {
  const createdAt = new Date();               // private via closure
  return {
    name,
    role,
    can(action) {
      return PERMISSIONS[role].includes(action);
    },
    get ageInDays() {
      return Math.floor((Date.now() - createdAt) / 86_400_000);
    },
  };
}

const admin = createUser({ name: 'Ada', role: 'admin' });
admin.can('delete'); // true
```

No `new`, no `this` confusion, and true privacy without class syntax.

## Choosing the type at runtime

```js
class ConsoleLogger { log(msg) { console.log(msg); } }
class RemoteLogger {
  constructor(endpoint) { this.endpoint = endpoint; }
  log(msg) { navigator.sendBeacon(this.endpoint, JSON.stringify({ msg })); }
}
class NoopLogger { log() {} }

function createLogger(env) {
  switch (env) {
    case 'production': return new RemoteLogger('/logs');
    case 'test': return new NoopLogger();
    default: return new ConsoleLogger();
  }
}

const logger = createLogger(import.meta.env.MODE);
logger.log('ready'); // callers only depend on the .log() interface
```

A **registry** removes the `switch` and makes the factory open for extension:

```js
const renderers = new Map();
export const registerField = (type, render) => renderers.set(type, render);
export function createField(schema) {
  const render = renderers.get(schema.type);
  if (!render) throw new Error(`No renderer for field type "${schema.type}"`);
  return render(schema);
}

registerField('text', (s) => `<input name="${s.name}">`);
registerField('select', (s) => `<select name="${s.name}">…</select>`);
```

This is how schema-driven form builders and CMS block renderers commonly work.

## Factory method / abstract factory

- **Factory method** (GoF): a base class defines `createX()` and subclasses override it to choose the concrete product.
- **Abstract factory**: a factory that creates *families* of related objects, e.g. a theme factory producing matching `Button`, `Input` and `Dialog` components for "material" vs "ios" styles.

In JS these are usually expressed with plain objects of functions rather than class hierarchies.

## Where you see factories

- `document.createElement('div')`, `new URL()` alternatives like `URL.parse()`, `Promise.resolve()`, `Array.from()`, `Object.create()`.
- Library APIs: `createStore`, `createRoot`, `createContext`, `createSlice`, `createApp`.
- Test data builders: `buildOrder({ status: 'shipped' })` with sensible defaults.
- Dependency wiring: `createApiClient({ baseUrl, fetch })` makes testing easy (pass a fake `fetch`).

## Factories vs classes

| | Factory function | Class + `new` |
|---|---|---|
| Privacy | Closures (or return frozen objects) | `#private` fields |
| `this` pitfalls | None if you don't use `this` | Methods lose `this` when detached |
| `instanceof` | Not available | Available |
| Memory | Methods recreated per object (unless shared) | Methods shared on the prototype |
| Return different types | Natural | Awkward |

For very many instances, shared prototype methods are more memory-efficient. Otherwise choose for clarity.

## Pitfalls

- Over-engineering: a factory wrapping a single `new` call adds indirection without benefit.
- A giant `switch` factory that every feature edits: prefer a registry.
- Returning objects with inconsistent shapes; define the interface (TypeScript helps).

## In an interview, mention…

- Encapsulated creation and runtime type selection behind a common interface.
- Factory functions + closures as idiomatic JS, and registries for extensibility.
- Real examples (built-ins, `create*` APIs, test data builders) and the trade-offs vs classes.
