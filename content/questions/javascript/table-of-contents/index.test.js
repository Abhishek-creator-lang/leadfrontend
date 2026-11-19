import tableOfContents, { renderToc } from './index';

function article(html) {
  const root = document.createElement('article');
  root.innerHTML = html;
  return root;
}

// Strip ids for structure-only comparisons.
const shape = (tree) => tree.map((e) => [e.text, e.level, shape(e.children)]);

describe('tableOfContents', () => {
  test('returns [] when there are no headings', () => {
    expect(tableOfContents(article('<p>No headings</p>'))).toEqual([]);
  });

  test('builds the example tree', () => {
    const root = article(`
      <h1>Getting started</h1>
      <h2>Install</h2>
      <h3>With npm</h3>
      <h2 id="config">Configure</h2>
      <h4>Advanced flags</h4>
      <h2>Install</h2>`);
    expect(tableOfContents(root)).toEqual([
      {
        id: 'getting-started',
        text: 'Getting started',
        level: 1,
        children: [
          {
            id: 'install',
            text: 'Install',
            level: 2,
            children: [{ id: 'with-npm', text: 'With npm', level: 3, children: [] }],
          },
          {
            id: 'config',
            text: 'Configure',
            level: 2,
            children: [{ id: 'advanced-flags', text: 'Advanced flags', level: 4, children: [] }],
          },
          { id: 'install-1', text: 'Install', level: 2, children: [] },
        ],
      },
    ]);
  });

  test('siblings at the same level stay siblings', () => {
    const root = article('<h2>A</h2><h2>B</h2><h2>C</h2>');
    expect(shape(tableOfContents(root))).toEqual([
      ['A', 2, []],
      ['B', 2, []],
      ['C', 2, []],
    ]);
  });

  test('a heading returns to the correct ancestor after deep nesting', () => {
    const root = article('<h1>1</h1><h2>1.1</h2><h3>1.1.1</h3><h4>1.1.1.1</h4><h2>1.2</h2><h1>2</h1>');
    expect(shape(tableOfContents(root))).toEqual([
      ['1', 1, [['1.1', 2, [['1.1.1', 3, [['1.1.1.1', 4, []]]]]], ['1.2', 2, []]]],
      ['2', 1, []],
    ]);
  });

  test('headings before any lower-level heading are top-level', () => {
    const root = article('<h3>Intro</h3><h2>Part</h2><h3>Detail</h3>');
    expect(shape(tableOfContents(root))).toEqual([
      ['Intro', 3, []],
      ['Part', 2, [['Detail', 3, []]]],
    ]);
  });

  test('finds headings nested inside other elements, in document order', () => {
    const root = article('<section><h2>A</h2><div><h3>B</h3></div></section><h2>C</h2>');
    expect(shape(tableOfContents(root))).toEqual([
      ['A', 2, [['B', 3, []]]],
      ['C', 2, []],
    ]);
  });

  test('normalises whitespace and uses textContent', () => {
    const root = article('<h2>  Hello\n   <em>big</em>   world </h2>');
    expect(tableOfContents(root)[0]).toMatchObject({ text: 'Hello big world', id: 'hello-big-world' });
  });

  test('writes generated ids back onto the headings and keeps existing ones', () => {
    const root = article('<h2>First Thing</h2><h2 id="custom">Second</h2>');
    tableOfContents(root);
    const [h1, h2] = root.querySelectorAll('h2');
    expect(h1.id).toBe('first-thing');
    expect(h2.id).toBe('custom');
  });

  test('generated ids avoid ids already used inside root', () => {
    const root = article('<div id="faq"></div><h2>FAQ</h2><h2>FAQ</h2><h2 id="faq-2">Other</h2><h2>FAQ</h2>');
    const ids = tableOfContents(root).map((e) => e.id);
    expect(ids).toEqual(['faq-1', 'faq-3', 'faq-2', 'faq-4']);
  });

  test('slugifies punctuation and falls back to "section"', () => {
    const root = article("<h2>What's new in v2.0?</h2><h2>???</h2><h2>!!!</h2>");
    expect(tableOfContents(root).map((e) => e.id)).toEqual(['what-s-new-in-v2-0', 'section', 'section-1']);
  });
});

describe('renderToc', () => {
  test('renders an empty tree as an empty string', () => {
    expect(renderToc([])).toBe('');
  });

  test('renders nested lists with links', () => {
    const tree = [
      {
        id: 'a',
        text: 'A',
        level: 1,
        children: [{ id: 'b', text: 'B', level: 2, children: [] }],
      },
      { id: 'c', text: 'C', level: 1, children: [] },
    ];
    expect(renderToc(tree)).toBe(
      '<ul><li><a href="#a">A</a><ul><li><a href="#b">B</a></li></ul></li><li><a href="#c">C</a></li></ul>'
    );
  });

  test('escapes text and ids', () => {
    const tree = [{ id: 'x"y', text: '<b> & "q"', level: 2, children: [] }];
    expect(renderToc(tree)).toBe('<ul><li><a href="#x&quot;y">&lt;b&gt; &amp; &quot;q&quot;</a></li></ul>');
  });

  test('round trip: rendered links match heading ids', () => {
    const root = article('<h1>Title</h1><h2>Part one</h2><h2>Part one</h2>');
    const container = document.createElement('nav');
    container.innerHTML = renderToc(tableOfContents(root));
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href').slice(1));
    const ids = Array.from(root.querySelectorAll('h1, h2')).map((h) => h.id);
    expect(hrefs).toEqual(ids);
  });
});
