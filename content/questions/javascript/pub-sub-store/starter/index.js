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
  throw 'Not implemented!';
}
