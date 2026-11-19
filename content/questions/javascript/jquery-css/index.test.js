import $ from './index';

const box = (id) => document.getElementById(id);

describe('$().css', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="a" class="box"></div><div id="b" class="box"></div><p id="p"></p>';
  });

  test('sets a property on every match', () => {
    $('.box').css('color', 'red');
    expect(box('a').style.color).toBe('red');
    expect(box('b').style.color).toBe('red');
    expect(box('p').style.color).toBe('');
  });

  test('accepts camelCase and kebab-case names', () => {
    $('#a').css('backgroundColor', 'blue').css('margin-top', '2em');
    expect(box('a').style.getPropertyValue('background-color')).toBe('blue');
    expect(box('a').style.getPropertyValue('margin-top')).toBe('2em');
  });

  test('appends px to numbers', () => {
    $('#a').css('width', 120).css('marginLeft', 0);
    expect(box('a').style.width).toBe('120px');
    expect(box('a').style.marginLeft).toBe('0px');
  });

  test('does not append px to unitless properties', () => {
    $('#a').css({ opacity: 0.5, zIndex: 3, 'font-weight': 700, lineHeight: 1.5, flexGrow: 2 });
    const s = box('a').style;
    expect(s.opacity).toBe('0.5');
    expect(s.zIndex).toBe('3');
    expect(s.fontWeight).toBe('700');
    expect(s.lineHeight).toBe('1.5');
    expect(s.getPropertyValue('flex-grow')).toBe('2');
  });

  test('sets multiple properties from an object', () => {
    $('.box').css({ color: 'green', height: 10, 'padding-top': '4px' });
    for (const id of ['a', 'b']) {
      expect(box(id).style.color).toBe('green');
      expect(box(id).style.height).toBe('10px');
      expect(box(id).style.paddingTop).toBe('4px');
    }
  });

  test('null or empty string removes the inline property', () => {
    $('#a').css({ color: 'red', width: 50 });
    $('#a').css('color', null).css('width', '');
    expect(box('a').style.color).toBe('');
    expect(box('a').style.width).toBe('');
  });

  test('custom properties are set as-is without units', () => {
    $('#a').css('--gap', 8).css('--brandColor', 'teal');
    expect(box('a').style.getPropertyValue('--gap')).toBe('8');
    expect(box('a').style.getPropertyValue('--brandColor')).toBe('teal');
  });

  test('setters are chainable and return the wrapper', () => {
    const w = $('.box');
    expect(w.css('color', 'red')).toBe(w);
    expect(w.css({ color: 'blue' })).toBe(w);
  });

  test('getter returns the computed value of the first match', () => {
    box('a').style.color = 'blue';
    box('b').style.color = 'red';
    expect($('.box').css('color')).toBe('rgb(0, 0, 255)');
  });

  test('getter sees stylesheet rules, not only inline styles', () => {
    document.head.innerHTML = '<style>#p { display: none; }</style>';
    expect($('#p').css('display')).toBe('none');
    document.head.innerHTML = '';
  });

  test('getter accepts camelCase names', () => {
    $('#a').css('fontSize', 18);
    expect($('#a').css('fontSize')).toBe('18px');
  });

  test('getter returns undefined when nothing matches; setters are no-ops', () => {
    expect($('.missing').css('color')).toBeUndefined();
    expect(() => $('.missing').css('color', 'red')).not.toThrow();
  });
});
