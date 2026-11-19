/**
 * @typedef {{ user: number, duration: number, equipment: Array<string> }} Session
 */

/**
 * Merges sessions by user: sums durations and unions (sorted) equipment.
 *
 * @param {Array<Session>} sessions
 * @return {Array<Session>}
 */
export default function mergeData(sessions) {
  // A Map keeps first-insertion order and does not reorder numeric keys.
  const byUser = new Map();

  for (const { user, duration, equipment } of sessions) {
    let entry = byUser.get(user);
    if (!entry) {
      entry = { user, duration: 0, equipment: new Set() };
      byUser.set(user, entry);
    }
    entry.duration += duration;
    for (const item of equipment) entry.equipment.add(item);
  }

  return Array.from(byUser.values(), ({ user, duration, equipment }) => ({
    user,
    duration,
    equipment: [...equipment].sort(),
  }));
}
