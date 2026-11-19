/**
 * @param {Object | null} proto
 * @param {PropertyDescriptorMap} [propertiesObject]
 * @return {Object}
 */
export default function objectCreate(proto, propertiesObject) {
  const isObjectLike = proto !== null && (typeof proto === 'object' || typeof proto === 'function');
  if (proto !== null && !isObjectLike) {
    throw new TypeError('Object prototype may only be an Object or null: ' + String(proto));
  }

  let obj;
  if (proto === null) {
    // `new F()` cannot produce a null prototype, so set it explicitly.
    obj = {};
    Object.setPrototypeOf(obj, null);
  } else {
    function F() {}
    F.prototype = proto;
    obj = new F();
  }

  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }
  return obj;
}
