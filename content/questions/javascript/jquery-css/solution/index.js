const UNITLESS = new Set([
  'opacity',
  'z-index',
  'font-weight',
  'line-height',
  'flex',
  'flex-grow',
  'flex-shrink',
  'order',
  'zoom',
]);

function toKebab(name) {
  if (name.startsWith('--')) return name;
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function setStyle(el, rawName, value) {
  const name = toKebab(rawName);
  if (value === null || value === '') {
    el.style.removeProperty(name);
    return;
  }
  let cssValue = String(value);
  if (typeof value === 'number' && !name.startsWith('--') && !UNITLESS.has(name)) {
    cssValue = `${value}px`;
  }
  el.style.setProperty(name, cssValue);
}

/**
 * @param {string | Element} target CSS selector or a single element.
 * @return {{
 *   css: (nameOrMap: string | Record<string, string | number | null>, value?: string | number | null) => any,
 * }}
 */
export default function $(target) {
  const elements = typeof target === 'string' ? Array.from(document.querySelectorAll(target)) : target ? [target] : [];

  return {
    length: elements.length,

    css(nameOrMap, value) {
      if (nameOrMap !== null && typeof nameOrMap === 'object') {
        const entries = Object.entries(nameOrMap);
        elements.forEach((el) => entries.forEach(([name, v]) => setStyle(el, name, v)));
        return this;
      }

      if (value === undefined) {
        if (elements.length === 0) return undefined;
        const first = elements[0];
        return first.ownerDocument.defaultView.getComputedStyle(first).getPropertyValue(toKebab(nameOrMap));
      }

      elements.forEach((el) => setStyle(el, nameOrMap, value));
      return this;
    },
  };
}
