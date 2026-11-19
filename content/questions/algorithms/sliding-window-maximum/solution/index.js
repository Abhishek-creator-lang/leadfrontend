/**
 * @param {number[]} samples
 * @param {number} k Window size, 1 <= k <= samples.length.
 * @return {number[]} Maximum of each window, left to right.
 */
export default function slidingMax(samples, k) {
  const result = [];
  // Indices with decreasing values; deque[head] is the current max.
  const deque = [];
  let head = 0;

  for (let i = 0; i < samples.length; i++) {
    // 1. Drop the front index once it leaves the window.
    if (head < deque.length && deque[head] <= i - k) head++;

    // 2. Older values that are not larger than the new one can never be the max again.
    while (deque.length > head && samples[deque[deque.length - 1]] <= samples[i]) deque.pop();

    // 3. Add the new index.
    deque.push(i);

    // 4. Record once the first full window is reached.
    if (i >= k - 1) result.push(samples[deque[head]]);
  }

  return result;
}
