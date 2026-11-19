import getElementsByTagName from './index';

function fixture(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

const ids = (els) => els.map((el) => el.id);

describe('getElementsByTagName', () => {
  test('finds descendants by tag name', () => {
    const root = fixture('<p id="a"></p><span id="b"></span><p id="c"></p>');
    expect(ids(getElementsByTagName(root, 'p'))).toEqual(['a', 'c']);
  });

  test('is case-insensitive', () => {
    const root = fixture('<section id="s"><p id="p"></p></section>');
    expect(ids(getElementsByTagName(root, 'SECTION'))).toEqual(['s']);
    expect(ids(getElementsByTagName(root, 'P'))).toEqual(['p']);
    expect(ids(getElementsByTagName(root, 'Section'))).toEqual(['s']);
  });

  test('returns nested matches in document order', () => {
    const root = fixture(`
      <ul id="1">
        <li id="2"><ul id="3"><li id="4"></li></ul></li>
        <li id="5"></li>
      </ul>`);
    expect(ids(getElementsByTagName(root, 'li'))).toEqual(['2', '4', '5']);
    expect(ids(getElementsByTagName(root, 'ul'))).toEqual(['1', '3']);
  });

  test('"*" returns every descendant element in document order', () => {
    const root = fixture('<a id="1"><b id="2"></b></a><c id="3"></c>');
    expect(ids(getElementsByTagName(root, '*'))).toEqual(['1', '2', '3']);
  });

  test('does not include the root itself', () => {
    const root = document.createElement('div');
    root.id = 'root';
    root.innerHTML = '<div id="inner"></div>';
    expect(ids(getElementsByTagName(root, 'div'))).toEqual(['inner']);
  });

  test('ignores text and comment nodes', () => {
    const root = fixture('hello <!-- note --> <em id="e">world</em>');
    expect(getElementsByTagName(root, '*')).toHaveLength(1);
  });

  test('returns [] when nothing matches or the root is empty', () => {
    expect(getElementsByTagName(fixture('<p></p>'), 'table')).toEqual([]);
    expect(getElementsByTagName(document.createElement('div'), '*')).toEqual([]);
  });

  test('returns the same element references as the DOM', () => {
    const root = fixture('<button id="btn"></button>');
    const [btn] = getElementsByTagName(root, 'button');
    expect(btn).toBe(root.firstElementChild);
  });

  test('matches the native implementation on a larger tree', () => {
    const root = fixture(`
      <header><h1>T</h1><nav><a></a><a></a></nav></header>
      <main><article><h2>x</h2><p><a></a><span></span></p></article><aside><p></p></aside></main>
      <footer><p><a></a></p></footer>`);
    for (const tag of ['a', 'p', 'h2', 'span', '*']) {
      expect(getElementsByTagName(root, tag)).toEqual(Array.from(root.getElementsByTagName(tag)));
    }
  });
});
