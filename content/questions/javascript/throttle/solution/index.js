/**
 * @param {Function} func
 * @param {number} [wait=0]
 * @return {Function & { cancel: () => void }}
 */
export default function throttle(func, wait = 0) {
  let timerId = null;
  let pendingArgs = null;
  let pendingThis = null;

  function startWindow() {
    timerId = setTimeout(() => {
      if (pendingArgs !== null) {
        const args = pendingArgs;
        const context = pendingThis;
        pendingArgs = pendingThis = null;
        // Open the next window before running, so the trailing call is also rate-limited.
        startWindow();
        func.apply(context, args);
      } else {
        timerId = null;
      }
    }, wait);
  }

  function throttled(...args) {
    if (timerId === null) {
      startWindow();
      func.apply(this, args);
    } else {
      pendingArgs = args;
      pendingThis = this;
    }
  }

  throttled.cancel = function () {
    clearTimeout(timerId);
    timerId = null;
    pendingArgs = pendingThis = null;
  };

  return throttled;
}
