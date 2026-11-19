/**
 * @typedef {{ attribute: string, operator: string, value: any }} Condition
 * @typedef {{
 *   key: string,
 *   enabled: boolean,
 *   offValue?: any,
 *   defaultValue?: any,
 *   rules?: Array<{ conditions: Condition[], value: any }>,
 *   rollout?: { percentage: number, value: any, bucketBy?: string },
 * }} Flag
 */

/**
 * Stable bucket in [0, 100) for `id` within `seed`, using 32-bit FNV-1a over `${seed}:${id}`.
 *
 * @param {string} seed
 * @param {string} id
 * @return {number}
 */
export function bucket(seed, id) {
  throw 'Not implemented!';
}

/**
 * @param {Flag} flag
 * @param {Record<string, any>} [context]
 * @return {any}
 */
export default function evaluateFlag(flag, context = {}) {
  throw 'Not implemented!';
}
