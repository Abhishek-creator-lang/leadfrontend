A multi-step onboarding wizard has `n` screens. A "skip" link lets the user jump ahead by **two** screens instead of one. Write `countPaths(n)`, which returns how many different sequences of moves take the user from the start to exactly screen `n`, where each move advances by 1 or 2 screens.

```js
countPaths(1); // 1  [1]
countPaths(2); // 2  [1,1], [2]
countPaths(3); // 3  [1,1,1], [1,2], [2,1]
countPaths(4); // 5
countPaths(0); // 1  (already there: the empty sequence)
```

## Constraints

- `0 ≤ n ≤ 70`. All answers fit exactly in a JS number (they stay below `Number.MAX_SAFE_INTEGER`).
- The plain recursive solution is exponential and won't finish for large `n`. Aim for O(n) time and O(1) space.

## Follow-up

- What if the allowed jump sizes were an arbitrary list, like `[1, 3, 5]`?
- Can you compute it in O(log n)?
