function makeFiller(currentLength, targetLength, padString) {
  const fillLength = targetLength - currentLength;
  if (fillLength <= 0 || padString === '') return '';
  const times = Math.ceil(fillLength / padString.length);
  return repeat(padString, times).slice(0, fillLength);
}

/**
 * Pads the start of `str` with `padString` until it reaches `targetLength`.
 *
 * @param {string} str
 * @param {number} targetLength
 * @param {string} [padString=' ']
 * @return {string}
 */
export function padStart(str, targetLength, padString = ' ') {
  return makeFiller(str.length, targetLength, padString) + str;
}

/**
 * Pads the end of `str` with `padString` until it reaches `targetLength`.
 *
 * @param {string} str
 * @param {number} targetLength
 * @param {string} [padString=' ']
 * @return {string}
 */
export function padEnd(str, targetLength, padString = ' ') {
  return str + makeFiller(str.length, targetLength, padString);
}

/**
 * Returns `str` repeated `count` times.
 *
 * @param {string} str
 * @param {number} count
 * @return {string}
 */
export default function repeat(str, count) {
  let n = Math.trunc(count);
  if (n < 0 || n === Infinity) {
    throw new RangeError(`Invalid count value: ${count}`);
  }

  let result = '';
  let chunk = str;
  while (n > 0) {
    if (n % 2 === 1) result += chunk;
    n = Math.floor(n / 2);
    if (n > 0) chunk += chunk;
  }
  return result;
}
