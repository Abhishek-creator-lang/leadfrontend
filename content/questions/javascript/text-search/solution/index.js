/**
 * Wraps every case-insensitive match of the query words in <b></b>.
 *
 * @param {string} text
 * @param {string} query
 * @return {string}
 */
export default function textSearch(text, query) {
  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
  if (words.length === 0) return text;

  const haystack = text.toLowerCase();
  const marked = new Array(text.length).fill(false);

  for (const word of words) {
    let index = haystack.indexOf(word);
    while (index !== -1) {
      for (let i = index; i < index + word.length; i++) marked[i] = true;
      // Step by one so overlapping matches are found too.
      index = haystack.indexOf(word, index + 1);
    }
  }

  let result = '';
  let open = false;
  for (let i = 0; i < text.length; i++) {
    if (marked[i] && !open) {
      result += '<b>';
      open = true;
    } else if (!marked[i] && open) {
      result += '</b>';
      open = false;
    }
    result += text[i];
  }
  if (open) result += '</b>';

  return result;
}
