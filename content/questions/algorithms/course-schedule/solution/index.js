/**
 * @param {number} lessonCount
 * @param {Array<[number, number]>} prerequisites Pairs [lesson, required].
 * @return {boolean}
 */
export default function canFinishAll(lessonCount, prerequisites) {
  const unlocks = Array.from({ length: lessonCount }, () => []);
  const pending = new Array(lessonCount).fill(0);

  for (const [lesson, required] of prerequisites) {
    unlocks[required].push(lesson);
    pending[lesson]++;
  }

  const queue = [];
  for (let i = 0; i < lessonCount; i++) {
    if (pending[i] === 0) queue.push(i);
  }

  let completed = 0;
  for (let head = 0; head < queue.length; head++) {
    completed++;
    for (const next of unlocks[queue[head]]) {
      if (--pending[next] === 0) queue.push(next);
    }
  }

  return completed === lessonCount;
}
