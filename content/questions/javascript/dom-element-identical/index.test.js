import isSameTree from './index';

function tree(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

describe('isSameTree', () => {
  test('identical markup produces identical trees', () => {
    const html = '<ul><li class="a">One</li><li>Two <b>bold</b></li></ul>';
    expect(isSameTree(tree(html), tree(html))).toBe(true);
  });

  test('a node is identical to itself', () => {
    const t = tree('<p>x</p>');
    expect(isSameTree(t, t)).toBe(true);
  });

  test('attribute order does not matter', () => {
    expect(isSameTree(tree('<p id="1" class="x" title="t"></p>'), tree('<p title="t" class="x" id="1"></p>'))).toBe(true);
  });

  test('different attribute values are not identical', () => {
    expect(isSameTree(tree('<p class="a b"></p>'), tree('<p class="b a"></p>'))).toBe(false);
  });

  test('an extra attribute on either side is not identical', () => {
    expect(isSameTree(tree('<input type="text">'), tree('<input type="text" disabled>'))).toBe(false);
    expect(isSameTree(tree('<input type="text" disabled>'), tree('<input type="text">'))).toBe(false);
  });

  test('different tag names are not identical', () => {
    expect(isSameTree(tree('<b>x</b>'), tree('<i>x</i>'))).toBe(false);
  });

  test('different text deep in the tree is detected', () => {
    const a = tree('<div><section><p>Hello <em>world</em></p></section></div>');
    const b = tree('<div><section><p>Hello <em>there</em></p></section></div>');
    expect(isSameTree(a, b)).toBe(false);
  });

  test('text nodes matter, including whitespace', () => {
    expect(isSameTree(tree('<p>a</p>'), tree('<p> a</p>'))).toBe(false);
    expect(isSameTree(tree('<p>a</p><p>b</p>'), tree('<p>a</p> <p>b</p>'))).toBe(false);
  });

  test('structure matters, not just text content', () => {
    expect(isSameTree(tree('<b>ab</b>'), tree('<b>a<i>b</i></b>'))).toBe(false);
  });

  test('different numbers of children are not identical', () => {
    expect(isSameTree(tree('<ul><li></li></ul>'), tree('<ul><li></li><li></li></ul>'))).toBe(false);
  });

  test('comments are compared', () => {
    expect(isSameTree(tree('<!--a--><p></p>'), tree('<!--b--><p></p>'))).toBe(false);
    expect(isSameTree(tree('<!--a--><p></p>'), tree('<!--a--><p></p>'))).toBe(true);
  });

  test('compares text nodes directly', () => {
    expect(isSameTree(document.createTextNode('x'), document.createTextNode('x'))).toBe(true);
    expect(isSameTree(document.createTextNode('x'), document.createComment('x'))).toBe(false);
  });

  test('agrees with isEqualNode on a set of pairs', () => {
    const pairs = [
      ['<a href="/">x</a>', '<a href="/">x</a>'],
      ['<a href="/">x</a>', '<a href="/x">x</a>'],
      ['<div><span></span>text</div>', '<div><span></span>text</div>'],
      ['<div><span></span>text</div>', '<div>text<span></span></div>'],
      ['<table><tbody><tr><td>1</td></tr></tbody></table>', '<table><tbody><tr><td>1</td></tr></tbody></table>'],
    ];
    for (const [x, y] of pairs) {
      const a = tree(x);
      const b = tree(y);
      expect(isSameTree(a, b)).toBe(a.isEqualNode(b));
    }
  });

  test('handles very deep trees', () => {
    const build = (leafText) => {
      const root = document.createElement('div');
      let node = root;
      for (let i = 0; i < 3000; i++) {
        const child = document.createElement('div');
        node.appendChild(child);
        node = child;
      }
      node.textContent = leafText;
      return root;
    };
    expect(isSameTree(build('same'), build('same'))).toBe(true);
    expect(isSameTree(build('same'), build('diff'))).toBe(false);
  });
});
