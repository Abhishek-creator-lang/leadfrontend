import getElementsByClassName from './index';

function fixture(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

const texts = (els) => els.map((el) => el.getAttribute('data-id'));

describe('getElementsByClassName', () => {
  test('finds elements with a single class', () => {
    const root = fixture(`
      <span class="a" data-id="1"></span>
      <span class="b" data-id="2"></span>
      <span class="a b" data-id="3"></span>`);
    expect(texts(getElementsByClassName(root, 'a'))).toEqual(['1', '3']);
  });

  test('requires every requested class, in any order', () => {
    const root = fixture(`
      <p class="note warn" data-id="1"></p>
      <p class="warn" data-id="2"></p>
      <p class="big warn note" data-id="3"></p>`);
    expect(texts(getElementsByClassName(root, 'warn note'))).toEqual(['1', '3']);
  });

  test('returns results in document (pre-order) order', () => {
    const root = fixture(`
      <div class="x" data-id="1">
        <div class="x" data-id="2">
          <div class="x" data-id="3"></div>
        </div>
        <div class="x" data-id="4"></div>
      </div>
      <div class="x" data-id="5"></div>`);
    expect(texts(getElementsByClassName(root, 'x'))).toEqual(['1', '2', '3', '4', '5']);
  });

  test('does not include the root element', () => {
    const root = fixture('<i class="item" data-id="child"></i>');
    root.className = 'item';
    expect(texts(getElementsByClassName(root, 'item'))).toEqual(['child']);
  });

  test('matches whole class names only, case-sensitively', () => {
    const root = fixture(`
      <b class="warning" data-id="1"></b>
      <b class="Warn" data-id="2"></b>
      <b class="warn" data-id="3"></b>`);
    expect(texts(getElementsByClassName(root, 'warn'))).toEqual(['3']);
  });

  test('ignores extra whitespace in the query', () => {
    const root = fixture('<a class="p q" data-id="1"></a>');
    expect(texts(getElementsByClassName(root, '  p \n\t q  '))).toEqual(['1']);
  });

  test('returns [] for an empty or whitespace-only query', () => {
    const root = fixture('<a class="p" data-id="1"></a>');
    expect(getElementsByClassName(root, '')).toEqual([]);
    expect(getElementsByClassName(root, '   ')).toEqual([]);
  });

  test('returns [] when nothing matches', () => {
    const root = fixture('<a class="p"></a><b></b>');
    expect(getElementsByClassName(root, 'zzz')).toEqual([]);
  });

  test('skips text and comment nodes', () => {
    const root = fixture('text <!-- comment --> <em class="c" data-id="1">more text</em>');
    expect(texts(getElementsByClassName(root, 'c'))).toEqual(['1']);
  });

  test('returns a plain array that is not live', () => {
    const root = fixture('<u class="t" data-id="1"></u><u class="t" data-id="2"></u>');
    const result = getElementsByClassName(root, 't');
    expect(Array.isArray(result)).toBe(true);
    result[0].classList.remove('t');
    expect(result).toHaveLength(2);
  });

  test('handles a deep tree', () => {
    const root = document.createElement('div');
    let node = root;
    for (let i = 0; i < 500; i++) {
      const child = document.createElement('div');
      if (i % 100 === 0) child.className = 'deep';
      node.appendChild(child);
      node = child;
    }
    expect(getElementsByClassName(root, 'deep')).toHaveLength(5);
  });
});
