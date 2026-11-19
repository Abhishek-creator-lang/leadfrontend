## TL;DR

Prefer, in order: **(1) your framework's data layer**, such as Server Components with `async`/`await`, or route loaders (React Router, Next.js), which fetch **before or in parallel with rendering**; **(2) a server-cache library** (TanStack Query, SWR, RTK Query) for client-side fetching with caching, deduplication, retries, revalidation and Suspense support; **(3) `useEffect` + `fetch`** only for simple cases, and then always with **loading/error states, cancellation or ignoring stale responses, and cleanup**. Show progress with **Suspense boundaries** (or explicit loading UI), and handle failures with **error boundaries**.

## 1. Server Components (React 19 with a framework)

```jsx
// Server Component: runs on the server, ships no JS for this component
export default async function ProductPage({ params }) {
  const product = await db.products.find(params.id);
  return (
    <>
      <ProductDetails product={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={product.id} /> {/* async too, streams in later */}
      </Suspense>
    </>
  );
}
```

There are no client waterfalls or loading-state boilerplate, and secrets stay on the server.

## 2. A server-cache library on the client

```jsx
function Profile({ userId }) {
  const { data, error, isPending } = useQuery({
    queryKey: ['user', userId],
    queryFn: ({ signal }) => fetch(`/api/users/${userId}`, { signal }).then(r => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    }),
    staleTime: 60_000,
  });
  if (isPending) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <h1>{data.name}</h1>;
}
```

You get caching across components, request deduplication, background refetching, retries, pagination helpers, optimistic updates, and `useSuspenseQuery` for Suspense-driven loading.

## 3. Plain `useEffect` (understand it, use it sparingly)

```jsx
function Profile({ userId }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then(data => setState({ status: 'success', data }))
      .catch(error => {
        if (error.name !== 'AbortError') setState({ status: 'error', error });
      });
    return () => controller.abort(); // prevents races when userId changes and handles Strict Mode
  }, [userId]);
  // render by state.status
}
```

## 4. `use()` with Suspense (React 19)

`use(promise)` suspends until the promise resolves, but the promise must be **created outside render** and cached (by a framework, a library, or passed down from a Server Component). Creating a new `fetch` promise inside render suspends forever.

## Design considerations

- **Avoid waterfalls:** start independent requests in parallel (`Promise.all`, loaders, prefetching on hover) rather than parent-fetch-then-child-fetch.
- **Loading UX:** skeletons that match the layout, Suspense boundaries placed so content reveals in meaningful chunks, and `startTransition` to keep old content visible during navigation.
- **Errors:** retry buttons and error boundaries per section.
- **Mutations:** React 19 Actions (`useActionState`, `useOptimistic`) or the library's mutation API, plus cache invalidation.
- **Race conditions and cancellation** with `AbortController`.

## In an interview, mention…

- The hierarchy: framework/RSC loaders, then a query library, then raw effects.
- What raw effects need: loading/error states, abort, stale-response handling, Strict Mode.
- Parallelizing requests to avoid waterfalls, and Suspense plus error boundaries for states.
- React 19's `use`, Actions and optimistic updates for mutations.
