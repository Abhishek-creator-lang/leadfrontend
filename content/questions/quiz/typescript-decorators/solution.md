## TL;DR

Decorators are functions applied with `@expr` to **classes and class members** (methods, accessors, fields, auto-accessors) to **observe, wrap or replace them**. TypeScript has **two incompatible implementations**: **legacy "experimental" decorators** (`experimentalDecorators: true`), used by Angular, older NestJS, TypeORM and MobX 5, which also support **parameter decorators** and **`emitDecoratorMetadata`**; and **standard ECMAScript decorators** (TC39 stage 3), supported **by default since TS 5.0**, with a different signature `(value, context)`, **no parameter decorators**, and **decorator metadata** via `Symbol.metadata` (TS 5.2). New code should use standard decorators unless a framework requires the legacy mode. Browsers don't run them natively yet, so they're always transpiled.

## Standard decorator (TS 5.0+)

```ts
function logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log(`→ ${name}`, args);
    const result = target.call(this, ...args);
    console.log(`← ${name}`, result);
    return result;
  };
}

class Calculator {
  @logged
  add(a: number, b: number) { return a + b; }
}
```

The `context` object provides `kind` (`'method' | 'field' | 'getter' | 'setter' | 'accessor' | 'class'`), `name`, `static`, `private`, `access` (get/set helpers), `addInitializer`, and `metadata`.

### Auto-accessors and fields

```ts
function clamp(min: number, max: number) {
  return function <This>(
    target: ClassAccessorDecoratorTarget<This, number>,
    _ctx: ClassAccessorDecoratorContext<This, number>,
  ): ClassAccessorDecoratorResult<This, number> {
    return {
      set(value) { target.set.call(this, Math.min(max, Math.max(min, value))); },
      get() { return target.get.call(this); },
    };
  };
}

class Volume {
  @clamp(0, 100) accessor level = 50; // `accessor` keyword creates a private backing field
}
```

Field decorators can return an **initializer transformer**, but they can't intercept later assignments. That's why auto-accessors exist.

## Legacy vs standard

| | Legacy (`experimentalDecorators`) | Standard (TS 5.0 default) |
|---|---|---|
| Signature | `(target, key, descriptor)` | `(value, context)` |
| Parameter decorators | Yes (Angular DI, NestJS) | No |
| Metadata | `emitDecoratorMetadata` + `reflect-metadata` (design-time types) | `context.metadata` / `Symbol.metadata` (no type emission) |
| Evaluation order details | Older semantics | Spec semantics |
| Ecosystem | Angular (historically), NestJS, TypeORM, class-validator | Lit 3, MobX 6 (supports both), newer libraries |

You can't mix them in one project. The tsconfig flag switches the whole compilation.

## Use cases

- Framework metadata: components, routes, dependency injection, ORM columns, validation rules.
- Cross-cutting behaviour: logging, memoization, binding methods (`@bound`), timing, retries, access control.
- Reactive state: MobX `@observable`, Lit `@property`/`@state`.

## Front-end perspective

React moved away from classes, so decorators are rare in React codebases. You'll meet them in Angular, Lit, MobX, NestJS backends, and shared SDKs. Function composition (higher-order functions, hooks) covers most of the same needs without classes.

## Pitfalls

- Copying legacy decorator examples into a TS 5 project without `experimentalDecorators`: the signatures don't match, and the errors are confusing.
- Relying on `emitDecoratorMetadata` with tools that can't emit it. esbuild/SWC need plugins or special configuration, which is why some Angular and NestJS setups require `tsc` or SWC with legacy decorator support.
- Decorators hide behaviour. Keep them small, typed, and documented.

## In an interview, mention…

- Two implementations: legacy experimental vs standard (TS 5.0), and that they're incompatible.
- The standard `(value, context)` API, auto-accessors, `addInitializer`, and metadata (5.2).
- No parameter decorators in the standard, which matters for DI frameworks.
- Where you'd meet them (Angular, Lit, MobX, NestJS) and alternatives in React-style code.
