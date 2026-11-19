A performance monitor samples frame times (in ms) continuously. The dashboard plots the **worst frame time over the last `k` samples**, updated at every sample. Write `slidingMax(samples, k)`, which returns the maximum of every contiguous window of size `k`, from left to right.

```js
slidingMax([16, 17, 33, 16, 15, 50, 16, 16], 3);
// windows: [16,17,33] [17,33,16] [33,16,15] [16,15,50] [15,50,16] [50,16,16]
// result:  [33, 33, 33, 50, 50, 50]

slidingMax([4, 2, 12, 3], 1); // [4, 2, 12, 3]
slidingMax([4, 2, 12, 3], 4); // [12]
```

## Requirements

- `1 ≤ k ≤ samples.length`. The result has `samples.length - k + 1` entries.
- Values can be any numbers, including negatives and duplicates.

## Constraints

- Up to 10⁵ samples and `k` up to 10⁵. Recomputing the max of each window is O(n·k), which is too slow. Aim for **O(n)**.

## Follow-up

- How would you make this an online structure that receives samples one at a time?
- How would you report the window **minimum** at the same time?
