/**
 * @param {number} [initial=0]
 * @param {number} [step=1]
 * @return {(() => number) & { reset: () => void }}
 */
export default function makeCounter(initial = 0, step = 1) {
  let next = initial;

  function counter() {
    const current = next;
    next += step;
    return current;
  }

  counter.reset = function () {
    next = initial;
  };

  return counter;
}
