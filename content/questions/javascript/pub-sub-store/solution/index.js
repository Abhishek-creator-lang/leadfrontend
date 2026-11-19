function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * @template S
 * @param {(state: S | undefined, action: { type: string, [key: string]: any }) => S} reducer
 * @param {S} [preloadedState]
 * @return {{
 *   getState: () => S,
 *   dispatch: (action: { type: string, [key: string]: any }) => object,
 *   subscribe: (listener: () => void) => () => void,
 * }}
 */
export default function createStore(reducer, preloadedState) {
  let state = preloadedState;
  const listeners = [];
  let isDispatching = false;

  function getState() {
    return state;
  }

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new TypeError('Actions must be plain objects.');
    }
    if (action.type === undefined) {
      throw new TypeError('Actions must have a "type" property.');
    }
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }

    // Snapshot: subscribe/unsubscribe during notification applies to the next dispatch.
    for (const listener of [...listeners]) {
      listener();
    }
    return action;
  }

  function subscribe(listener) {
    let isSubscribed = true;
    listeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) return;
      isSubscribed = false;
      const index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    };
  }

  dispatch({ type: '@@store/INIT' });

  return { getState, dispatch, subscribe };
}
