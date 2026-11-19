import Container from './index';

describe('Container', () => {
  test('resolves registered values', () => {
    const c = new Container();
    expect(c.registerValue('config', { url: '/api' })).toBe(c);
    expect(c.resolve('config')).toEqual({ url: '/api' });
  });

  test('transient is the default lifetime: a new instance every time', () => {
    const c = new Container();
    c.register('thing', () => ({}));
    expect(c.resolve('thing')).not.toBe(c.resolve('thing'));
  });

  test('singletons are built once, lazily', () => {
    const c = new Container();
    const factory = jest.fn(() => ({ id: Math.random() }));
    c.register('db', factory, { lifetime: 'singleton' });
    expect(factory).not.toHaveBeenCalled();
    expect(c.resolve('db')).toBe(c.resolve('db'));
    expect(factory).toHaveBeenCalledTimes(1);
  });

  test('factories resolve their own dependencies', () => {
    class Http {
      constructor(config) {
        this.config = config;
      }
    }
    class UserApi {
      constructor(http) {
        this.http = http;
      }
    }
    const c = new Container();
    c.registerValue('config', { baseUrl: 'x' });
    c.register(Http, (r) => new Http(r.resolve('config')), { lifetime: 'singleton' });
    c.register(UserApi, (r) => new UserApi(r.resolve(Http)));
    const a = c.resolve(UserApi);
    const b = c.resolve(UserApi);
    expect(a).not.toBe(b);
    expect(a.http).toBe(b.http);
    expect(a.http.config.baseUrl).toBe('x');
  });

  test('symbol tokens work and do not collide with strings', () => {
    const TOKEN = Symbol('logger');
    const c = new Container();
    c.registerValue(TOKEN, 'symbol');
    c.registerValue('logger', 'string');
    expect(c.resolve(TOKEN)).toBe('symbol');
    expect(c.resolve('logger')).toBe('string');
  });

  test('scoped services are shared within a scope but not across scopes', () => {
    const c = new Container();
    c.register('session', () => ({}), { lifetime: 'scoped' });
    const s1 = c.createScope();
    const s2 = c.createScope();
    expect(s1.resolve('session')).toBe(s1.resolve('session'));
    expect(s1.resolve('session')).not.toBe(s2.resolve('session'));
  });

  test('singletons are shared across child scopes', () => {
    const c = new Container();
    c.register('cache', () => new Map(), { lifetime: 'singleton' });
    expect(c.createScope().resolve('cache')).toBe(c.createScope().resolve('cache'));
    expect(c.createScope().resolve('cache')).toBe(c.resolve('cache'));
  });

  test('child scopes can override registrations without affecting the parent', () => {
    const c = new Container();
    c.registerValue('http', 'real');
    c.register('api', (r) => `api using ${r.resolve('http')}`);
    const test = c.createScope();
    test.registerValue('http', 'fake');
    expect(test.resolve('api')).toBe('api using fake');
    expect(c.resolve('api')).toBe('api using real');
  });

  test('a singleton resolves its dependencies from its owner, not the requesting scope', () => {
    const c = new Container();
    c.register('user', () => 'anonymous', { lifetime: 'scoped' });
    c.register('service', (r) => ({ user: r.resolve('user') }), { lifetime: 'singleton' });
    const request = c.createScope();
    request.registerValue('user', 'alice');
    expect(request.resolve('service').user).toBe('anonymous');
  });

  test('has() checks the scope chain', () => {
    const c = new Container();
    c.registerValue('a', 1);
    const child = c.createScope();
    child.registerValue('b', 2);
    expect(child.has('a')).toBe(true);
    expect(child.has('b')).toBe(true);
    expect(c.has('b')).toBe(false);
  });

  test('throws a helpful error for unknown tokens', () => {
    class MissingService {}
    const c = new Container();
    expect(() => c.resolve('nope')).toThrow(/nope/);
    expect(() => c.resolve(MissingService)).toThrow(/MissingService/);
  });

  test('detects circular dependencies and reports the path', () => {
    const c = new Container();
    c.register('A', (r) => r.resolve('B'));
    c.register('B', (r) => r.resolve('C'));
    c.register('C', (r) => r.resolve('A'));
    expect(() => c.resolve('A')).toThrow('Circular dependency: A -> B -> C -> A');
    c.register('self', (r) => r.resolve('self'));
    expect(() => c.resolve('self')).toThrow('self -> self');
  });

  test('diamond dependencies are not mistaken for cycles', () => {
    const c = new Container();
    c.register('base', () => ({}), { lifetime: 'singleton' });
    c.register('left', (r) => ({ base: r.resolve('base') }));
    c.register('right', (r) => ({ base: r.resolve('base') }));
    c.register('top', (r) => [r.resolve('left'), r.resolve('right')]);
    const [left, right] = c.resolve('top');
    expect(left.base).toBe(right.base);
  });

  test('failed factories are not cached', () => {
    const c = new Container();
    let attempts = 0;
    c.register(
      'flaky',
      () => {
        attempts += 1;
        if (attempts === 1) throw new Error('not ready');
        return 'ok';
      },
      { lifetime: 'singleton' }
    );
    expect(() => c.resolve('flaky')).toThrow('not ready');
    expect(c.resolve('flaky')).toBe('ok');
    expect(c.resolve('flaky')).toBe('ok');
    expect(attempts).toBe(2);
  });
});
