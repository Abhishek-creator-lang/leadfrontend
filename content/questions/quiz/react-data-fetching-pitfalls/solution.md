## TL;DR

The usual pitfalls are: **race conditions** (a slow old response overwrites a newer one), **no cleanup or cancellation** (setting state after unmount, wasted requests, Strict Mode double fetches), **request waterfalls** (parent fetches, then the child starts its fetch), **missing loading/error/empty states**, **no caching or deduplication** (the same data fetched by many components and refetched on every mount), **unstable effect dependencies** causing refetch loops, **treating server data as local state** (copying it into `useState` so it goes stale), and **fetching in effects when the data could load earlier** (in loaders, Server Components, or on user intent).

## 1. Race conditions

```jsx
useEffect(() => {
  let ignore = false;
  fetchResults(query).then(data => {
    if (!ignore) setResults(data); // drop stale responses
  });
  return () => { ignore = true; };
}, [query]);
```

Typing "re" then "react" quickly can resolve "re" last. Ignore stale responses, or abort them with `AbortController` (which also saves bandwidth).

## 2. Missing cleanup

Without cleanup, unmounted components still process responses, subscriptions leak, and in development Strict Mode's mount → unmount → mount cycle fires duplicate requests. Abort in the cleanup. Request deduplication is a caching concern, not a reason to disable Strict Mode.

## 3. Waterfalls

```jsx
function Page() {
  const user = useFetch('/me');               // request 1
  if (!user) return <Spinner />;
  return <Orders userId={user.id} />;         // request 2 starts only after 1 finishes and Orders renders
}
```

Fixes: fetch in parallel at the route level (loaders, `Promise.all`), prefetch on hover, start requests before rendering (render-as-you-fetch), or move fetching to Server Components close to the data. Lazy-loaded components that fetch create **code + data waterfalls**, so preload both.

## 4. Unstable dependencies

```jsx
useEffect(() => { fetchItems(filters); }, [filters]); // filters = {} created every render, so it loops
```

Depend on primitives, memoize, or move the object into the effect.

## 5. Incomplete UI states

Handle **loading, error, empty, and partial/refreshing** states. Keep showing stale data while refetching instead of blanking to a spinner (`placeholderData`/`keepPreviousData`, or `startTransition`). Use skeletons to avoid layout shift.

## 6. No cache

Hand-rolled `useEffect` fetching gives each component its own copy: no sharing, no deduplication, no background revalidation, and a refetch whenever you navigate back. A server-state library (TanStack Query, SWR, RTK Query) or framework cache solves this, including invalidation after mutations.

## 7. Copying server data into local state

```jsx
const [name, setName] = useState(user.name); // diverges when user refetches
```

Keep server data in the cache as the source of truth, and keep only *draft edits* in local state, reset with a `key` when the entity changes.

## 8. Other gotchas

- **Not checking `response.ok`:** `fetch` only rejects on network errors, so a 404 or 500 "succeeds".
- **Async effect functions:** `useEffect(async () => …)` returns a promise instead of a cleanup function. Define the async function inside the effect.
- **Secrets in client code** or over-fetching large payloads. Use a BFF or Server Components.
- **Mutations without optimistic UI or rollback,** or without invalidating related queries.
- **Creating promises during render for `use()`** without caching them, which suspends forever.

## In an interview, mention…

- Races and cancellation, waterfalls, and caching are the big three.
- Effects are the lowest-level option. Prefer loaders, Server Components or a query library.
- Complete UI states, and `response.ok` checks.
- Server data belongs in a cache, not copied into `useState`.
