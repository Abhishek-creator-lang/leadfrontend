/**
 * @param {number[]} factors
 * @return {number[]} out[i] = product of all factors except factors[i].
 */
export default function productExceptSelf(factors) {
  const n = factors.length;
  const out = new Array(n);

  // out[i] = product of everything to the left of i.
  let left = 1;
  for (let i = 0; i < n; i++) {
    out[i] = left;
    left *= factors[i];
  }

  // Multiply in the product of everything to the right of i.
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] = out[i] * right || 0; // `|| 0` turns -0 into 0
    right *= factors[i];
  }

  return out;
}
