import patch, { h, mount } from './index';

function setup(vnode) {
  const container = document.createElement('div');
  mount(vnode, container);
  return container;
}

const list = (keys, textFor = (k) => k.toUpperCase()) =>
  h(
    'ul',
    null,
    keys.map((k) => h('li', { key: k }, textFor(k)))
  );

describe('h and mount', () => {
  test('h normalises children into text vnodes', () => {
    const vnode = h('p', { key: 'k' }, 'a', [1, [null, false]], h('b', null));
    expect(vnode.key).toBe('k');
    expect(vnode.children.map((c) => c.type)).toEqual(['#text', '#text', 'b']);
    expect(vnode.children[1].text).toBe('1');
  });

  test('mount creates DOM and records el on every vnode', () => {
    const vnode = h('div', { className: 'box', id: 'x' }, h('span', null, 'hi'));
    const container = setup(vnode);
    expect(container.innerHTML).toBe('<div class="box" id="x"><span>hi</span></div>');
    expect(vnode.el).toBe(container.firstChild);
    expect(vnode.children[0].el).toBe(container.querySelector('span'));
    expect(vnode.children[0].children[0].el.nodeType).toBe(Node.TEXT_NODE);
  });
});

describe('patch', () => {
  test('updates text in place', () => {
    const prev = h('p', null, 'old');
    const container = setup(prev);
    const textNode = container.querySelector('p').firstChild;
    const next = h('p', null, 'new');
    patch(prev, next);
    expect(container.innerHTML).toBe('<p>new</p>');
    expect(container.querySelector('p').firstChild).toBe(textNode);
    expect(next.el).toBe(prev.el);
  });

  test('adds, changes and removes attributes', () => {
    const prev = h('a', { href: '/a', title: 'T', className: 'x', hidden: true });
    const container = setup(prev);
    patch(prev, h('a', { href: '/b', className: 'y', 'data-new': 1, hidden: false }));
    const a = container.firstChild;
    expect(a.getAttribute('href')).toBe('/b');
    expect(a.getAttribute('class')).toBe('y');
    expect(a.getAttribute('data-new')).toBe('1');
    expect(a.hasAttribute('title')).toBe(false);
    expect(a.hasAttribute('hidden')).toBe(false);
    expect(a.hasAttribute('key')).toBe(false);
  });

  test('replaces the node when the type changes', () => {
    const prev = h('div', null, h('span', null, 'x'));
    const container = setup(prev);
    const next = h('div', null, h('em', null, 'x'));
    patch(prev, next);
    expect(container.innerHTML).toBe('<div><em>x</em></div>');
    expect(next.children[0].el.tagName).toBe('EM');
  });

  test('swaps and removes event listeners', () => {
    const first = jest.fn();
    const second = jest.fn();
    const v1 = h('button', { onClick: first });
    const container = setup(v1);
    const btn = container.firstChild;
    const v2 = h('button', { onClick: second });
    patch(v1, v2);
    btn.click();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    patch(v2, h('button', null));
    btn.click();
    expect(second).toHaveBeenCalledTimes(1);
  });

  test('sets value as a property', () => {
    const v1 = h('input', { value: 'a' });
    const container = setup(v1);
    patch(v1, h('input', { value: 'b' }));
    expect(container.firstChild.value).toBe('b');
  });

  test('reorders keyed children by moving existing nodes', () => {
    const prev = list(['a', 'b', 'c', 'd']);
    const container = setup(prev);
    const before = Object.fromEntries(Array.from(container.querySelectorAll('li')).map((li) => [li.textContent, li]));
    patch(prev, list(['d', 'b', 'a', 'c']));
    const items = Array.from(container.querySelectorAll('li'));
    expect(items.map((li) => li.textContent)).toEqual(['D', 'B', 'A', 'C']);
    expect(items[0]).toBe(before.D);
    expect(items[1]).toBe(before.B);
    expect(items[2]).toBe(before.A);
    expect(items[3]).toBe(before.C);
  });

  test('inserts, removes and updates keyed children together', () => {
    const prev = list(['a', 'b', 'c']);
    const container = setup(prev);
    const liB = container.querySelectorAll('li')[1];
    const next = list(['c', 'b', 'd'], (k) => (k === 'b' ? 'Banana!' : k.toUpperCase()));
    patch(prev, next);
    expect(container.innerHTML).toBe('<ul><li>C</li><li>Banana!</li><li>D</li></ul>');
    expect(container.querySelectorAll('li')[1]).toBe(liB);
  });

  test('keeps DOM state (like focus-able inputs) with their key after deleting the first item', () => {
    const row = (k) => h('li', { key: k }, h('input', { 'data-k': k }));
    const prev = h('ul', null, ['x', 'y', 'z'].map(row));
    const container = setup(prev);
    const inputY = container.querySelector('[data-k="y"]');
    inputY.value = 'typed';
    patch(prev, h('ul', null, ['y', 'z'].map(row)));
    expect(container.querySelector('input')).toBe(inputY);
    expect(container.querySelector('input').value).toBe('typed');
  });

  test('unkeyed children are matched by index', () => {
    const prev = h('div', null, h('p', null, '1'), h('p', null, '2'));
    const container = setup(prev);
    const [p1, p2] = container.querySelectorAll('p');
    patch(prev, h('div', null, h('p', null, 'one'), h('p', null, 'two'), h('p', null, 'three')));
    const ps = container.querySelectorAll('p');
    expect(Array.from(ps).map((p) => p.textContent)).toEqual(['one', 'two', 'three']);
    expect(ps[0]).toBe(p1);
    expect(ps[1]).toBe(p2);
  });

  test('a key change replaces the node', () => {
    const prev = h('div', { key: 1 }, 'x');
    const container = setup(prev);
    const oldEl = container.firstChild;
    patch(prev, h('div', { key: 2 }, 'x'));
    expect(container.firstChild).not.toBe(oldEl);
    expect(container.innerHTML).toBe('<div>x</div>');
  });

  test('supports several patches in a row', () => {
    let current = list(['a', 'b']);
    const container = setup(current);
    for (const keys of [['b', 'a', 'c'], ['c'], [], ['e', 'c', 'f']]) {
      const next = list(keys);
      patch(current, next);
      current = next;
      expect(Array.from(container.querySelectorAll('li')).map((li) => li.textContent)).toEqual(
        keys.map((k) => k.toUpperCase())
      );
    }
  });
});
