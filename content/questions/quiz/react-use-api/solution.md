## TL;DR

`use(resource)` (React 19) **reads the value of a promise or a context during render**. With a **promise**, it **suspends** the component until the promise resolves (showing the nearest `<Suspense>` fallback) and **throws the rejection to the nearest error boundary**. With a **context**, it works like `useContext`. Unlike every other hook, **`use` may be called inside conditions and loops**. The catch: the promise must be **stable across renders**. It should be created outside render (in a Server Component, a loader, or a cache), **not** with `fetch` inside the component body.

## Reading a promise

```jsx
// Server Component: start the fetch, don't await it
export default function Page() {
  const commentsPromise = fetchComments(); // starts now
  return (
    <Suspense fallback={<CommentsSkeleton />}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

```jsx
'use client';
import { use } from 'react';

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // suspends until resolved
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}
```

The page streams immediately, and the comments stream in when ready. Promises passed from server to client components are serialized and resolved on the client.

## Why not create the promise in render?

```jsx
function Bad({ id }) {
  const user = use(fetch(`/api/users/${id}`).then(r => r.json())); // new promise every render
}
```

When the component suspends and later retries, it calls `fetch` again, gets a **new pending promise**, and suspends again. Client Components need a **cached** promise: from a Suspense-aware library, a framework, a module-level cache keyed by id, or a promise passed down as a prop. React 19 warns about uncached promises created in render.

## Reading context conditionally

```jsx
function Heading({ children, plain }) {
  if (plain) return <h1>{children}</h1>;
  const theme = use(ThemeContext); // allowed after an early return
  return <h1 style={{ color: theme.accent }}>{children}</h1>;
}
```

`useContext` can't be called after an early return. `use(Context)` can, which is handy in components with conditional branches.

## Rules and behaviour

- Call it only in **components or hooks** (not regular functions), but conditions and loops are allowed.
- **Not inside `try/catch`.** Suspension works by interrupting render. Handle errors with an error boundary, or chain `.catch()` on the promise to provide a fallback value.
- When a promise is **already resolved** (React tracks this on the promise), `use` returns the value synchronously without suspending.
- If the component re-renders during a transition, React keeps the old UI rather than showing a fallback.
- In Server Components, prefer plain `async`/`await`. `use` is mainly for **Client Components** consuming promises.

## When to use it

- Streaming data from Server Components into Client Components.
- Libraries and frameworks that expose cached promises.
- Conditional context reads.

It's **not** a replacement for a data-fetching library in a client-only app. You still need caching, deduplication, invalidation and refetching, which libraries like TanStack Query provide.

## In an interview, mention…

- It reads promises (suspending, with errors going to boundaries) and contexts, and can be called conditionally.
- The stable-promise requirement, and why `use(fetch())` in render is wrong.
- The server-to-client promise streaming pattern.
- No `try/catch`. Pair it with Suspense and error boundaries.
