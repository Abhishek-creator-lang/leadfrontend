/**
 * @typedef {{ type: string | Function, props: Record<string, any>, children: Array<VNode | string> }} VNode
 */

function normalizeChildren(children) {
  const result = [];
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || typeof child === 'boolean') continue;
    result.push(typeof child === 'number' ? String(child) : child);
  }
  return result;
}

/**
 * @param {string | Function} type
 * @param {Record<string, any> | null} props
 * @param {...any} children
 * @return {VNode}
 */
export function h(type, props, ...children) {
  return { type, props: props ?? {}, children: normalizeChildren(children) };
}

function setStyle(el, style) {
  for (const [key, value] of Object.entries(style)) {
    if (value === null || value === undefined || value === false) continue;
    if (key.includes('-')) {
      el.style.setProperty(key, String(value));
    } else {
      el.style[key] = value;
    }
  }
}

function setProp(el, name, value) {
  if (name === 'key' || name === 'children') return;
  if (value === false || value === null || value === undefined) return;

  if (/^on[A-Z]/.test(name) && typeof value === 'function') {
    el.addEventListener(name.slice(2).toLowerCase(), value);
    return;
  }
  if (name === 'style' && typeof value === 'object') {
    setStyle(el, value);
    return;
  }
  if (name === 'value' || name === 'checked') {
    el[name] = value;
    return;
  }

  const attribute = name === 'className' ? 'class' : name === 'htmlFor' ? 'for' : name;
  el.setAttribute(attribute, value === true ? '' : String(value));
}

/**
 * @param {VNode | string | number} vnode
 * @return {Node}
 */
export default function render(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }

  if (typeof vnode.type === 'function') {
    return render(vnode.type({ ...vnode.props, children: vnode.children }));
  }

  const el = document.createElement(vnode.type);
  for (const [name, value] of Object.entries(vnode.props)) {
    setProp(el, name, value);
  }
  for (const child of vnode.children) {
    el.appendChild(render(child));
  }
  return el;
}
