/**
 * @param {Function} func
 * @param {number} [wait=0]
 * @param {{ leading?: boolean, trailing?: boolean, maxWait?: number }} [options]
 * @return {Function & { cancel: () => void, flush: () => any }}
 */
export default function debounce(func, wait = 0, options = {}) {
  const leading = Boolean(options.leading);
  const trailing = options.trailing === undefined ? true : Boolean(options.trailing);
  const maxWait = options.maxWait === undefined ? null : Math.max(Number(options.maxWait) || 0, wait);

  let waitTimer = null; // null means idle (no burst in progress)
  let maxTimer = null;
  let pendingArgs = null; // latest call that has not been invoked yet
  let pendingThis = null;
  let result;

  function invoke() {
    const args = pendingArgs;
    const context = pendingThis;
    pendingArgs = pendingThis = null; // consume the pending call
    result = func.apply(context, args);
    return result;
  }

  function endBurst() {
    clearTimeout(waitTimer);
    clearTimeout(maxTimer);
    waitTimer = maxTimer = null;
  }

  function onWaitEnd() {
    const shouldInvoke = trailing && pendingArgs !== null;
    endBurst();
    if (shouldInvoke) {
      invoke();
    } else {
      pendingArgs = pendingThis = null;
    }
  }

  function onMaxWait() {
    maxTimer = setTimeout(onMaxWait, maxWait); // the burst is still going
    if (pendingArgs !== null) invoke();
  }

  function debounced(...args) {
    const startsBurst = waitTimer === null;
    pendingArgs = args;
    pendingThis = this;

    clearTimeout(waitTimer);
    waitTimer = setTimeout(onWaitEnd, wait);

    if (startsBurst) {
      if (maxWait !== null) maxTimer = setTimeout(onMaxWait, maxWait);
      if (leading) invoke();
    }
    return result;
  }

  debounced.cancel = function () {
    endBurst();
    pendingArgs = pendingThis = null;
  };

  debounced.flush = function () {
    if (waitTimer !== null) onWaitEnd();
    return result;
  };

  return debounced;
}
