import createStore from './index';

function counter(state = { count: 0 }, action) {
  switch (action.type) {
    case 'inc':
      return { count: state.count + (action.by ?? 1) };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

describe('createStore', () => {
  test('initialises state from the reducer default', () => {
    const store = createStore(counter);
    expect(store.getState()).toEqual({ count: 0 });
  });

  test('uses preloadedState when given', () => {
    const store = createStore(counter, { count: 10 });
    expect(store.getState()).toEqual({ count: 10 });
  });

  test('dispatch runs the reducer and returns the action', () => {
    const store = createStore(counter);
    const action = { type: 'inc', by: 3 };
    expect(store.dispatch(action)).toBe(action);
    expect(store.getState()).toEqual({ count: 3 });
  });

  test('passes the current state and the action to the reducer', () => {
    const reducer = jest.fn((state = 'init', action) => (action.type === 'set' ? action.value : state));
    const store = createStore(reducer);
    store.dispatch({ type: 'set', value: 'next' });
    expect(reducer).toHaveBeenLastCalledWith('init', { type: 'set', value: 'next' });
    expect(store.getState()).toBe('next');
  });

  test('notifies subscribers after each dispatch with the new state available', () => {
    const store = createStore(counter);
    const seen = [];
    store.subscribe(() => seen.push(store.getState().count));
    store.dispatch({ type: 'inc' });
    store.dispatch({ type: 'unknown' });
    expect(seen).toEqual([1, 1]);
  });

  test('does not notify subscribers on creation', () => {
    const store = createStore(counter);
    const listener = jest.fn();
    store.subscribe(listener);
    expect(listener).not.toHaveBeenCalled();
  });

  test('unsubscribe stops notifications and is idempotent', () => {
    const store = createStore(counter);
    const listener = jest.fn();
    const other = jest.fn();
    const unsubscribe = store.subscribe(listener);
    store.subscribe(other);
    unsubscribe();
    unsubscribe();
    store.dispatch({ type: 'inc' });
    expect(listener).not.toHaveBeenCalled();
    expect(other).toHaveBeenCalledTimes(1);
  });

  test('the same function subscribed twice is called twice and removed one at a time', () => {
    const store = createStore(counter);
    const listener = jest.fn();
    const un1 = store.subscribe(listener);
    store.subscribe(listener);
    store.dispatch({ type: 'inc' });
    expect(listener).toHaveBeenCalledTimes(2);
    un1();
    store.dispatch({ type: 'inc' });
    expect(listener).toHaveBeenCalledTimes(3);
  });

  test('unsubscribing during notification does not skip other listeners', () => {
    const store = createStore(counter);
    const calls = [];
    const un = store.subscribe(() => {
      calls.push('a');
      un();
    });
    store.subscribe(() => calls.push('b'));
    store.dispatch({ type: 'inc' });
    expect(calls).toEqual(['a', 'b']);
  });

  test('a listener subscribed during notification runs from the next dispatch', () => {
    const store = createStore(counter);
    const late = jest.fn();
    let added = false;
    store.subscribe(() => {
      if (!added) {
        added = true;
        store.subscribe(late);
      }
    });
    store.dispatch({ type: 'inc' });
    expect(late).not.toHaveBeenCalled();
    store.dispatch({ type: 'inc' });
    expect(late).toHaveBeenCalledTimes(1);
  });

  test('rejects actions that are not plain objects or have no type', () => {
    const store = createStore(counter);
    expect(() => store.dispatch(() => {})).toThrow(TypeError);
    expect(() => store.dispatch('inc')).toThrow(TypeError);
    expect(() => store.dispatch(new (class Action {})())).toThrow(TypeError);
    expect(() => store.dispatch({ payload: 1 })).toThrow(TypeError);
  });

  test('throws when a reducer dispatches, and recovers afterwards', () => {
    let store;
    const reducer = (state = 0, action) => {
      if (action.type === 'bad') store.dispatch({ type: 'nested' });
      return action.type === 'ok' ? state + 1 : state;
    };
    store = createStore(reducer);
    expect(() => store.dispatch({ type: 'bad' })).toThrow();
    store.dispatch({ type: 'ok' });
    expect(store.getState()).toBe(1);
  });
});
