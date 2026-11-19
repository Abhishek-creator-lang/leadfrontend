/**
 * Sorts the array in place in ascending order and returns it.
 * @param {number[]} numbers
 * @return {number[]}
 */
export default function selectionSort(numbers) {
  const n = numbers.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (numbers[j] < numbers[minIndex]) minIndex = j;
    }
    if (minIndex !== i) {
      const tmp = numbers[i];
      numbers[i] = numbers[minIndex];
      numbers[minIndex] = tmp;
    }
  }
  return numbers;
}
