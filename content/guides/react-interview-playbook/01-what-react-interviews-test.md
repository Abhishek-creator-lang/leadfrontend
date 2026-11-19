---
title: What React interviews test
description: The skills React-focused interview rounds actually measure, the question formats you'll meet, and how expectations differ for senior and lead candidates.
source: original
---
React has been the dominant UI library for over a decade, so "React interview" covers a lot of ground: from "what does `useEffect` do?" quizzes to building a working data table in 45 minutes to defending an app-wide state architecture. This chapter maps the territory so you can focus your preparation on what actually gets assessed.

## The four layers of React knowledge

| Layer | Example questions | Who gets asked |
| --- | --- | --- |
| **API fluency** | When does a component re-render? What's the dependency array for? Why do keys matter? | Everyone |
| **Mental model** | What happens between `setState` and the DOM update? What is reconciliation? Why must hooks be called unconditionally? | Mid and above |
| **Application design** | Where should this state live? How do you fetch and cache data? How do you structure a large app? | Senior and above |
| **Ecosystem and evolution** | Server Components vs SSR? What changed in React 19? When would you adopt React Compiler? | Senior, lead, staff |

Mid-level candidates can do well on the first two. Senior candidates need all four, and lead candidates are expected to discuss the fourth layer in terms of *organizational* decisions: migration plans, team conventions, and risk.

## Question formats

### 1. Conceptual / quiz

Short answers, often in a screen or mixed into a coding round.

- Controlled vs uncontrolled components
- `useMemo` vs `useCallback` vs `React.memo`
- What Strict Mode does in development (double-invoking renders and effects)
- What `key` does and why array indexes can be dangerous keys
- How context triggers re-renders

**Scoring:** accuracy, precision of vocabulary, and whether you can explain *why*, not just *what*.

### 2. UI coding (machine coding)

Build a component or small app: tabs, modal, autocomplete, todo list with filters, paginated table, file explorer, poll widget, star rating, stopwatch.

**Scoring:**
- Working functionality first
- Sensible state shape and component decomposition
- Correct effect usage and cleanup
- Accessibility (semantic HTML, keyboard, ARIA where needed)
- Edge cases: empty, loading, error, rapid input
- Code clarity under time pressure

### 3. Debugging / code review

You get a buggy component and have to find the issues: a stale closure in an interval, a missing dependency, an infinite render loop, a list keyed by index that loses input state, an effect that fetches without cancellation, or state derived from props being copied into state.

```jsx
// Spot the bugs
function Timer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000); // stale closure
  }, []); // no cleanup, so StrictMode creates two intervals
  return <p>{count}</p>;
}
```

Expected fix: `setCount((c) => c + 1)` and `return () => clearInterval(id)`.

### 4. React-flavored system design

"Design the front end for a dashboard with live widgets" or "Design a reusable data grid component." These lean heavily on state architecture, data fetching, performance, and component API design. The system design playbook covers the framework.

### 5. Deep-dive conversation

Especially at senior and above: "Tell me about the most complex React app you've worked on. How was state managed? What would you change?" Interviewers use your answers to probe depth: "Why Redux there?", "How did you find that performance issue?"

## Core topics checklist

Make sure you can explain and use each of these:

**Rendering**
- [ ] What triggers a render (state change, parent render, context change)
- [ ] Render phase vs commit phase
- [ ] Reconciliation and keys
- [ ] Batching (automatic batching since React 18)
- [ ] Strict Mode behaviors in development

**Hooks**
- [ ] `useState`, `useReducer`, functional updates
- [ ] `useEffect` vs `useLayoutEffect`, cleanup, dependencies
- [ ] `useRef` for mutable values and DOM access
- [ ] `useMemo`, `useCallback`, and when they're pointless
- [ ] `useContext` and its re-render behavior
- [ ] `useTransition`, `useDeferredValue`, `useId`, `useSyncExternalStore`
- [ ] React 19: `use`, `useActionState`, `useOptimistic`, `useFormStatus`
- [ ] Rules of Hooks and why they exist

**Architecture**
- [ ] State colocation and lifting state
- [ ] Server state vs client state
- [ ] Context vs external stores
- [ ] Composition patterns (children, compound components, render props, custom hooks)
- [ ] Error boundaries and Suspense boundaries

**Performance**
- [ ] Profiling with React DevTools
- [ ] Memoization strategy (and React Compiler)
- [ ] Code splitting with `lazy` and `Suspense`
- [ ] List virtualization

**Modern React**
- [ ] Server Components and the `'use client'` / `'use server'` directives
- [ ] Streaming SSR and selective hydration
- [ ] Actions and form handling in React 19

**Quality**
- [ ] Testing with React Testing Library (queries by role, user-event)
- [ ] Accessibility in components
- [ ] TypeScript with React (props, generics, event types)

## Version awareness

Interviewers in 2025 expect you to know which features belong to which version:

| Feature | Version |
| --- | --- |
| Hooks | 16.8 |
| `createRoot`, automatic batching, transitions, `useId`, `useSyncExternalStore`, streaming SSR with Suspense | 18 |
| Actions, `useActionState`, `useOptimistic`, `useFormStatus`, `use`, `ref` as a prop, `<Context>` as provider, document metadata, stylesheet and resource preloading APIs, stable Server Components | 19 |
| React Compiler | Separate build tool; stable 1.0 release in 2025, works with React 17+ (via a runtime package for versions before 19) |

When answering, it helps to say "in React 18…" or "since React 19…". It shows precision and avoids being caught out on version-specific behavior.

## What changes for senior and lead candidates

| Topic | Mid-level answer | Senior answer | Lead answer |
| --- | --- | --- | --- |
| State management | "I'd use Redux." | "Server state in TanStack Query, URL state for filters, local state otherwise; a small store for cross-cutting UI." | "Here's our decision record for state management; here's how we migrated off a monolithic store incrementally, and the lint rules that enforce boundaries." |
| Performance | "Use `useMemo`." | "Profile first; usually the fix is moving state down or splitting context; memoize at the boundaries." | "We set INP budgets per route, use RUM to find regressions, and are adopting React Compiler behind a flag with a codemod plan." |
| Testing | "Write unit tests." | "RTL tests by role, MSW for network, a few Playwright journeys." | "A testing strategy doc defining the pyramid, flaky-test policy, and CI gates." |
| New features | "I've heard of Server Components." | "Explains RSC vs SSR and when to use each." | "Evaluated RSC adoption: costs (infra, mental model, library support) vs benefits (bundle size, data locality), plus a phased rollout." |

## How to prepare efficiently

1. **Read the official docs at react.dev.** They were rewritten around hooks and modern patterns, and many interview questions come straight from concepts there ("You Might Not Need an Effect", "Preserving and Resetting State").
2. **Build 10–15 small components** under a timer, focusing on effects, forms, and lists.
3. **Practice explaining** render cycles and hooks out loud with simple diagrams.
4. **Do bug hunts:** take working components and break them on purpose (stale closures, missing keys), then explain the fix.
5. **Prepare two or three app stories** describing architecture decisions you made and what you'd change.

## Red flags interviewers watch for

- Using `useEffect` to sync derived state that could be computed during render.
- Mutating state directly (`items.push(x); setItems(items)`).
- Wrapping everything in `useMemo`/`useCallback` "for performance" without being able to explain when it helps.
- No cleanup for subscriptions, timers, or in-flight requests.
- Not knowing how keys affect component identity.
- Ignoring accessibility in UI rounds.
