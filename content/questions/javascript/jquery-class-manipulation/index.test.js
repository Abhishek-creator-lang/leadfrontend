import $ from './index';

const classOf = (id) => document.getElementById(id).className;

describe('$ class manipulation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="a" class="btn">A</button>
      <button id="b" class="btn primary">B</button>
      <p id="p" class="text"></p>`;
  });

  test('length reports the number of matches', () => {
    expect($('.btn').length).toBe(2);
    expect($('.missing').length).toBe(0);
    expect($(document.getElementById('p')).length).toBe(1);
  });

  test('addClass adds to every match without duplicates', () => {
    $('.btn').addClass('large btn');
    expect(classOf('a')).toBe('btn large');
    expect(classOf('b')).toBe('btn primary large');
  });

  test('addClass handles extra whitespace', () => {
    $('#p').addClass('   one \n  two  ');
    expect(classOf('p')).toBe('text one two');
  });

  test('removeClass removes only the named classes', () => {
    $('.btn').addClass('btn-primary').removeClass('btn primary');
    expect(classOf('a')).toBe('btn-primary');
    expect(classOf('b')).toBe('btn-primary');
  });

  test('removeClass with no argument removes every class', () => {
    $('#b').removeClass();
    expect(classOf('b')).toBe('');
  });

  test('toggleClass flips each element independently', () => {
    $('.btn').toggleClass('primary');
    expect(document.getElementById('a').classList.contains('primary')).toBe(true);
    expect(document.getElementById('b').classList.contains('primary')).toBe(false);
  });

  test('toggleClass with force always adds or removes', () => {
    $('.btn').toggleClass('on', true).toggleClass('on', true);
    expect($('#a').hasClass('on')).toBe(true);
    expect($('#b').hasClass('on')).toBe(true);
    $('.btn').toggleClass('on', false);
    expect($('.btn').hasClass('on')).toBe(false);
  });

  test('hasClass is true if any match has the class', () => {
    expect($('.btn').hasClass('primary')).toBe(true);
    expect($('#a').hasClass('primary')).toBe(false);
    expect($('.missing').hasClass('btn')).toBe(false);
  });

  test('methods are chainable and return the same wrapper', () => {
    const wrapper = $('.btn');
    expect(wrapper.addClass('x')).toBe(wrapper);
    expect(wrapper.removeClass('x')).toBe(wrapper);
    expect(wrapper.toggleClass('x')).toBe(wrapper);
  });

  test('accepts an element directly', () => {
    const el = document.getElementById('p');
    $(el).addClass('direct');
    expect(el.classList.contains('direct')).toBe(true);
  });

  test('does nothing (and does not throw) with no matches or empty names', () => {
    expect(() => $('.missing').addClass('a').removeClass('a').toggleClass('a')).not.toThrow();
    expect(() => $('#p').addClass('').toggleClass('  ')).not.toThrow();
    expect(classOf('p')).toBe('text');
  });
});
