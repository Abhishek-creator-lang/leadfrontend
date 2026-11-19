import lowestCommonAncestor from './index';

const el = (tag, children = []) => ({ tag, children });

function sampleTree() {
  const em = el('em');
  const strong = el('strong');
  const span = el('span');
  const p1 = el('p', [el('text'), em]);
  const p2 = el('p', [strong, span]);
  const article = el('article', [p1, p2]);
  const nav = el('nav', [el('a')]);
  const body = el('body', [nav, article]);
  return { body, nav, article, p1, p2, em, strong, span };
}

describe('lowestCommonAncestor', () => {
  test('nodes in different branches', () => {
    const t = sampleTree();
    expect(lowestCommonAncestor(t.body, t.em, t.strong)).toBe(t.article);
  });

  test('siblings share their parent', () => {
    const t = sampleTree();
    expect(lowestCommonAncestor(t.body, t.strong, t.span)).toBe(t.p2);
  });

  test('a node is its own descendant', () => {
    const t = sampleTree();
    expect(lowestCommonAncestor(t.body, t.em, t.p1)).toBe(t.p1);
    expect(lowestCommonAncestor(t.body, t.article, t.span)).toBe(t.article);
  });

  test('same node twice', () => {
    const t = sampleTree();
    expect(lowestCommonAncestor(t.body, t.em, t.em)).toBe(t.em);
  });

  test('root involved', () => {
    const t = sampleTree();
    expect(lowestCommonAncestor(t.body, t.body, t.span)).toBe(t.body);
    expect(lowestCommonAncestor(t.body, t.nav, t.em)).toBe(t.body);
  });

  test('single-node tree', () => {
    const root = el('html');
    expect(lowestCommonAncestor(root, root, root)).toBe(root);
  });

  test('deeply nested chain of elements', () => {
    const depth = 20000;
    const root = el('div');
    let current = root;
    let mid = null;
    for (let i = 1; i < depth; i++) {
      const child = el('div');
      current.children.push(child);
      current = child;
      if (i === 10000) mid = child;
    }
    const leafA = el('a');
    const leafB = el('b');
    current.children.push(leafA, leafB);
    expect(lowestCommonAncestor(root, leafA, leafB)).toBe(current);
    expect(lowestCommonAncestor(root, mid, leafB)).toBe(mid);
  });

  test('very wide tree', () => {
    const items = Array.from({ length: 100000 }, () => el('li', [el('span')]));
    const list = el('ul', items);
    const root = el('body', [el('header'), list]);
    expect(lowestCommonAncestor(root, items[3].children[0], items[99998].children[0])).toBe(list);
    expect(lowestCommonAncestor(root, items[500].children[0], items[500])).toBe(items[500]);
  });
});
