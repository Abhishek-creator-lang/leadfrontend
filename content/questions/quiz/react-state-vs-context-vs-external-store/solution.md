## TL;DR

First **classify the state**, then pick the simplest tool that fits:

- **Server data** (anything fetched): a **server-cache** layer (TanStack Query, SWR, RTK Query, or framework loaders and Server Components), *not* a global store.
- **URL state** (filters, tabs, pagination): the **router/search params**, so it's shareable and survives reloads.
- **Local UI state** (open/closed, input drafts): **`useState`/`useReducer`** in the component that uses it, lifted only as far as needed.
- **Low-frequency shared values** (theme, locale, current user, feature flags, dependencies): **context**.
- **Frequently updated, widely shared client state** (editors, complex multi-step flows, real-time collaborative data, cross-feature workflows): an **external store with selectors** (Zustand, Redux Toolkit, Jotai, XState).

## Decision guide

| Question | If yes |
|---|---|
| Does it come from the server? | Query cache / loaders |
| Should it be in the URL (shareable, back button)? | Search params |
| Used by one component or a small subtree? | `useState`/`useReducer`, colocated |
| Shared widely but changes rarely? | Context |
| Shared widely and changes often, or consumers need slices? | External store with selectors |
| Complex transitions, impossible states? | Reducer or state machine |
| Must persist (localStorage, IndexedDB) or sync across tabs? | Store with persistence middleware |

## Why not "context for everything"?

Context has no selectors: every consumer re-renders on any value change. It's ideal for dependency injection and rarely changing values, and poor for hot state like cursor positions, form field values in large forms, or collaborative documents. Splitting contexts helps up to a point. After that, `useSyncExternalStore`-based stores let components subscribe to exactly the slice they need.

## Why not "Redux for everything"?

Putting server data in a global store means hand-writing caching, invalidation, loading flags and deduplication, which query libraries do better. Putting local UI state there adds indirection and makes components less reusable. Use a global store for **genuinely global, client-owned** state.

## Example split in a real app

```jsx
// URL
const [params, setParams] = useSearchParams();       // ?status=open&page=2
// Server
const { data: tickets } = useQuery({ queryKey: ['tickets', params.toString()], queryFn: … });
// Local
const [isBulkEditOpen, setBulkEditOpen] = useState(false);
// Context
const { user, permissions } = useSession();
// Store (Zustand) for a complex cross-panel selection
const selectedIds = useSelectionStore(s => s.selectedIds);
```

## Lead-level considerations

- **Team conventions:** document where each kind of state lives. Consistency matters more than the specific library.
- **RSC era:** much data fetching moves to Server Components, which shrinks client state. Client stores can't be read in Server Components, so keep providers and stores in client boundaries.
- **Performance:** selectors, normalized data, and avoiding derived state in stores.
- **Devtools and testing:** Redux DevTools and time travel, store reset between tests.
- **Bundle size and learning curve:** Zustand/Jotai are tiny, and Redux Toolkit brings structure that large teams may want.
- **Migration path:** start local, lift when needed, extract a store when context re-renders or prop drilling become real problems, not hypothetical ones.

## In an interview, mention…

- Classify first: server, URL, local, shared-rare, shared-hot.
- Context is dependency injection without selectors, and stores give you selective subscriptions.
- Server cache libraries remove most "global state".
- Conventions and the RSC impact, as a lead.
