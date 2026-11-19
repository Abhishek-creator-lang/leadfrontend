## TL;DR

`useOptimistic(state, updateFn?)` (React 19) returns `[optimisticState, addOptimistic]`. While an **Action or transition is in progress**, you call `addOptimistic(value)` to show the **expected result immediately**, e.g. a liked heart or a new message in the list. When the action finishes, React **discards the optimistic overlay** and renders from the real `state` again. If the server confirmed the change, the real state now includes it. If the action failed, the UI **automatically reverts**. No manual rollback code is needed.

## Example: sending a message

```jsx
import { useOptimistic, useState, startTransition } from 'react';

function Thread({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (current, newText) => [...current, { id: `temp-${current.length}`, text: newText, sending: true }]
  );

  async function sendAction(formData) {
    const text = formData.get('text');
    addOptimisticMessage(text);              // shows instantly
    const saved = await sendMessage(text);   // network round trip
    startTransition(() => {
      setMessages(prev => [...prev, saved]); // commit the real result
    });
  }

  return (
    <>
      <ul>
        {optimisticMessages.map(m => (
          <li key={m.id} style={{ opacity: m.sending ? 0.5 : 1 }}>{m.text}</li>
        ))}
      </ul>
      <form action={sendAction}>
        <input name="text" required />
        <button>Send</button>
      </form>
    </>
  );
}
```

## How it works

- The **first argument** is the source-of-truth state. Whenever no action is pending, `optimisticState === state`.
- The **reducer** `(currentState, optimisticValue) => newState` merges the optimistic value. Without a reducer, the value you pass simply replaces the state.
- `addOptimistic` must be called **inside an Action or `startTransition`** (a form action counts). Outside one, React warns and the update flashes and disappears.
- Optimistic updates are layered on top of the latest `state`. If `state` changes during the action (another update arrives), React **re-applies the reducer** on top of the new base. This is why it's a reducer, not a snapshot.
- When the transition ends, success or failure, the optimistic layer is removed.

## Error handling

If `sendMessage` throws, the action rejects. The optimistic message disappears (revert), and the error propagates to an error boundary unless you catch it. For good UX, catch the error and show a toast or inline "failed, retry" state, perhaps by keeping the failed item in real state with an error flag.

## When to use optimistic UI

Good fits: likes, toggles, reordering, adding comments or messages, renames. These are high-success-rate, easily reversible operations where latency would make the UI feel sluggish.

Avoid it for payments, irreversible or destructive actions, operations with frequent server-side validation failures, or anything where showing a false success is harmful.

## Compared with library approaches

TanStack Query and others offer optimistic updates through `onMutate` cache edits with manual rollback in `onError`. `useOptimistic` is the built-in, component-local version tied to React's transition lifecycle. With a query library, keep using its cache-level mechanism so all views stay consistent.

## Pitfalls

- Generating temporary ids that collide with real ones. Reconcile temp ids when the real item arrives.
- Forgetting to update the real state after success, so the item vanishes when the optimistic layer drops.
- Not indicating pending status, so users can't tell what's confirmed.

## In an interview, mention…

- It's an overlay on real state, active only while an Action or transition is pending, with automatic revert.
- It must be called inside an Action or transition, and the reducer re-applies on top of new base state.
- Error UX and when *not* to be optimistic.
- How it relates to `useActionState` and to cache-level optimistic updates in query libraries.
