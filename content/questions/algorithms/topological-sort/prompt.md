A bundler has to evaluate modules so that every module runs **after** all the modules it imports. Write `topologicalSort(imports)`, which returns such an order.

`imports` maps each module name to the list of modules it imports directly. A module that only appears inside some list (a leaf such as a utility file) may have no key of its own, but it must still appear in the output.

```js
topologicalSort({
  'app.js': ['router.js', 'store.js'],
  'router.js': ['utils.js'],
  'store.js': ['utils.js'],
});
// One valid answer: ['utils.js', 'router.js', 'store.js', 'app.js']
// ['utils.js', 'store.js', 'router.js', 'app.js'] is equally valid.

topologicalSort({ 'a.js': ['b.js'], 'b.js': ['a.js'] });
// throws an Error: circular import
```

## Requirements

- Every module (keys and values) appears **exactly once** in the result.
- For every edge `X imports Y`, `Y` appears before `X`.
- If there is a cycle, **throw an `Error`**.
- Any valid order is accepted.

## Constraints

- Up to ~10⁵ modules and imports. Aim for O(V + E).
- Graphs can have lots of shared dependencies (diamonds), so don't explore the same module repeatedly.

## Follow-up

- How would you report *which* modules form the cycle?
- How would you group modules into "waves" that can be built in parallel?
