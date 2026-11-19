Implement `insertionSort(numbers)`. It sorts the array **in place** in ascending order and returns the same array.

Insertion sort is how most people sort a hand of cards: the left part of the array is always sorted, and each new element is slid left until it sits in the right spot. It shines on data that is *almost* sorted, such as a leaderboard where only one player's score just changed.

```js
const scores = [88, 92, 75, 92, 60];
insertionSort(scores); // [60, 75, 88, 92, 92]
scores;                // [60, 75, 88, 92, 92] (same array, sorted in place)
```

## Constraints

- Don't use `Array.prototype.sort`.
- Use O(1) extra space.
- On an already-sorted array your implementation should do only a linear amount of work.
- Inputs have at most a few thousand elements.

## Follow-up

- Why do production sort implementations (Timsort, introsort) switch to insertion sort for small ranges?
- Is your implementation stable?
