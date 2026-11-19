/**
 * @typedef {(context: any, next: () => Promise<void>) => any} Middleware
 */

/**
 * @param {Middleware[]} middlewares
 * @return {(context: any, next?: () => any) => Promise<void>}
 */
export default function compose(middlewares) {
  throw 'Not implemented!';
}
