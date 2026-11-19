/**
 * @typedef {{ type: string, props: Record<string, any>, key: any, children: VNode[], el: Node | null, text?: string }} VNode
 */

/**
 * @param {string} type
 * @param {Record<string, any> | null} props
 * @param {...any} children
 * @return {VNode}
 */
export function h(type, props, ...children) {
  throw 'Not implemented!';
}

/**
 * @param {VNode} vnode
 * @param {Element} container
 * @return {Node}
 */
export function mount(vnode, container) {
  throw 'Not implemented!';
}

/**
 * @param {VNode} oldVNode A mounted vnode.
 * @param {VNode} newVNode
 * @return {Node} The DOM node now representing newVNode.
 */
export default function patch(oldVNode, newVNode) {
  throw 'Not implemented!';
}
