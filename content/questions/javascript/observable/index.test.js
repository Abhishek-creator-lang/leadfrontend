import Observable, { map, filter } from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function collect(observable) {
  const events = [];
  const sub = observable.subscribe({
    next: (v) => events.push(['next', v]),
    error: (e) => events.push(['error', e instanceof Error ? e.message : e]),
    complete: () => events.push(['complete']),
  });
  return { events, sub };
}

describe('Observable', () => {
  test('is lazy: the producer runs only on subscribe', () => {
    const producer = jest.fn();
    const obs = new Observable(producer);
    expect(producer).not.toHaveBeenCalled();
    obs.subscribe(() => {});
    expect(producer).toHaveBeenCalledTimes(1);
  });

  test('delivers next and complete to the observer', () => {
    const obs = new Observable((o) => {
      o.next(1);
      o.next(2);
      o.complete();
    });
    expect(collect(obs).events).toEqual([['next', 1], ['next', 2], ['complete']]);
  });

  test('accepts a plain function as the next handler', () => {
    const values = [];
    Observable.of('a', 'b').subscribe((v) => values.push(v));
    expect(values).toEqual(['a', 'b']);
  });

  test('ignores everything after complete or error', () => {
    const obs = new Observable((o) => {
      o.next(1);
      o.error(new Error('bad'));
      o.next(2);
      o.complete();
      o.error(new Error('again'));
    });
    expect(collect(obs).events).toEqual([['next', 1], ['error', 'bad']]);
  });

  test('a throwing producer delivers the error', () => {
    const obs = new Observable(() => {
      throw new Error('producer threw');
    });
    expect(collect(obs).events).toEqual([['error', 'producer threw']]);
  });

  test('each subscription runs the producer independently (cold)', () => {
    let runs = 0;
    const obs = new Observable((o) => {
      runs += 1;
      o.next(runs);
      o.complete();
    });
    expect(collect(obs).events[0]).toEqual(['next', 1]);
    expect(collect(obs).events[0]).toEqual(['next', 2]);
  });

  test('unsubscribe runs the teardown once and stops delivery', async () => {
    const teardown = jest.fn();
    const obs = new Observable((o) => {
      let n = 0;
      const id = setInterval(() => o.next(n++), 5);
      return () => {
        clearInterval(id);
        teardown();
      };
    });
    const { events, sub } = collect(obs);
    await sleep(30);
    sub.unsubscribe();
    sub.unsubscribe();
    const count = events.length;
    expect(count).toBeGreaterThan(0);
    expect(sub.closed).toBe(true);
    await sleep(30);
    expect(events.length).toBe(count);
    expect(teardown).toHaveBeenCalledTimes(1);
  });

  test('teardown runs after complete, even if complete happened synchronously', () => {
    const teardown = jest.fn();
    const obs = new Observable((o) => {
      o.complete();
      return teardown;
    });
    const { sub } = collect(obs);
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(sub.closed).toBe(true);
    sub.unsubscribe();
    expect(teardown).toHaveBeenCalledTimes(1);
  });

  test('teardown runs after an asynchronous error', async () => {
    const teardown = jest.fn();
    const obs = new Observable((o) => {
      setTimeout(() => o.error(new Error('late')), 5);
      return teardown;
    });
    const { events } = collect(obs);
    await sleep(30);
    expect(events).toEqual([['error', 'late']]);
    expect(teardown).toHaveBeenCalledTimes(1);
  });

  test('Observable.from emits an iterable then completes', () => {
    expect(collect(Observable.from(new Set([1, 2]))).events).toEqual([['next', 1], ['next', 2], ['complete']]);
  });

  test('pipe with map and filter transforms values', () => {
    const obs = Observable.of(1, 2, 3, 4, 5).pipe(
      filter((n) => n % 2 === 1),
      map((n, i) => `${i}:${n * 10}`)
    );
    expect(collect(obs).events).toEqual([['next', '0:10'], ['next', '1:30'], ['next', '2:50'], ['complete']]);
  });

  test('pipe() with no operators returns the same observable', () => {
    const obs = Observable.of(1);
    expect(obs.pipe()).toBe(obs);
  });

  test('errors thrown in operator callbacks go to error', () => {
    const obs = Observable.of(1, 2, 3).pipe(
      map((n) => {
        if (n === 2) throw new Error('map failed');
        return n;
      })
    );
    expect(collect(obs).events).toEqual([['next', 1], ['error', 'map failed']]);
  });

  test('unsubscribing a piped observable tears down the source', async () => {
    const teardown = jest.fn();
    const source = new Observable((o) => {
      const id = setInterval(() => o.next(1), 5);
      return () => {
        clearInterval(id);
        teardown();
      };
    });
    const sub = source.pipe(map((x) => x)).subscribe(() => {});
    await sleep(20);
    sub.unsubscribe();
    expect(teardown).toHaveBeenCalledTimes(1);
  });

  test('errors without an error handler do not throw', () => {
    const obs = new Observable((o) => o.error(new Error('ignored')));
    expect(() => obs.subscribe({ next: () => {} })).not.toThrow();
  });
});
