import render, { h } from './index';

describe('h', () => {
  test('creates a vnode with default props', () => {
    expect(h('div', null)).toEqual({ type: 'div', props: {}, children: [] });
  });

  test('flattens children and drops null, undefined and booleans', () => {
    const vnode = h('ul', null, ['a', ['b', [null, 'c']]], false, true, undefined, 0, 7);
    expect(vnode.children).toEqual(['a', 'b', 'c', '0', '7']);
  });

  test('keeps vnode children as-is', () => {
    const child = h('li', null, 'x');
    expect(h('ul', null, child).children[0]).toBe(child);
  });
});

describe('render', () => {
  test('renders strings and numbers as text nodes', () => {
    const node = render('hello');
    expect(node.nodeType).toBe(Node.TEXT_NODE);
    expect(node.textContent).toBe('hello');
    expect(render(42).textContent).toBe('42');
  });

  test('renders nested elements', () => {
    const el = render(h('div', null, h('h1', null, 'Title'), h('p', null, 'Body ', h('b', null, 'bold'))));
    expect(el.outerHTML).toBe('<div><h1>Title</h1><p>Body <b>bold</b></p></div>');
  });

  test('does not parse text as HTML', () => {
    const el = render(h('p', null, '<img src=x onerror="alert(1)">'));
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toBe('<img src=x onerror="alert(1)">');
  });

  test('applies attributes, className and htmlFor', () => {
    const el = render(h('label', { className: 'field big', htmlFor: 'email', 'data-id': 7, title: 'T' }));
    expect(el.getAttribute('class')).toBe('field big');
    expect(el.getAttribute('for')).toBe('email');
    expect(el.getAttribute('data-id')).toBe('7');
    expect(el.getAttribute('title')).toBe('T');
  });

  test('handles boolean and empty props', () => {
    const el = render(h('button', { disabled: true, hidden: false, title: null, key: 'k' }));
    expect(el.getAttribute('disabled')).toBe('');
    expect(el.hasAttribute('hidden')).toBe(false);
    expect(el.hasAttribute('title')).toBe(false);
    expect(el.hasAttribute('key')).toBe(false);
  });

  test('applies style objects with camelCase and kebab-case keys', () => {
    const el = render(h('div', { style: { backgroundColor: 'red', 'margin-top': '4px', '--gap': '2px' } }));
    expect(el.style.backgroundColor).toBe('red');
    expect(el.style.marginTop).toBe('4px');
    expect(el.style.getPropertyValue('--gap')).toBe('2px');
  });

  test('attaches event listeners for on* props', () => {
    const onClick = jest.fn();
    const onKeyDown = jest.fn();
    const el = render(h('button', { onClick, onKeyDown }, 'Go'));
    el.click();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(el.hasAttribute('onclick')).toBe(false);
  });

  test('sets value and checked as properties', () => {
    const input = render(h('input', { value: 'hello' }));
    expect(input.value).toBe('hello');
    const box = render(h('input', { type: 'checkbox', checked: true }));
    expect(box.checked).toBe(true);
  });

  test('renders function components with props and children', () => {
    function Badge({ count, children }) {
      return h('span', { className: 'badge' }, children, ': ', count);
    }
    const el = render(h('div', null, h(Badge, { count: 3 }, 'Unread')));
    expect(el.innerHTML).toBe('<span class="badge">Unread: 3</span>');
  });

  test('supports components that render other components and lists', () => {
    const Item = ({ label }) => h('li', null, label);
    const List = ({ items }) =>
      h(
        'ul',
        null,
        items.map((label) => h(Item, { key: label, label }))
      );
    const el = render(h(List, { items: ['a', 'b', 'c'] }));
    expect(el.outerHTML).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
  });
});
