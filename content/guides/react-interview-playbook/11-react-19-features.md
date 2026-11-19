---
title: React 19 features
description: What's new in React 19 and 19.x, including Actions, useActionState, useOptimistic, useFormStatus, use, ref as a prop, metadata and resource APIs, Server Components, and the removals and breaking changes to know for interviews.
source: original
---
React 19 (stable since December 2024) is the biggest API change since hooks. Interviewers use it to check whether your knowledge is current, and at senior level, whether you can judge when the new features actually help. This chapter covers each feature with code, compared to how you'd do the same thing in React 18.

## At a glance

| Area | React 18 | React 19 |
| --- | --- | --- |
| Async mutations | Manual `isPending`/error state | **Actions**: async transitions with built-in pending, errors, and optimistic updates |
| Form submission | `onSubmit` + `preventDefault` | `<form action={fn}>`, `useActionState`, `useFormStatus` |
| Optimistic UI | Manual or via libraries | `useOptimistic` |
| Reading promises/context | `useContext`; no promise API | `use(promise)`, `use(context)`, callable conditionally |
| Refs on function components | `forwardRef` | `ref` is a regular prop |
| Context provider | `<Ctx.Provider value>` | `<Ctx value>` |
| Ref cleanup | Called with `null` on unmount | Ref callbacks can return a cleanup function |
| Document metadata | Libraries (react-helmet) | `<title>`, `<meta>`, `<link>` rendered anywhere and hoisted to `<head>` |
| Stylesheets | Manual ordering | `<link rel="stylesheet" precedence="…">` with dedupe and ordering |
| Resource hints | Manual `<link>` | `preload`, `preinit`, `prefetchDNS`, `preconnect` from `react-dom` |
| Server Components | Experimental | Stable (through frameworks) |
| Custom elements | Partial | Full support (properties vs attributes) |
| Hydration errors | Several vague errors | A single error with a diff |
| Error reporting | `console.error` duplicates | `onCaughtError`, `onUncaughtError`, `onRecoverableError` root options |

## Actions

An **Action** is a function that triggers a transition, and in React 19 it can be async. React tracks its pending state and integrates it with forms, optimistic updates, and error boundaries.

```tsx
// React 18 style
function UpdateName() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit() {
    setIsPending(true);
    const err = await updateName(name);
    setIsPending(false);
    if (err) setError(err);
  }
  // ...
}

// React 19 with useTransition
function UpdateName() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const err = await updateName(name);
      if (err) {
        setError(err);
        return;
      }
    });
  }
  // ...
}
```

`isPending` becomes true right away and stays true until the async function finishes. One caveat: state updates made *after* an `await` inside the transition may need their own `startTransition` wrapper to be treated as part of the transition. The docs call this out, and a future version is expected to remove the need.

## useActionState

```tsx
const [state, formAction, isPending] = useActionState(
  async (previousState, formData: FormData) => {
    const result = await saveProfile(formData);
    return result.ok ? { message: 'Saved' } : { error: result.error };
  },
  { message: '' }
);

return (
  <form action={formAction}>
    <input name="displayName" />
    <button disabled={isPending}>Save</button>
    {state.error && <p role="alert">{state.error}</p>}
  </form>
);
```

- The action receives the **previous state** and the **payload** (FormData for forms).
- It returns the next state. Calls are queued in order.
- With RSC frameworks, the form can submit before hydration (progressive enhancement), and you can pass an optional permalink argument.

## `<form action>` and useFormStatus

- Passing a function to `action` (or `formAction` on buttons) makes React submit via that function inside a transition.
- After a successful action, React **automatically resets uncontrolled fields** in that form. (`requestFormReset` exists for manual control.)
- `useFormStatus()` from `react-dom` gives `{ pending, data, method, action }` for the nearest parent form. It's great for reusable submit buttons.

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

## useOptimistic

```tsx
function Thread({ messages, sendMessage }: { messages: Msg[]; sendMessage: (fd: FormData) => Promise<void> }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current: Msg[], text: string) => [...current, { id: crypto.randomUUID(), text, sending: true }]
  );

  async function action(formData: FormData) {
    addOptimistic(String(formData.get('text')));
    await sendMessage(formData);
  }

  return (
    <>
      <ul>
        {optimisticMessages.map((m) => (
          <li key={m.id}>{m.text}{m.sending && <small> (sending…)</small>}</li>
        ))}
      </ul>
      <form action={action}><input name="text" /><button>Send</button></form>
    </>
  );
}
```

The optimistic state is shown while the Action is pending. When it finishes, React switches back to the real `messages` (which the parent should have updated by then). If the action fails, the optimistic item simply goes away, so show an error yourself.

## use

`use` reads the value of a **promise** or **context** during render:

```tsx
function Profile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // suspends until resolved; throws to error boundary on rejection
  return <h2>{user.name}</h2>;
}

function Panel({ show }: { show: boolean }) {
  if (!show) return null;
  const theme = use(ThemeContext); // allowed after an early return / inside conditions
  return <div className={theme} />;
}
```

Rules:
- It can be called inside conditions and loops, but still only in components or hooks (not in event handlers), and not inside try/catch.
- Promises must be **stable**: created in a Server Component, a loader, or a cache, not freshly inside the rendering component. Creating a new promise on every render makes it suspend forever.
- It works with Suspense and error boundaries.

## ref as a prop, and ref cleanups

```tsx
// React 19: no forwardRef needed
function Input({ ref, ...props }: React.ComponentProps<'input'>) {
  return <input ref={ref} {...props} />;
}

// Ref callback with cleanup
<div
  ref={(node) => {
    const observer = new ResizeObserver(() => {});
    observer.observe(node!);
    return () => observer.disconnect();
  }}
/>
```

`forwardRef` still works, but it's expected to be deprecated. Because ref callbacks can now return a cleanup function, implicit returns in ref callbacks (`ref={(n) => (instance = n)}`) are now rejected by TypeScript. Use a block body.

## Context as provider

```tsx
const ThemeContext = createContext('light');
<ThemeContext value="dark">{children}</ThemeContext>
```

## Document metadata, stylesheets, and resource hints

```tsx
function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <link rel="canonical" href={post.url} />
      <link rel="stylesheet" href="/post.css" precedence="default" />
      <h1>{post.title}</h1>
    </article>
  );
}
```

React hoists `<title>`, `<meta>`, and `<link>` into `<head>`. Stylesheets with `precedence` are deduplicated and ordered, and Suspense waits for them before revealing content. Async scripts (`<script async>`) are deduplicated too.

```ts
import { preload, preinit, preconnect, prefetchDNS } from 'react-dom';
preconnect('https://cdn.example.com');
preload('/fonts/inter.woff2', { as: 'font', type: 'font/woff2', crossOrigin: '' });
preinit('/analytics.js', { as: 'script' });
```

## Server Components and Server Functions

Stable in React 19. Frameworks provide the bundler integration. See the Server Components chapter. Key directives: `'use client'` (a client module boundary) and `'use server'` (functions callable from the client).

## Other improvements

- **Better hydration errors** with diffs, and tolerance for third-party scripts and extensions injecting elements.
- **Error handling:** errors caught by boundaries are reported once via `console.error`. New root options for custom reporting.
- **Custom elements:** properties and attributes are handled correctly, and server rendering is supported.
- **Strict Mode:** `useMemo`/`useCallback` reuse first-render results during the dev double render. Ref callbacks are double-invoked on mount.
- **Suspense:** when a component suspends, React commits the nearest fallback immediately instead of first rendering the suspended siblings, then "pre-warms" the siblings.

## React 19.x additions

| Version | Notable additions |
| --- | --- |
| 19.1 | Owner stacks for debugging (`captureOwnerStack`), Suspense improvements |
| 19.2 | `<Activity>` (hide/show UI while preserving state, with effects unmounted while hidden), `useEffectEvent`, `cacheSignal` for RSC, Performance panel tracks in Chrome DevTools, partial pre-rendering APIs |

## Removed and breaking changes (React 19)

| Removed | Replacement |
| --- | --- |
| `propTypes` checks and `defaultProps` on function components | TypeScript; ES default parameters |
| Legacy context (`contextTypes`, `getChildContext`) | `createContext` |
| String refs | Callback refs / `useRef` |
| `ReactDOM.render`, `ReactDOM.hydrate` | `createRoot`, `hydrateRoot` |
| `unmountComponentAtNode`, `findDOMNode` | `root.unmount()`, DOM refs |
| `react-dom/test-utils` (except `act` moved to `react`) | `act` from `react`; RTL |
| `react-test-renderer/shallow` | RTL |
| UMD builds | ESM CDNs |

Also: errors thrown during render are no longer re-thrown, the JSX transform must be the new transform, and `useRef` requires an argument in TypeScript types.

**Upgrade path:** move to React 18.3 first (it adds warnings for the deprecated APIs), fix the warnings, then upgrade to 19 using the official codemods.

## How to talk about React 19 in interviews

- **Junior signal:** "React 19 added new hooks."
- **Senior signal:** "Actions unify the pending, error, and optimistic handling we used to write by hand. For forms, `useActionState` plus `useFormStatus` remove a lot of boilerplate and support progressive enhancement with Server Functions. `use` lets us read promises from a server or loader directly. I'd still use TanStack Query for client-side caching. Actions don't replace a cache."
- **Lead signal:** "We upgraded through 18.3 to catch deprecations, ran the codemods, and adopted the new form APIs for new code only. We measured bundle size and INP before and after, and we have a plan for React Compiler once our lint violations are near zero."
