/**
 * Creates a spreadsheet whose cells can hold numbers, text or formulas such as
 * "=SUM(A1:A3) / 2".
 *
 * @return {{
 *   set: (ref: string, raw: string) => void,
 *   get: (ref: string) => number | string | null,
 *   getRaw: (ref: string) => string,
 * }}
 */
export default function createSheet() {
  // Suggested pieces:
  //   - a tokenizer + recursive-descent parser for formulas
  //   - a map of cells, plus a reverse "dependents" map
  //   - a cache of computed values, invalidated when inputs change
  //   - cycle detection while evaluating
  return {
    set(ref, raw) {
      throw 'Not implemented!';
    },
    get(ref) {
      throw 'Not implemented!';
    },
    getRaw(ref) {
      throw 'Not implemented!';
    },
  };
}
