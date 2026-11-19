// Node states for push-pull ("mark, then pull") propagation.
const CLEAN = 0; // value is up to date
const CHECK = 1; // an upstream memo *might* have changed; verify before using
const DIRTY = 2; // a direct dependency changed; must recompute

let currentObserver = null; // the memo or effect currently running (dependency tracking)
let batchDepth = 0;
let flushing = false;
const queue = []; // effects waiting to be re-validated

function track(source) {
  if (currentObserver) {
    currentObserver.sources.add(source);
    source.observers.add(currentObserver);
  }
}

function mark(node, state) {
  if (node.state >= state) return;
  const wasClean = node.state === CLEAN;
  node.state = state;
  if (node.kind === 'effect') {
    if (wasClean) queue.push(node);
  } else {
    // A memo that may change makes everything downstream "maybe stale".
    for (const observer of node.observers) mark(observer, CHECK);
  }
}

function run(node) {
  // Forget old dependencies; they are re-collected while fn runs (dynamic tracking).
  for (const source of node.sources) source.observers.delete(node);
  node.sources.clear();

  const previous = currentObserver;
  currentObserver = node;
  try {
    if (node.kind === 'memo') {
      const next = node.fn();
      if (node.initialized && Object.is(next, node.value)) return;
      node.value = next;
      node.initialized = true;
      for (const observer of [...node.observers]) mark(observer, DIRTY);
    } else {
      if (typeof node.cleanup === 'function') node.cleanup();
      const result = node.fn();
      node.cleanup = typeof result === 'function' ? result : null;
    }
  } finally {
    currentObserver = previous;
  }
}

function updateIfNecessary(node) {
  if (node.state === CHECK) {
    for (const source of [...node.sources]) {
      if (source.kind === 'memo') {
        updateIfNecessary(source);
        if (node.state === DIRTY) break;
      }
    }
  }
  if (node.state === DIRTY) run(node);
  node.state = CLEAN;
}

function flush() {
  if (batchDepth > 0 || flushing) return;
  flushing = true;
  try {
    while (queue.length > 0) {
      const effect = queue.shift();
      if (!effect.disposed) updateIfNecessary(effect);
    }
  } finally {
    flushing = false;
  }
}

/**
 * @template T
 * @param {T} initialValue
 * @return {[() => T, (next: T | ((prev: T) => T)) => void]}
 */
export default function createSignal(initialValue) {
  const signal = { kind: 'signal', value: initialValue, observers: new Set() };

  function read() {
    track(signal);
    return signal.value;
  }

  function write(next) {
    const value = typeof next === 'function' ? next(signal.value) : next;
    if (Object.is(value, signal.value)) return;
    signal.value = value;
    for (const observer of [...signal.observers]) mark(observer, DIRTY);
    flush();
  }

  return [read, write];
}

/**
 * @template T
 * @param {() => T} fn
 * @return {() => T}
 */
export function createMemo(fn) {
  const memo = {
    kind: 'memo',
    fn,
    value: undefined,
    initialized: false,
    state: DIRTY, // computed lazily on first read
    sources: new Set(),
    observers: new Set(),
  };

  return function read() {
    track(memo);
    updateIfNecessary(memo);
    return memo.value;
  };
}

/**
 * @param {() => void | (() => void)} fn
 * @return {() => void} dispose
 */
export function createEffect(fn) {
  const effect = {
    kind: 'effect',
    fn,
    cleanup: null,
    disposed: false,
    state: DIRTY,
    sources: new Set(),
  };

  updateIfNecessary(effect);

  return function dispose() {
    if (effect.disposed) return;
    effect.disposed = true;
    if (typeof effect.cleanup === 'function') effect.cleanup();
    for (const source of effect.sources) source.observers.delete(effect);
    effect.sources.clear();
  };
}

/**
 * Runs fn, deferring effects until the outermost batch finishes.
 * @template T
 * @param {() => T} fn
 * @return {T}
 */
export function batch(fn) {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    flush();
  }
}

/**
 * Runs fn without tracking any signals it reads.
 * @template T
 * @param {() => T} fn
 * @return {T}
 */
export function untrack(fn) {
  const previous = currentObserver;
  currentObserver = null;
  try {
    return fn();
  } finally {
    currentObserver = previous;
  }
}

