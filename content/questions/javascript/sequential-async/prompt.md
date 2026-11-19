Implement `series(tasks)`. `tasks` is an array of functions that may be async. They must run **one at a time, in order**: a task starts only after the previous one has settled. Each task receives the previous task's result as its argument (the first task receives `undefined`).

`series` returns a promise that resolves to an array of every task's result.

```js
const results = await series([
  () => login('ada', 'secret'),             // -> session
  (session) => fetchProfile(session.token), // -> profile
  (profile) => profile.name.toUpperCase(),  // sync tasks are fine too
]);
// results -> [session, profile, 'ADA']
```

## Requirements

- Never start a task before the previous one has finished.
- A task may return a plain value, return a promise, or throw.
- If a task rejects or throws, `series` rejects with that error and **the remaining tasks are not called**.
- An empty list resolves to `[]`.
- `series` itself always returns a promise and never throws synchronously, even if the first task throws.

## Follow-up

- Write it once with `async/await` and once with `Array.prototype.reduce` and plain promises.
- What's the difference between this and `Promise.all(tasks.map((t) => t()))`?
- When is running in series the right call in a real UI?
