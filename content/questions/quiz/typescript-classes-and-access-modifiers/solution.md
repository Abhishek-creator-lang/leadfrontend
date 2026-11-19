## TL;DR

TypeScript classes add **type-level access modifiers** on top of JavaScript classes: **`public`** (the default), **`protected`** (the class and its subclasses), and **`private`** (only the declaring class). These are **compile-time only**: at runtime the property is an ordinary, accessible field. JavaScript's **`#private` fields** are **enforced by the runtime** (hard privacy) and are the better choice when privacy really matters. TypeScript also offers **`readonly`** fields, **parameter properties** (`constructor(private repo: Repo)`), **`abstract`** classes and members, **`override`** (with `noImplicitOverride`), and `implements` checks against interfaces.

## Modifiers

```ts
class Account {
  public owner: string;            // default anyway
  protected balance = 0;           // subclasses can use it
  private auditLog: string[] = []; // TS-only privacy
  #pin: string;                    // runtime-enforced privacy
  readonly id = crypto.randomUUID();

  constructor(owner: string, pin: string) {
    this.owner = owner;
    this.#pin = pin;
  }

  deposit(amount: number) {
    this.balance += amount;
    this.auditLog.push(`deposit ${amount}`);
  }
}

const acc = new Account('Ada', '1234');
acc.auditLog;           // compile error...
(acc as any).auditLog;  // ...but accessible at runtime
acc['auditLog'];        // also allowed: bracket access bypasses `private` checks
// acc.#pin;            // syntax error outside the class; truly hidden at runtime
```

## private vs #private

| | `private` | `#private` |
|---|---|---|
| Enforced | Type-checker only | JavaScript runtime |
| Visible via `Object.keys`, JSON, devtools | Yes | No |
| Bracket-access escape hatch | Yes | No |
| Subclass can declare the same name | Conflict error | Independent fields |
| Performance / emit | Plain property | Native in ES2022+ (downlevelled to WeakMaps for older targets) |

Both make classes **nominal-ish**: two classes with identically named private members aren't assignable to each other.

## Parameter properties

```ts
class UserService {
  constructor(
    private readonly http: HttpClient,
    protected logger: Logger,
  ) {}
}
```

This is shorthand that declares and assigns fields. It's convenient, but it's **not erasable syntax**: it emits code, so it's rejected under TS 5.8's `--erasableSyntaxOnly` used by Node's type stripping. Some teams avoid it for that reason.

## abstract and override

```ts
abstract class Shape {
  abstract area(): number;                 // subclasses must implement
  describe() { return `Area: ${this.area().toFixed(2)}`; }
}

class Circle extends Shape {
  constructor(private r: number) { super(); }
  override area() { return Math.PI * this.r ** 2; }
}

new Shape(); // error: cannot create an instance of an abstract class
```

With `noImplicitOverride`, overriding without `override` is an error, and `override` on a method that doesn't exist in the base class is also an error. That catches renames in base classes.

## implements

`class Repo implements Storage { … }` checks that the class satisfies the interface. It **doesn't** change the class's type or add members (contextual typing of method parameters doesn't flow from the interface either).

## Practical guidance for front-end code

- React code is mostly functions, but classes appear in SDK clients, services, error types (`class ApiError extends Error`), and data structures.
- Use `#private` for genuinely hidden state in libraries, and `private` for convenience in app code.
- Prefer composition over deep inheritance hierarchies.
- For `Error` subclasses, set `this.name` and use `cause` (`super(message, { cause })`).

## In an interview, mention…

- `public`/`protected`/`private` are compile-time only, while `#private` is enforced at runtime.
- Parameter properties, `readonly`, `abstract`, `override` + `noImplicitOverride`, and `implements`.
- Private members make classes effectively nominal.
- Erasable-syntax considerations (parameter properties, enums) for type-stripping toolchains.
