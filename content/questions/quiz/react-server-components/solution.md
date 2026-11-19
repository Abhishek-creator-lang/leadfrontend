## TL;DR

**React Server Components (RSC)** are components that **run only on the server** (at build time or per request), so they can be `async`, **read databases, files or secrets directly**, and **ship zero JavaScript** to the browser. Their output is serialized as an **RSC payload**, a description of the rendered tree with "holes" for **Client Components** (`'use client'`), which hydrate and handle interactivity. **SSR is a different thing**: it renders *all* components (server and client) to **HTML** for a fast first paint, and then the client JS hydrates everything. RSC and SSR are **complementary**. Frameworks such as Next.js App Router use both. RSC is stable in React 19, used through a framework or bundler integration.

## A server component

```jsx
// app/products/[id]/page.jsx: a Server Component by default
import { db } from '@/lib/db';
import AddToCart from './AddToCart'; // a Client Component

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } }); // direct DB access
  return (
    <article>
      <h1>{product.name}</h1>
      <Markdown source={product.description} /> {/* heavy parser stays on the server */}
      <AddToCart productId={product.id} price={product.price} />
    </article>
  );
}
```

```jsx
// AddToCart.jsx
'use client';
import { useState } from 'react';
export default function AddToCart({ productId, price }) {
  const [qty, setQty] = useState(1);
  // event handlers, state, effects and browser APIs live here
}
```

## RSC vs SSR

| | Server Components | SSR |
|---|---|---|
| Output | RSC payload (serialized tree) | HTML |
| Which components | Only server components | Everything, including client components |
| Ships JS for the component? | No | Yes (hydration needs it) |
| Re-renders on the client? | No; refetched from the server on navigation or refresh | Yes, after hydration |
| Can be used without the other? | Yes (e.g. client-rendered apps fetching RSC payloads) | Yes (classic SSR) |

On first load, a framework typically runs RSC, then SSRs the result plus the client components to HTML. On client navigation it fetches only the RSC payload and React merges it into the existing tree **without losing client state**.

## Rules of the boundary

- `'use client'` marks the **entry point** of a client subtree. Everything that file imports becomes client code. Mark boundaries as low (close to the leaves) as possible.
- Server Components **can't** use state, effects, event handlers, context, or browser APIs.
- Client Components **can't import** Server Components, but **can receive them as `children`** or other props. That's how you nest server content inside interactive shells.
- **Props crossing the boundary must be serializable**: JSON-like values, Dates, Maps and Sets, promises, JSX, and **Server Functions** (`'use server'`). Plain functions and class instances are not allowed.
- `'use server'` marks **Server Functions** (called "Server Actions" when used as form actions), which client code can call like async functions. Treat them as **public API endpoints**: validate input and check authorization.

## Benefits

- Less client JS: big dependencies (markdown, syntax highlighting, date libraries) stay server-side.
- No client-server fetch waterfalls, because data is fetched next to the data source.
- Secrets and tokens never reach the browser (use the `server-only` package to enforce this).
- Streaming with Suspense: slow parts stream in later.

## Trade-offs

- A new mental model with a strict boundary, and framework coupling (bundler support is required).
- Every interaction that needs new server data requires a round trip. Caching strategy becomes important.
- Libraries using context or hooks must be client components.
- Security surface: serialization leaks (passing whole DB objects as props) and unauthenticated Server Functions.

## In an interview, mention…

- RSC produces a serialized tree with no client JS. SSR produces HTML and requires hydration. They're complementary.
- `'use client'`/`'use server'` semantics, serializable props, and children as the composition escape hatch.
- Benefits (bundle size, data locality, secrets) and costs (mental model, caching, security).
- RSC is stable in React 19, but only usable through a framework or bundler integration.
