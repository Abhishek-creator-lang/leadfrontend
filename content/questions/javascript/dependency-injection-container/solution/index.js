/**
 * @typedef {'transient' | 'singleton' | 'scoped'} Lifetime
 * @typedef {{ resolve: (token: any) => any }} Resolver
 */

function tokenName(token) {
  if (typeof token === 'function') return token.name || 'anonymous';
  return String(token);
}

export default class Container {
  /**
   * @param {Container | null} [parent]
   */
  constructor(parent = null) {
    this.parent = parent;
    /** @type {Map<any, { factory: Function, lifetime: Lifetime }>} */
    this.providers = new Map();
    /** @type {Map<object, any>} cached instances, keyed by provider */
    this.instances = new Map();
  }

  /**
   * @param {any} token
   * @param {(c: Resolver) => any} factory
   * @param {{ lifetime?: Lifetime }} [options]
   * @return {Container}
   */
  register(token, factory, options = {}) {
    const { lifetime = 'transient' } = options;
    this.providers.set(token, { factory, lifetime });
    return this;
  }

  /**
   * @param {any} token
   * @param {any} value
   * @return {Container}
   */
  registerValue(token, value) {
    return this.register(token, () => value, { lifetime: 'singleton' });
  }

  /** @param {any} token */
  resolve(token) {
    return this._resolve(token, []);
  }

  /** @param {any} token */
  has(token) {
    return this._find(token) !== null;
  }

  /** @return {Container} */
  createScope() {
    return new Container(this);
  }

  _find(token) {
    for (let container = this; container; container = container.parent) {
      const provider = container.providers.get(token);
      if (provider) return { provider, owner: container };
    }
    return null;
  }

  _resolve(token, path) {
    if (path.includes(token)) {
      const cycle = [...path.slice(path.indexOf(token)), token].map(tokenName).join(' -> ');
      throw new Error(`Circular dependency: ${cycle}`);
    }

    const found = this._find(token);
    if (!found) throw new Error(`No provider for ${tokenName(token)}`);
    const { provider, owner } = found;

    const cacheHost = provider.lifetime === 'singleton' ? owner : provider.lifetime === 'scoped' ? this : null;
    if (cacheHost && cacheHost.instances.has(provider)) {
      return cacheHost.instances.get(provider);
    }

    // Singletons resolve their dependencies from the container that owns them,
    // so they can never capture a shorter-lived scope's services.
    const resolveFrom = provider.lifetime === 'singleton' ? owner : this;
    const nextPath = [...path, token];
    const resolver = { resolve: (dep) => resolveFrom._resolve(dep, nextPath) };

    const instance = provider.factory(resolver);
    if (cacheHost) cacheHost.instances.set(provider, instance);
    return instance;
  }
}
