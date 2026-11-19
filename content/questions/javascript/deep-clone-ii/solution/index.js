/**
 * Deep clones values including cycles, shared references, Date, RegExp, Map, Set,
 * symbol keys and custom prototypes.
 * @template T
 * @param {T} value
 * @return {T}
 */
export default function deepClone(value) {
  // source object -> its clone. WeakMap so the cache never keeps sources alive.
  const seen = new WeakMap();

  function clone(input) {
    if (input === null || typeof input !== 'object') {
      return input; // primitives and functions
    }
    if (seen.has(input)) {
      return seen.get(input);
    }

    if (input instanceof Date) {
      const copy = new Date(input.getTime());
      seen.set(input, copy);
      return copy;
    }

    if (input instanceof RegExp) {
      const copy = new RegExp(input.source, input.flags);
      copy.lastIndex = input.lastIndex;
      seen.set(input, copy);
      return copy;
    }

    if (input instanceof Map) {
      const copy = new Map();
      seen.set(input, copy); // register before recursing so cycles resolve
      input.forEach((val, key) => {
        copy.set(clone(key), clone(val));
      });
      return copy;
    }

    if (input instanceof Set) {
      const copy = new Set();
      seen.set(input, copy);
      input.forEach((val) => {
        copy.add(clone(val));
      });
      return copy;
    }

    const copy = Array.isArray(input)
      ? new Array(input.length)
      : Object.create(Object.getPrototypeOf(input));
    seen.set(input, copy);

    const keys = [
      ...Object.keys(input),
      ...Object.getOwnPropertySymbols(input).filter((sym) =>
        Object.prototype.propertyIsEnumerable.call(input, sym)
      ),
    ];
    for (const key of keys) {
      copy[key] = clone(input[key]);
    }
    return copy;
  }

  return clone(value);
}
