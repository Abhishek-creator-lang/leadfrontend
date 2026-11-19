/**
 * Iterative flatten: an explicit stack of "cursors" replaces the call stack,
 * so very deep nesting can't overflow it. Order is preserved without reversing.
 *
 * @param {Array<*>} array
 * @param {number} [depth=Infinity]
 * @return {Array<*>}
 */
export default function flatten(array, depth = Infinity) {
  const result = [];
  const stack = [{ items: array, index: 0, depthLeft: depth }];

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    if (frame.index >= frame.items.length) {
      stack.pop();
      continue;
    }

    const i = frame.index++;
    if (!(i in frame.items)) continue; // skip holes

    const item = frame.items[i];
    if (Array.isArray(item) && frame.depthLeft > 0) {
      stack.push({ items: item, index: 0, depthLeft: frame.depthLeft - 1 });
    } else {
      result.push(item);
    }
  }

  return result;
}

/**
 * Recursive version, for comparison. Simple, but limited by the call stack.
 * @param {Array<*>} array
 * @param {number} [depth=Infinity]
 * @return {Array<*>}
 */
export function flattenRecursive(array, depth = Infinity) {
  const result = [];
  array.forEach((item) => {
    // forEach skips holes, like Array.prototype.flat
    if (Array.isArray(item) && depth > 0) {
      result.push(...flattenRecursive(item, depth - 1));
    } else {
      result.push(item);
    }
  });
  return result;
}
