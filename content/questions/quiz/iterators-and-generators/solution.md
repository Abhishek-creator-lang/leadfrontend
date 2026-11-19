## TL;DR

An **iterator** is any object with a `next()` method returning `{ value, done }`. An **iterable** is an object with a `[Symbol.iterator]()` method that returns an iterator; that protocol is what powers `for…of`, spread, destructuring, `Array.from`, `Promise.all` and `new Map(iterable)`. A **generator** (`function*`) is the easy way to write iterators: it **pauses at each `yield`** and resumes on the next `next()` call. Use them for **lazy or infinite sequences**, custom data-structure traversal and (with `async function*`) **streams of async data**.

## The protocol by hand

```js
const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let cur = this.from, last = this.to;
    return {
      next: () => (cur <= last ? { value: cur++, done: false } : { value: undefined, done: true }),
    };
  },
};
console.log([...range]); // [1, 2, 3]
```

## The same with a generator

```js
function* rangeGen(from, to) {
  for (let i = from; i <= to; i++) yield i;
}
const it = rangeGen(1, 3);
it.next(); // { value: 1, done: false }
[...it];   // [2, 3]  (iterators are consumed; they don't rewind)
```

Calling a generator function runs **no code**. It returns a generator object that is both an iterator and an iterable. Each `next()` runs until the next `yield`.

## What generators are good for

**Lazy and infinite sequences:**

```js
function* ids() { let n = 0; while (true) yield `id-${n++}`; }
const gen = ids();
gen.next().value; // 'id-0', nothing computed ahead of time
```

**Tree traversal with `yield*` (delegation):**

```js
function* walk(node) {
  yield node;
  for (const child of node.children ?? []) yield* walk(child);
}
for (const n of walk(tree)) if (n.id === target) break; // stops early, no wasted work
```

**Iterator helpers (ES2025, in all modern browsers):** iterators now have lazy `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray` and more.

```js
ids().filter((id) => !id.endsWith('3')).take(5).toArray();
```

**Async iteration** for paginated APIs and streams:

```js
async function* pages(url) {
  while (url) {
    const res = await fetch(url);
    const { items, next } = await res.json();
    yield* items;
    url = next;
  }
}
for await (const item of pages('/api/items')) render(item);
```

`ReadableStream` is async-iterable in modern runtimes, so `for await (const chunk of res.body)` works in Node and in Firefox/Chrome (check Safari support).

## Two-way communication

`next(value)` sends a value **into** the generator; it becomes the result of the paused `yield` expression. `return()` finishes the generator (running `finally` blocks) and `throw(err)` raises inside it. This is how libraries such as redux-saga and co implemented async flows before `async`/`await` existed.

## Pitfalls

- Iterators are **single-pass**. Spreading the same generator twice yields nothing the second time.
- `break`/`return` in `for…of` calls the iterator's `return()`, so put cleanup in `finally`.
- Generators add overhead compared to a plain loop. Use them for clarity and laziness, not in hot numeric loops.
- Plain objects are **not** iterable. Use `Object.entries(obj)`.

## In an interview, mention…

- The two protocols (iterable vs iterator) and that every built-in consumer (`for…of`, spread, destructuring) goes through `Symbol.iterator`.
- Laziness, early termination and infinite sequences as the main benefits.
- Async generators and `for await` for pagination/streaming, plus the new iterator helpers.
