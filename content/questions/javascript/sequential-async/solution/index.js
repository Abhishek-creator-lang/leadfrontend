/**
 * Runs `tasks` one after another. Each task receives the previous task's result.
 *
 * @param {Array<(previous: any) => any>} tasks
 * @return {Promise<any[]>}
 */
export default async function series(tasks) {
  const results = [];
  let previous;
  for (const task of tasks) {
    previous = await task(previous);
    results.push(previous);
  }
  return results;
}
