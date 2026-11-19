/**
 * Sorts the array in place in ascending order and returns it.
 * @param {number[]} numbers
 * @return {number[]}
 */
export default function heapSort(numbers) {
  const n = numbers.length;

  // 1. Build a max-heap bottom-up, starting from the last non-leaf node.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(numbers, i, n);
  }

  // 2. Move the max to the end and repair the shrinking heap.
  for (let end = n - 1; end > 0; end--) {
    swap(numbers, 0, end);
    siftDown(numbers, 0, end);
  }

  return numbers;
}

function swap(a, i, j) {
  const tmp = a[i];
  a[i] = a[j];
  a[j] = tmp;
}

// Restores the max-heap property for the subtree rooted at i, within a[0, size).
function siftDown(a, i, size) {
  while (true) {
    const left = 2 * i + 1;
    const right = left + 1;
    let largest = i;
    if (left < size && a[left] > a[largest]) largest = left;
    if (right < size && a[right] > a[largest]) largest = right;
    if (largest === i) return;
    swap(a, i, largest);
    i = largest;
  }
}
