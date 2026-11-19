// Suggested design: every memo and effect records the signals/memos it reads while it runs
// ("dependency tracking"). When a signal changes, mark what depends on it as stale, then
// re-run stale effects. Memos should recompute lazily, only when read.

/**
 * @template T
 * @param {T} initialValue
 * @return {[() => T, (next: T | ((prev: T) => T)) => void]}
 */
export default function createSignal(initialValue) {
  throw 'Not implemented!';
}

/**
 * @template T
 * @param {() => T} fn
 * @return {() => T}
 */
export function createMemo(fn) {
  throw 'Not implemented!';
}

/**
 * @param {() => void | (() => void)} fn
 * @return {() => void} dispose
 */
export function createEffect(fn) {
  throw 'Not implemented!';
}

/**
 * @template T
 * @param {() => T} fn
 * @return {T}
 */
export function batch(fn) {
  throw 'Not implemented!';
}

/**
 * @template T
 * @param {() => T} fn
 * @return {T}
 */
export function untrack(fn) {
  throw 'Not implemented!';
}
