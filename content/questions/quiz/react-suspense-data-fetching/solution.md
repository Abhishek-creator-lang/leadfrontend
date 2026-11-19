## TL;DR

Suspense for data lets a component **suspend while its data loads**, so the nearest `<Suspense>` boundary shows a fallback, and loading states are **declared by the tree structure** instead of `isLoading` checks in every component. It only works with **Suspense-enabled data sources**: async **Server Components**, framework loaders, **`use(promise)` with a cached promise** (React 19), and libraries such as TanStack Query (`useSuspenseQuery`), Relay, SWR (`suspense: true`) or Apollo. **Fetching inside `useEffect` doesn't activate Suspense**, because effects run after commit, so React has nothing to wait on. The big win is moving from **fetch-on-render** (waterfalls) toward **render-as-you-fetch**: start requests early and let components read them.

## Fetch-on-render vs render-as-you-fetch

**Fetch-on-render (effects):**

```jsx
function Profile({ id }) {
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(id).then(setUser); }, [id]);
  if (!user) return <Spinner />;
  return <><h1>{user.name}</h1><Posts userId={id} /></>; // Posts starts fetching only now
}
```

Every level waits for its parent: a **waterfall**.

**Render-as-you-fetch (Suspense):**

```jsx
// Route loader or Server Component kicks off both requests in parallel
export default function ProfilePage({ id }) {
  const userPromise = fetchUser(id);
  const postsPromise = fetchPosts(id);
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <ProfileHeader userPromise={userPromise} />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts postsPromise={postsPromise} />
      </Suspense>
    </Suspense>
  );
}

function Posts({ postsPromise }) {
  const posts = use(postsPromise); // suspends until ready
  return <PostList posts={posts} />;
}
```

Requests start together, and the UI reveals by boundary as data arrives.

## With a query library (client-only apps)

```jsx
function Posts({ userId }) {
  const { data: posts } = useSuspenseQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId),
  });
  return <PostList posts={posts} />; // data is always defined here
}
```

To avoid waterfalls between sibling suspending queries, **prefetch** at the route level (`queryClient.ensureQueryData` in a loader) or use `useSuspenseQueries`.

## Why promises must be cached

When a component suspends, React throws away that render attempt and retries later. If the component creates a new promise each time, it suspends forever. Cache by key (libraries do this), create promises in loaders or Server Components, or memoize per key in a module-level cache. React 19 warns about uncached promises in Client Components.

## Designing the UX

- **Boundary placement** defines the reveal sequence. Group content that should appear together, and isolate slow, non-critical parts.
- **Transitions** (`startTransition`, router navigations) keep showing the previous screen while the next one loads, instead of flashing fallbacks for already-visible content.
- **Errors:** pair boundaries with error boundaries, and reset them on retry.
- **Skeletons** shaped like the content to avoid CLS.
- **SSR:** the same boundaries enable streaming HTML and selective hydration.

## Pitfalls

- Expecting `<Suspense>` to work with your existing `useEffect` fetches.
- A single top-level boundary leading to full-page spinners.
- Accidental sequential suspensions (two sibling `useSuspenseQuery` calls in one component run one after another) instead of prefetching in parallel.
- Hand-rolling "throw a promise" logic, which is an undocumented internal mechanism. Use `use` or a supported library.

## In an interview, mention…

- Components suspend, and boundaries show fallbacks. It only works with Suspense-enabled sources, not effects.
- Render-as-you-fetch vs fetch-on-render waterfalls.
- Promise caching requirements, `use`, and library and framework integration.
- Boundary design, transitions to avoid fallback flashes, and error boundaries.
