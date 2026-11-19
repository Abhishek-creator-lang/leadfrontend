/**
 * @typedef {{ type: string, props: Record<string, any>, key: any, children: VNode[], el: Node | null, text?: string }} VNode
 */

const TEXT = '#text';

function textVNode(value) {
  return { type: TEXT, props: {}, key: undefined, children: [], text: String(value), el: null };
}

/**
 * @param {string} type
 * @param {Record<string, any> | null} props
 * @param {...any} children
 * @return {VNode}
 */
export function h(type, props, ...children) {
  const normalized = [];
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || typeof child === 'boolean') continue;
    normalized.push(typeof child === 'string' || typeof child === 'number' ? textVNode(child) : child);
  }
  const p = props ?? {};
  return { type, props: p, key: p.key, children: normalized, el: null };
}

const isEvent = (name) => /^on[A-Z]/.test(name);
const eventName = (name) => name.slice(2).toLowerCase();
const isEmpty = (value) => value === null || value === undefined || value === false;

function setProp(el, name, value, oldValue) {
  if (name === 'key') return;

  if (isEvent(name)) {
    if (typeof oldValue === 'function') el.removeEventListener(eventName(name), oldValue);
    if (typeof value === 'function') el.addEventListener(eventName(name), value);
    return;
  }
  if (name === 'value' || name === 'checked') {
    el[name] = isEmpty(value) ? (name === 'checked' ? false : '') : value;
    return;
  }

  const attribute = name === 'className' ? 'class' : name;
  if (isEmpty(value)) {
    el.removeAttribute(attribute);
  } else {
    el.setAttribute(attribute, value === true ? '' : String(value));
  }
}

function patchProps(el, oldProps, newProps) {
  for (const name of Object.keys(oldProps)) {
    if (!(name in newProps)) setProp(el, name, undefined, oldProps[name]);
  }
  for (const [name, value] of Object.entries(newProps)) {
    if (oldProps[name] !== value) setProp(el, name, value, oldProps[name]);
  }
}

function createEl(vnode) {
  if (vnode.type === TEXT) {
    vnode.el = document.createTextNode(vnode.text);
    return vnode.el;
  }
  const el = document.createElement(vnode.type);
  patchProps(el, {}, vnode.props);
  for (const child of vnode.children) el.appendChild(createEl(child));
  vnode.el = el;
  return el;
}

/**
 * @param {VNode} vnode
 * @param {Element} container
 * @return {Node}
 */
export function mount(vnode, container) {
  const el = createEl(vnode);
  container.appendChild(el);
  return el;
}

function patchChildren(parent, oldChildren, newChildren) {
  const keyed = new Map();
  for (const child of oldChildren) {
    if (child.key !== undefined && child.key !== null) keyed.set(child.key, child);
  }
  const used = new Set();

  newChildren.forEach((child, i) => {
    let match;
    if (child.key !== undefined && child.key !== null) {
      match = keyed.get(child.key);
    } else {
      const candidate = oldChildren[i];
      if (candidate && (candidate.key === undefined || candidate.key === null)) match = candidate;
    }

    if (match && match.type === child.type && !used.has(match)) {
      used.add(match);
      patch(match, child);
    } else {
      createEl(child);
    }
  });

  for (const child of oldChildren) {
    if (!used.has(child)) child.el.remove();
  }

  // Put DOM children in the new order, moving reused nodes and inserting new ones.
  newChildren.forEach((child, i) => {
    const current = parent.childNodes[i] ?? null;
    if (current !== child.el) parent.insertBefore(child.el, current);
  });
}

/**
 * @param {VNode} oldVNode A mounted vnode.
 * @param {VNode} newVNode
 * @return {Node} The DOM node now representing newVNode.
 */
export default function patch(oldVNode, newVNode) {
  if (oldVNode.type !== newVNode.type || oldVNode.key !== newVNode.key) {
    const el = createEl(newVNode);
    oldVNode.el.replaceWith(el);
    return el;
  }

  const el = oldVNode.el;
  newVNode.el = el;

  if (newVNode.type === TEXT) {
    if (oldVNode.text !== newVNode.text) el.nodeValue = newVNode.text;
    return el;
  }

  patchProps(el, oldVNode.props, newVNode.props);
  patchChildren(el, oldVNode.children, newVNode.children);
  return el;
}
