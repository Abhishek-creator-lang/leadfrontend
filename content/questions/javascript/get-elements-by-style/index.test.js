import getElementsByStyle from './index';

function fixture(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

const ids = (els) => els.map((el) => el.id);

describe('getElementsByStyle', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('finds elements with an exact inline value', () => {
    const root = fixture(`
      <p id="a" style="font-size: 12px"></p>
      <p id="b" style="font-size: 14px"></p>
      <p id="c" style="font-size: 12px"></p>`);
    expect(ids(getElementsByStyle(root, 'font-size', '12px'))).toEqual(['a', 'c']);
  });

  test('treats equivalent colour spellings as equal', () => {
    const root = fixture(`
      <span id="named" style="color: red"></span>
      <span id="hex" style="color: #ff0000"></span>
      <span id="short" style="color: #f00"></span>
      <span id="rgb" style="color: rgb(255, 0, 0)"></span>
      <span id="blue" style="color: blue"></span>`);
    const expected = ['named', 'hex', 'short', 'rgb'];
    expect(ids(getElementsByStyle(root, 'color', 'red'))).toEqual(expected);
    expect(ids(getElementsByStyle(root, 'color', '#F00'))).toEqual(expected);
    expect(ids(getElementsByStyle(root, 'color', 'rgb(255,0,0)'))).toEqual(expected);
  });

  test('normalises unitless zero', () => {
    const root = fixture('<div id="z" style="margin-top: 0px"></div><div id="n" style="margin-top: 4px"></div>');
    expect(ids(getElementsByStyle(root, 'margin-top', '0'))).toEqual(['z']);
  });

  test('matches keyword values', () => {
    const root = fixture(`
      <div id="hidden" style="display: none"></div>
      <div id="flex" style="display: flex"></div>`);
    expect(ids(getElementsByStyle(root, 'display', 'none'))).toEqual(['hidden']);
    expect(ids(getElementsByStyle(root, 'display', 'flex'))).toEqual(['flex']);
  });

  test('returns nested matches in document order', () => {
    const root = fixture(`
      <div id="1" style="text-align: center">
        <div id="2" style="text-align: left">
          <div id="3" style="text-align: center"></div>
        </div>
      </div>
      <div id="4" style="text-align: center"></div>`);
    expect(ids(getElementsByStyle(root, 'text-align', 'center'))).toEqual(['1', '3', '4']);
  });

  test('does not include the root', () => {
    const root = fixture('<i id="child" style="font-size: 20px"></i>');
    root.style.fontSize = '20px';
    expect(ids(getElementsByStyle(root, 'font-size', '20px'))).toEqual(['child']);
  });

  test('returns [] when nothing matches', () => {
    const root = fixture('<p style="font-size: 10px"></p>');
    expect(getElementsByStyle(root, 'font-size', '99px')).toEqual([]);
  });

  test('does not leave probe elements in the document', () => {
    const root = fixture('<p id="x" style="color: red"></p>');
    const before = document.body.querySelectorAll('*').length;
    getElementsByStyle(root, 'color', 'red');
    expect(document.body.querySelectorAll('*').length).toBe(before);
  });
});
