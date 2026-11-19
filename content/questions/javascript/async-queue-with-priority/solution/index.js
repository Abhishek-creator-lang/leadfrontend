/** True if entry `a` should start before entry `b`. */
function higher(a, b) {
  return a.priority !== b.priority ? a.priority > b.priority : a.seq < b.seq;
}

class Heap {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  push(entry) {
    const items = this.items;
    items.push(entry);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!higher(items[i], items[parent])) break;
      [items[i], items[parent]] = [items[parent], items[i]];
      i = parent;
    }
  }

  pop() {
    const items = this.items;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = left + 1;
        let best = i;
        if (left < items.length && higher(items[left], items[best])) best = left;
        if (right < items.length && higher(items[right], items[best])) best = right;
        if (best === i) break;
        [items[i], items[best]] = [items[best], items[i]];
        i = best;
      }
    }
    return top;
  }
}

/**
 * @param {number} concurrency Maximum number of tasks running at once.
 * @return {{
 *   add: <T>(task: () => T | Promise<T>, priority?: number) => Promise<T>,
 *   readonly size: number,
 *   readonly running: number,
 * }}
 */
export default function createPriorityQueue(concurrency) {
  const heap = new Heap();
  let running = 0;
  let seq = 0;

  function start({ task, resolve, reject }) {
    running += 1;
    let result;
    try {
      result = Promise.resolve(task());
    } catch (error) {
      result = Promise.reject(error);
    }
    // Free the slot before settling the caller's promise so `running` is
    // already accurate when the caller observes the result.
    result.then(
      (value) => {
        running -= 1;
        drain();
        resolve(value);
      },
      (error) => {
        running -= 1;
        drain();
        reject(error);
      }
    );
  }

  function drain() {
    while (running < concurrency && heap.size > 0) {
      start(heap.pop());
    }
  }

  return {
    add(task, priority = 0) {
      return new Promise((resolve, reject) => {
        heap.push({ task, priority, seq: seq++, resolve, reject });
        drain();
      });
    },
    get size() {
      return heap.size;
    },
    get running() {
      return running;
    },
  };
}
