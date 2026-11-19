const A = 'a'.charCodeAt(0);

// O(L) canonical key: the letter counts, comma-separated so "1,11" and "11,1" can't collide.
function keyOf(word) {
  const counts = new Array(26).fill(0);
  for (let i = 0; i < word.length; i++) counts[word.charCodeAt(i) - A]++;
  return counts.join(',');
}

/**
 * @param {string[]} words Lowercase a-z only.
 * @return {string[][]} Groups of anagrams, in any order.
 */
export default function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const key = keyOf(word);
    let group = groups.get(key);
    if (group === undefined) {
      group = [];
      groups.set(key, group);
    }
    group.push(word);
  }
  return [...groups.values()];
}
