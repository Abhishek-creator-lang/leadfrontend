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
 * Stable bucket in [0, 100) for an id within a seed (usually the flag key).
 * FNV-1a 32-bit hash: fast, deterministic across runs, browsers and servers.
 *
 * @param {string} seed
 * @param {string} id
 * @return {number}
 */
export function bucket(seed, id) {
  const input = `${seed}:${id}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % 100;
}

const OPERATORS = {
  eq: (actual, expected) => actual === expected,
  neq: (actual, expected) => actual !== expected,
  in: (actual, expected) => expected.includes(actual),
  notIn: (actual, expected) => !expected.includes(actual),
  gt: (actual, expected) => actual > expected,
  gte: (actual, expected) => actual >= expected,
  lt: (actual, expected) => actual < expected,
  lte: (actual, expected) => actual <= expected,
  contains: (actual, expected) => typeof actual === 'string' && actual.includes(expected),
};

function matches(condition, context) {
  const test = OPERATORS[condition.operator];
  if (!test) throw new Error(`Unknown operator: ${condition.operator}`);
  const actual = context[condition.attribute];
  // A missing attribute never matches, so rules can't accidentally target unknown users.
  if (actual === undefined || actual === null) return false;
  return test(actual, condition.value);
}

/**
 * @param {Flag} flag
 * @param {Record<string, any>} [context]
 * @return {any}
 */
export default function evaluateFlag(flag, context = {}) {
  const { offValue = false, defaultValue = false, rules = [], rollout } = flag;

  if (!flag.enabled) return offValue;

  for (const rule of rules) {
    if (rule.conditions.every((condition) => matches(condition, context))) {
      return rule.value;
    }
  }

  if (rollout) {
    const id = context[rollout.bucketBy || 'userId'];
    if (id !== undefined && id !== null && bucket(flag.key, String(id)) < rollout.percentage) {
      return rollout.value;
    }
  }

  return defaultValue;
}
