## TL;DR

**Fiber is React's reconciliation engine, rewritten for React 16.** It represents each component instance as a **fiber node**, a unit of work in a linked tree (child, sibling and return pointers) that holds state, props, hooks, effects and a link to the DOM node. The previous "stack reconciler" walked the tree **recursively and synchronously**, so a big update **blocked the main thread until it finished**. Fiber turns rendering into an **iterative loop over units of work** that can be **paused, prioritized, resumed or thrown away**, with a separate synchronous **commit phase**. That's the foundation for error boundaries, fragments, portals, Suspense and, since React 18, **concurrent rendering** (transitions, `useDeferredValue`, selective hydration).

## The problem with the stack reconciler

Before React 16, reconciliation recursed through components using the JavaScript call stack. Once it started, it couldn't stop until the whole tree was processed. A 100 ms render meant 100 ms where typing, clicks and animations froze. There was no way to say "this keystroke is more urgent than that list update".

## What a fiber is

Roughly, an object per component or host element:

```js
{
  type, key,               // what it is
  stateNode,               // DOM node or class instance
  child, sibling, return,  // linked-tree pointers (enables iteration without recursion)
  pendingProps, memoizedProps, memoizedState, // memoizedState holds the hooks list
  updateQueue,
  flags,                   // side effects to commit (placement, update, deletion)
  lanes,                   // priority of pending work
  alternate,               // the corresponding fiber in the other tree
}
```

**Double buffering:** React keeps a **current** tree (what's on screen) and builds a **work-in-progress** tree with `alternate` links. When the work-in-progress tree is complete, the commit swaps them.

## Two phases

1. **Render (reconciliation):** process fibers one at a time, calling components and diffing children. This phase is **pure and interruptible**. React can yield to the browser between units of work (time slicing), restart if higher-priority updates arrive, or discard work.
2. **Commit:** apply DOM mutations, attach refs, and run layout effects. This is **synchronous and uninterruptible**, so users never see a half-updated UI. Passive effects run afterwards.

## Priorities (lanes)

Updates are assigned **lanes**: discrete input (click, keypress) is urgent, continuous events (scroll, mousemove) come next, then default, then **transitions** and idle work. React processes higher lanes first and can interrupt a transition render when the user types.

```jsx
const [isPending, startTransition] = useTransition();
function onChange(e) {
  setQuery(e.target.value);                         // urgent lane
  startTransition(() => setFilter(e.target.value)); // transition lane, interruptible
}
```

## What Fiber enabled over time

- **React 16:** error boundaries, fragments, portals, returning arrays and strings.
- **React 16.6+:** `lazy` and Suspense for code splitting.
- **React 16.8:** hooks (stored as a linked list on the fiber's `memoizedState`, which is why call order matters).
- **React 18:** concurrent rendering by default with `createRoot`, automatic batching, transitions, streaming SSR and selective hydration.
- **React 19:** Actions, `use`, and better Suspense behaviour. **19.2:** `<Activity>` to hide subtrees while preserving state.

## Consequences for developers

- **Render must be pure**, because it may run several times or be discarded. Strict Mode double-invokes renders to check this.
- **Don't rely on render order or count** for side effects. Use effects.
- Legacy lifecycles (`componentWillMount` and similar) became unsafe because the render phase can run without a commit.

## In an interview, mention…

- Stack reconciler (recursive, blocking) vs Fiber (incremental, interruptible).
- Fiber nodes, the linked tree, double buffering, and the render/commit split.
- Priorities and lanes, and how transitions use them.
- Why purity matters, and the features Fiber unlocked (hooks, Suspense, concurrent rendering).
