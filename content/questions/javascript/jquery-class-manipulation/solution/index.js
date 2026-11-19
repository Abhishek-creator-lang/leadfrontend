function splitClasses(names) {
  return String(names).trim().split(/\s+/).filter(Boolean);
}

/**
 * @param {string | Element} target CSS selector or a single element.
 * @return {{
 *   length: number,
 *   addClass: (names: string) => any,
 *   removeClass: (names?: string) => any,
 *   toggleClass: (names: string, force?: boolean) => any,
 *   hasClass: (name: string) => boolean,
 * }}
 */
export default function $(target) {
  const elements = typeof target === 'string' ? Array.from(document.querySelectorAll(target)) : target ? [target] : [];

  return {
    length: elements.length,

    addClass(names) {
      const list = splitClasses(names);
      elements.forEach((el) => el.classList.add(...list));
      return this;
    },

    removeClass(names) {
      if (names === undefined) {
        elements.forEach((el) => el.removeAttribute('class'));
        return this;
      }
      const list = splitClasses(names);
      elements.forEach((el) => el.classList.remove(...list));
      return this;
    },

    toggleClass(names, force) {
      const list = splitClasses(names);
      elements.forEach((el) => {
        list.forEach((name) => el.classList.toggle(name, force));
      });
      return this;
    },

    hasClass(name) {
      return elements.some((el) => el.classList.contains(name));
    },
  };
}
