/**
 * @typedef {{ filters?: Record<string, (value: any) => any> }} RenderOptions
 */

/**
 * @param {string} template
 * @return {(data: any, options?: RenderOptions) => string}
 */
export function compile(template) {
  throw 'Not implemented!';
}

/**
 * @param {string} template
 * @param {any} data
 * @param {RenderOptions} [options]
 * @return {string}
 */
export default function render(template, data, options) {
  throw 'Not implemented!';
}
