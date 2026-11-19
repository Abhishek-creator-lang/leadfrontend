function createNode() {
  return { children: new Map(), hasValue: false, value: undefined };
}

/**
 * @param {Function} func
 * @return {Function & { clear: () => void }}
 */
export default function memoize(func) {
  let root = createNode();

  function memoized(...args) {
    let node = root;
    for (const arg of args) {
      let child = node.children.get(arg);
      if (!child) {
        child = createNode();
        node.children.set(arg, child);
      }
      node = child;
    }

    if (node.hasValue) return node.value;

    const result = func.apply(this, args);
    node.value = result;
    node.hasValue = true;
    return result;
  }

  memoized.clear = function () {
    root = createNode();
  };

  return memoized;
}
