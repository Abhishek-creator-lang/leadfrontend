const CLOSER_FOR = { '(': ')', '[': ']', '{': '}' };
const CLOSERS = new Set([')', ']', '}']);

/**
 * @param {string} code
 * @return {boolean}
 */
export default function isBalanced(code) {
  const expected = [];

  for (const ch of code) {
    if (ch in CLOSER_FOR) {
      expected.push(CLOSER_FOR[ch]);
    } else if (CLOSERS.has(ch)) {
      if (expected.pop() !== ch) return false;
    }
  }

  return expected.length === 0;
}
