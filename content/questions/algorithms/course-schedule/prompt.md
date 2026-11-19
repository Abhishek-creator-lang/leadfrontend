A learning platform's onboarding has `lessonCount` lessons numbered `0` to `lessonCount - 1`. Some lessons unlock only after others are done. Each prerequisite is a pair `[lesson, required]`, meaning `required` must be completed before `lesson`.

Content editors sometimes create impossible setups by accident (A needs B, and B needs A). Write `canFinishAll(lessonCount, prerequisites)`, which returns `true` if some order lets a learner complete **every** lesson, and `false` otherwise.

```js
canFinishAll(3, [[1, 0], [2, 1]]);          // true  (0 → 1 → 2)
canFinishAll(2, [[0, 1], [1, 0]]);          // false (each needs the other)
canFinishAll(4, [[1, 0], [2, 0], [3, 1], [3, 2]]); // true
canFinishAll(1, [[0, 0]]);                  // false (a lesson can't require itself)
canFinishAll(5, []);                        // true
```

## Constraints

- `1 ≤ lessonCount ≤ 10⁵`, up to 10⁵ prerequisite pairs.
- Pairs may repeat.
- Aim for O(V + E). Shared prerequisites ("diamonds") must not cause repeated work.

## Follow-up

- Return one valid order in which to take the lessons.
- How would the editor UI highlight *which* lessons form the impossible loop?
