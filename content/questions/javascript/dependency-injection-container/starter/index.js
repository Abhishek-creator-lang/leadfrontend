/**
 * @typedef {'transient' | 'singleton' | 'scoped'} Lifetime
 * @typedef {{ resolve: (token: any) => any }} Resolver
 */

export default class Container {
  /**
   * @param {Container | null} [parent]
   */
  constructor(parent = null) {
    this.parent = parent;
  }

  /**
   * @param {any} token
   * @param {(c: Resolver) => any} factory
   * @param {{ lifetime?: Lifetime }} [options]
   * @return {Container}
   */
  register(token, factory, options = {}) {
    throw 'Not implemented!';
  }

  /**
   * @param {any} token
   * @param {any} value
   * @return {Container}
   */
  registerValue(token, value) {
    throw 'Not implemented!';
  }

  /** @param {any} token */
  resolve(token) {
    throw 'Not implemented!';
  }

  /** @param {any} token */
  has(token) {
    throw 'Not implemented!';
  }

  /** @return {Container} */
  createScope() {
    throw 'Not implemented!';
  }
}
