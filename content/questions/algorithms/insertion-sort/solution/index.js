/**
 * Sorts the array in place in ascending order and returns it.
 * @param {number[]} numbers
 * @return {number[]}
 */
export default function insertionSort(numbers) {
  for (let i = 1; i < numbers.length; i++) {
    const current = numbers[i];
    let j = i - 1;
    // Shift larger elements one slot to the right to open a hole for `current`.
    while (j >= 0 && numbers[j] > current) {
      numbers[j + 1] = numbers[j];
      j--;
    }
    numbers[j + 1] = current;
  }
  return numbers;
}
