A fitness app logs one record per gym session:

```js
{ user: 8, duration: 50, equipment: ['bench'] }
```

Implement `mergeData(sessions)`, which combines all sessions that belong to the same user into a single record.

```js
const sessions = [
  { user: 8, duration: 50, equipment: ['bench'] },
  { user: 7, duration: 150, equipment: ['dumbbell'] },
  { user: 1, duration: 10, equipment: ['barbell'] },
  { user: 7, duration: 100, equipment: ['bike', 'kettlebell'] },
  { user: 7, duration: 200, equipment: ['bike'] },
  { user: 2, duration: 200, equipment: ['treadmill'] },
  { user: 2, duration: 200, equipment: ['bike'] },
];

mergeData(sessions);
// [
//   { user: 8, duration: 50, equipment: ['bench'] },
//   { user: 7, duration: 450, equipment: ['bike', 'dumbbell', 'kettlebell'] },
//   { user: 1, duration: 10, equipment: ['barbell'] },
//   { user: 2, duration: 400, equipment: ['bike', 'treadmill'] },
// ]
```

## Requirements

- Return one record per distinct `user`, ordered by the position of that user's **first** session in the input.
- `duration` is the sum of the user's session durations.
- `equipment` is the union of the user's equipment lists: no duplicates, sorted alphabetically.
- Each output record has exactly the keys `user`, `duration` and `equipment`.
- **Do not mutate** the input: not the array, not the session objects, not their `equipment` arrays. The output must not share `equipment` arrays with the input.
- An empty input returns `[]`. A session with an empty `equipment` array is valid.

## Follow-up

- What's the complexity of your solution, and what would a naive one look like?
- The records arrive as a stream over a WebSocket. How would you keep the merged view up to date incrementally?
- How would you make the merge rules configurable (for example, keep the *maximum* duration instead of the sum)?
