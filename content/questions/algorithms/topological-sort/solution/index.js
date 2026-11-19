/**
 * Returns the modules in an order where every module comes after the modules it imports.
 * Throws an Error if there is a circular import.
 * @param {Record<string, string[]>} imports
 * @return {string[]}
 */
export default function topologicalSort(imports) {
  const pending = new Map(); // module -> number of imports not yet emitted
  const dependents = new Map(); // module -> modules that import it

  const ensure = (name) => {
    if (!pending.has(name)) {
      pending.set(name, 0);
      dependents.set(name, []);
    }
  };

  for (const [mod, deps] of Object.entries(imports)) {
    ensure(mod);
    for (const dep of new Set(deps)) {
      ensure(dep);
      pending.set(mod, pending.get(mod) + 1);
      dependents.get(dep).push(mod);
    }
  }

  const queue = [];
  for (const [mod, count] of pending) {
    if (count === 0) queue.push(mod);
  }

  const order = [];
  for (let head = 0; head < queue.length; head++) {
    const mod = queue[head];
    order.push(mod);
    for (const dependent of dependents.get(mod)) {
      const left = pending.get(dependent) - 1;
      pending.set(dependent, left);
      if (left === 0) queue.push(dependent);
    }
  }

  if (order.length !== pending.size) {
    throw new Error('Circular import detected');
  }
  return order;
}
