## TL;DR

Both mark work as **non-urgent** so React's concurrent renderer can **keep the UI responsive**: urgent updates (typing, clicking) render first, and the non-urgent render happens in the background, **can be interrupted**, and is **discarded if newer input arrives**. **`useTransition`** gives you `[isPending, startTransition]` to wrap **state updates you control** (including async Actions in React 19). **`useDeferredValue(value)`** gives you a **lagging copy of a value** you may not control (a prop, or state from elsewhere), which re-renders with the new value at low priority. Neither debounces or makes code faster. They change **scheduling priority**.

## useTransition

```jsx
function TabContainer() {
  const [tab, setTab] = useState('about');
  const [isPending, startTransition] = useTransition();

  function selectTab(next) {
    startTransition(() => {
      setTab(next); // the expensive tab renders in the background
    });
  }

  return (
    <>
      <TabButtons onSelect={selectTab} pendingTab={isPending ? tab : null} />
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {tab === 'posts' ? <SlowPosts /> : <About />}
      </div>
    </>
  );
}
```

- Clicking another tab while `SlowPosts` is rendering interrupts it. The UI never freezes.
- If the new content **suspends**, React **keeps the old UI** on screen instead of showing a Suspense fallback. Routers wrap navigations in transitions for this reason.
- **React 19:** `startTransition` accepts **async functions** (Actions). `isPending` stays true until they finish. Updates after an `await` must be wrapped in another `startTransition`.
- The standalone `startTransition` import works where hooks aren't available, but provides no `isPending`.

## useDeferredValue

```jsx
function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <SlowResults query={deferredQuery} /> {/* wrap in memo so urgent renders skip it */}
      </div>
    </>
  );
}
```

On each keystroke React first renders with the **old** `deferredQuery` (the input updates instantly), then attempts a background render with the new value. `SlowResults` should be **memoized** (`memo`, or the React Compiler), otherwise the urgent render re-renders it anyway and you gain nothing.

React 19 added an `initialValue` argument: `useDeferredValue(value, initialValue)` renders the initial value first (useful for showing a cheap placeholder on mount), then the real value in the background.

## Choosing

| Use `useTransition` when… | Use `useDeferredValue` when… |
|---|---|
| You own the state update | You receive the value (props, a library hook) |
| You want `isPending` for a specific action | You want to show stale content while fresh content renders |
| Navigation, tab switches, async Actions | Filtering or search results, charts driven by input |

## Rules and pitfalls

- **Text inputs must not be updated in a transition**. Controlled inputs need synchronous updates, or keystrokes get dropped. Keep the input state urgent and defer the expensive consumer.
- It's **not debouncing**: no fixed delay, and the work does happen (on fast devices almost immediately). For network requests you may still want debouncing or caching.
- Transitions don't help if the slow part is **one long synchronous chunk outside React rendering** (e.g. a huge JSON parse in an event handler). Use a worker or yield.
- Don't use the transition's `isPending` for unrelated UI. It's per hook instance.

## In an interview, mention…

- Urgent vs non-urgent updates. Both are scheduling tools built on concurrent rendering (React 18+).
- `useTransition` wraps updates you own (async Actions in 19). `useDeferredValue` wraps values (with `initialValue` in 19).
- Keeping old UI visible instead of Suspense fallbacks during transitions.
- Pitfalls: memoize the deferred consumer, never put input state in a transition, it's not a debounce.
