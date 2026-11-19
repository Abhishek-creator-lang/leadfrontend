/**
 * Clamps `number` to the inclusive range [lower, upper].
 *
 * @param {number} number
 * @param {number} lower
 * @param {number} upper
 * @return {number}
 */
export default function clamp(number, lower, upper) {
  return Math.min(Math.max(number, lower), upper);
}
