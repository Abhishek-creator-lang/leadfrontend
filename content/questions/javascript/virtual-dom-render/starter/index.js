/**
 * @typedef {{ type: string | Function, props: Record<string, any>, children: Array<VNode | string> }} VNode
 */

/**
 * @param {string | Function} type
 * @param {Record<string, any> | null} props
 * @param {...any} children
 * @return {VNode}
 */
export function h(type, props, ...children) {
  throw 'Not implemented!';
}

/**
 * @param {VNode | string | number} vnode
 * @return {Node}
 */
export default function render(vnode) {
  throw 'Not implemented!';
}
