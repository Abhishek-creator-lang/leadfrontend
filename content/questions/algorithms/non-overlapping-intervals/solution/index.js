/**
 * @param {Array<[number, number]>} requests Half-open [start, end) intervals.
 * @return {number} Minimum number of requests to reject.
 */
export default function minRemovals(requests) {
  const byEnd = requests.slice().sort((a, b) => a[1] - b[1]);

  let kept = 0;
  let lastEnd = -Infinity;
  for (const [start, end] of byEnd) {
    if (start >= lastEnd) {
      kept++;
      lastEnd = end;
    }
  }

  return requests.length - kept;
}
