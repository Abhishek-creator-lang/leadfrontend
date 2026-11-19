/**
 * @param {Function} func
 * @param {number} [wait=0]
 * @return {Function & { cancel: () => void, flush: () => void }}
 */
export default function debounce(func, wait = 0) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;

  function invoke() {
    const args = lastArgs;
    const context = lastThis;
    timeoutId = null;
    lastArgs = lastThis = null;
    func.apply(context, args);
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(invoke, wait);
  }

  debounced.cancel = function () {
    clearTimeout(timeoutId);
    timeoutId = null;
    lastArgs = lastThis = null;
  };

  debounced.flush = function () {
    if (timeoutId === null) return;
    clearTimeout(timeoutId);
    invoke();
  };

  return debounced;
}
