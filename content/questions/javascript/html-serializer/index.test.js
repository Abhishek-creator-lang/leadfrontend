import serialize from './index';

const lines = (...l) => l.join('\n');

describe('serialize', () => {
  test('serializes a plain text node', () => {
    expect(serialize('hello')).toBe('hello');
  });

  test('serializes an empty element on one line', () => {
    expect(serialize({ tag: 'div' })).toBe('<div></div>');
    expect(serialize({ tag: 'div', children: [] })).toBe('<div></div>');
  });

  test('puts text children on their own indented line', () => {
    expect(serialize({ tag: 'p', children: ['Hi'] })).toBe(lines('<p>', '  Hi', '</p>'));
  });

  test('indents nested elements by two spaces per level', () => {
    const tree = {
      tag: 'div',
      children: [{ tag: 'section', children: [{ tag: 'p', children: ['deep'] }] }, 'tail'],
    };
    expect(serialize(tree)).toBe(
      lines('<div>', '  <section>', '    <p>', '      deep', '    </p>', '  </section>', '  tail', '</div>')
    );
  });

  test('writes attributes in key order', () => {
    expect(serialize({ tag: 'a', attributes: { href: '/home', title: 'Home' } })).toBe(
      '<a href="/home" title="Home"></a>'
    );
  });

  test('handles boolean, null, undefined and numeric attributes', () => {
    const node = {
      tag: 'button',
      attributes: { disabled: true, hidden: false, 'data-x': null, title: undefined, tabindex: 0, value: '' },
    };
    expect(serialize(node)).toBe('<button disabled tabindex="0" value=""></button>');
  });

  test('escapes text content, ampersand first', () => {
    expect(serialize({ tag: 'p', children: ['a < b && c > d &lt;'] })).toBe(
      lines('<p>', '  a &lt; b &amp;&amp; c &gt; d &amp;lt;', '</p>')
    );
  });

  test('escapes attribute values', () => {
    expect(serialize({ tag: 'img', attributes: { alt: 'Say "hi" & <wave>' } })).toBe(
      '<img alt="Say &quot;hi&quot; &amp; <wave>">'
    );
  });

  test('escaping prevents markup injection', () => {
    const html = serialize({ tag: 'p', children: ['<script>alert(1)</script>'] });
    expect(html).not.toContain('<script>');
  });

  test('writes void elements without a closing tag and ignores their children', () => {
    expect(serialize({ tag: 'br' })).toBe('<br>');
    expect(serialize({ tag: 'input', attributes: { type: 'text' }, children: ['ignored'] })).toBe('<input type="text">');
  });

  test('serializes a full example', () => {
    const tree = {
      tag: 'ul',
      attributes: { class: 'menu' },
      children: [
        { tag: 'li', children: ['Fish & chips'] },
        { tag: 'li', children: [{ tag: 'img', attributes: { src: 'pie.png', alt: '"Pie"' } }] },
        { tag: 'li' },
      ],
    };
    expect(serialize(tree)).toBe(
      lines(
        '<ul class="menu">',
        '  <li>',
        '    Fish &amp; chips',
        '  </li>',
        '  <li>',
        '    <img src="pie.png" alt="&quot;Pie&quot;">',
        '  </li>',
        '  <li></li>',
        '</ul>'
      )
    );
  });

  test('has no trailing newline', () => {
    expect(serialize({ tag: 'div', children: ['x'] }).endsWith('\n')).toBe(false);
  });
});
