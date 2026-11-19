import render, { compile } from './index';

describe('template engine', () => {
  test('copies templates without tags unchanged', () => {
    expect(render('plain text } { }}', {})).toBe('plain text } { }}');
    expect(render('', {})).toBe('');
  });

  test('interpolates values, with or without inner whitespace', () => {
    expect(render('Hi {{name}}! Bye {{   name   }}.', { name: 'Ada' })).toBe('Hi Ada! Bye Ada.');
  });

  test('resolves dotted paths', () => {
    expect(render('{{ user.address.city }}', { user: { address: { city: 'Pune' } } })).toBe('Pune');
  });

  test('missing values render as empty strings at any depth', () => {
    expect(render('[{{ a }}][{{ a.b.c }}][{{ n }}]', { n: null })).toBe('[][][]');
  });

  test('keeps 0 and false', () => {
    expect(render('{{ zero }} {{ no }}', { zero: 0, no: false })).toBe('0 false');
  });

  test('escapes HTML in double-brace tags', () => {
    expect(render('{{ v }}', { v: `<a href="x">'&'</a>` })).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  test('triple braces output raw values', () => {
    expect(render('{{ html }} vs {{{ html }}}', { html: '<b>&</b>' })).toBe('&lt;b&gt;&amp;&lt;/b&gt; vs <b>&</b>');
  });

  test('handles several tags on one line without merging them', () => {
    expect(render('{{a}}-{{{b}}}-{{c}}', { a: 1, b: '<i>', c: 3 })).toBe('1-<i>-3');
  });

  test('applies filters left to right, before escaping', () => {
    const filters = {
      upper: (s) => String(s).toUpperCase(),
      exclaim: (s) => `${s}!`,
      wrap: (s) => `<${s}>`,
    };
    expect(render('{{ name | upper | exclaim }}', { name: 'ada' }, { filters })).toBe('ADA!');
    expect(render('{{ name | wrap }}', { name: 'x' }, { filters })).toBe('&lt;x&gt;');
    expect(render('{{{ name | wrap }}}', { name: 'x' }, { filters })).toBe('<x>');
  });

  test('throws for an unknown filter', () => {
    expect(() => render('{{ name | nope }}', { name: 'x' })).toThrow(/nope/);
  });

  test('compile returns a reusable function', () => {
    const tpl = compile('<li>{{ item.label }} ({{ item.count }})</li>');
    expect(tpl({ item: { label: 'A', count: 1 } })).toBe('<li>A (1)</li>');
    expect(tpl({ item: { label: 'B & C', count: 0 } })).toBe('<li>B &amp; C (0)</li>');
  });

  test('does not execute template expressions as code', () => {
    globalThis.__pwned = false;
    expect(render('{{ constructor.constructor("globalThis.__pwned = true")() }}', {})).toBe('');
    expect(globalThis.__pwned).toBe(false);
    delete globalThis.__pwned;
  });
});
