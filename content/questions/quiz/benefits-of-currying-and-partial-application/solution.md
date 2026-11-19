## TL;DR

Both techniques let you **specialise a general function by pre-filling arguments**, which gives you **reuse without duplication**, **configuration captured once** (DI-style), **functions that fit callback signatures** (`map`, `filter`, event handlers), and **easier composition** into pipelines. The costs are **readability for people unfamiliar with the style**, **debuggability** (anonymous wrappers), and a little **overhead**. Use them where they make call sites clearer, not everywhere.

Quick refresher: **currying** turns `f(a, b, c)` into `f(a)(b)(c)`; **partial application** fixes some arguments once: `g = f.bind(null, a)` then `g(b, c)`.

## Benefits with examples

**1. Reuse and specialisation**

```js
const formatMoney = (currency) => (amount) =>
  new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);

const usd = formatMoney('USD');
const inr = formatMoney('INR');
prices.map(usd);
```

One general function, many cheap specialised ones, and the `Intl` setup code lives in one place.

**2. Capture configuration / dependencies once**

```js
const createRepo = (db) => ({
  findUser: (id) => db.query('SELECT * FROM users WHERE id = $1', [id]),
});
const repo = createRepo(pool); // wired once at startup, easy to swap in tests
```

This is lightweight dependency injection without a container.

**3. Fit callback signatures**

```js
const hasStatus = (status) => (order) => order.status === status;
orders.filter(hasStatus('shipped'));

const field = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
<input onChange={field('email')} />
```

**4. Composition and pipelines**

```js
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const slugify = pipe(
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/[^a-z0-9]+/g, '-')
);
```

Curried, unary, data-last functions plug into `pipe`/`compose` directly. That's why libraries like Ramda curry everything.

**5. Testability and purity**

Small single-purpose functions with explicit inputs are easy to unit test, and capturing dependencies as arguments (instead of importing singletons) makes them easy to replace.

**6. Lazy evaluation / staging**

You can supply arguments as they become available: the API client at startup, the user ID after login, the payload at click time.

## Costs and trade-offs

- **Readability**: `f(a)(b)(c)` and point-free pipelines are unfamiliar to many developers; overused, they turn into puzzles. Team conventions matter more than cleverness.
- **Debugging**: stack traces fill with anonymous inner functions. Name them where possible.
- **Performance**: each partial creates a closure. Negligible in most code, but avoid it in tight hot loops, and remember new function identities break React memoization (`useCallback`, `memo`) if created during render.
- **Types**: generic auto-curry helpers are hard to type well in TypeScript; hand-written curried functions type much better.
- **Variadic/optional arguments** don't mix well with auto-currying based on `fn.length` (default params and rest params aren't counted).

## Where it pays off most

- Configurable utilities (formatters, loggers, validators).
- Data transformations with `map`/`filter`/`reduce` pipelines.
- Event-handler factories in UI code.
- Middleware patterns (`(config) => (next) => (action) => …` in Redux middleware).

## In an interview, mention…

- Specialisation, configuration capture and composition as the core benefits.
- Concrete examples from your own code (handler factories, formatters, middleware).
- The readability trade-off and how you'd decide as a team.
