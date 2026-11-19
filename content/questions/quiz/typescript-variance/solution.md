## TL;DR

Variance describes **how subtyping of a generic type follows subtyping of its type argument**. If `Dog` is a subtype of `Animal`: a type is **covariant** if `Box<Dog>` is assignable to `Box<Animal>` (outputs and readonly data), **contravariant** if `Handler<Animal>` is assignable to `Handler<Dog>` (inputs and parameters), **invariant** if neither direction works (mutable read-write positions), and **bivariant** if both work (unsound, but TypeScript allows it for **method** parameters). Under `strictFunctionTypes` (part of `strict`), **function-type parameters are checked contravariantly**, while **method-syntax parameters stay bivariant**. TS 4.7 added optional **`in`/`out` annotations** on type parameters.

## Intuition

```ts
class Animal { name = '' }
class Dog extends Animal { bark() {} }

// Covariant: producing values
type Getter<T> = () => T;
const getDog: Getter<Dog> = () => new Dog();
const getAnimal: Getter<Animal> = getDog;   // OK: whoever wants an Animal is happy with a Dog

// Contravariant: consuming values
type Feed<T> = (x: T) => void;
const feedAnimal: Feed<Animal> = a => console.log(a.name);
const feedDog: Feed<Dog> = feedAnimal;      // OK: something that handles any Animal handles Dogs
const bad: Feed<Animal> = (d: Dog) => d.bark(); // error under strictFunctionTypes
```

The last line would let a caller pass a `Cat` to a function that calls `bark()`.

## Arrays: an unsound but pragmatic choice

```ts
const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs;     // allowed (arrays are treated covariantly)
animals.push(new Animal());         // compiles
dogs[1].bark();                     // runtime crash
```

Mutable arrays should be invariant, but TypeScript treats them covariantly for ergonomics. Using `readonly Animal[]` in APIs that don't mutate makes covariance genuinely safe.

## Method vs function property syntax

```ts
interface ListenerA { handle(e: MouseEvent): void }       // method: bivariant parameter
interface ListenerB { handle: (e: MouseEvent) => void }   // property: contravariant under strict
```

Method bivariance exists so that, for example, `Array<Dog>` remains assignable to `Array<Animal>` despite methods like `push(x: T)`. For your own callback types, **prefer property syntax** to get the stricter check (the `@typescript-eslint/method-signature-style` rule enforces it).

## Explicit variance annotations (TS 4.7)

```ts
interface Producer<out T> { get(): T }
interface Consumer<in T> { accept(value: T): void }
interface Cell<in out T> { get(): T; set(v: T): void } // invariant
```

TypeScript normally measures variance by checking the structure. Annotations document intent, **speed up checking** in complex recursive types, and produce errors if the structure contradicts the annotation. They don't change behaviour for correctly measured types, and they're only allowed on type parameters of interfaces, classes and type aliases of object, function or constructor types.

## Why it matters in practice

- **Event handler and callback types:** a handler for `Event` can be used where a `MouseEvent` handler is expected, but not vice versa.
- **React:** `(e: React.SyntheticEvent) => void` is assignable to an `onClick` prop, while a handler typed for a more specific event is not assignable to a broader one.
- **State containers:** `Store<Dog>` with `set(value: T)` shouldn't be assignable to `Store<Animal>`. If it is (because of method bivariance), you've found a soundness hole.

## In an interview, mention…

- Co-, contra-, in- and bivariance, with the produce/consume intuition.
- `strictFunctionTypes`: function properties are contravariant, methods are bivariant (and why).
- Array covariance is unsound, and `readonly` arrays make it safe.
- `in`/`out` annotations (4.7) for documentation and performance.
