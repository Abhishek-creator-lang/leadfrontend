## Brute force

Check every substring `text[i..j]` and test it for duplicates with a `Set`: O(n³). A smarter brute force starts at each `i` and extends `j` until a repeat appears, which is O(n²), or O(n · alphabet). With 10⁵ characters of a large alphabet that's still billions of steps.

## Optimal: sliding window with last-seen positions

Maintain a window `[left, right]` that never contains a repeat, and a `Map` from character to the **last index** where it appeared.

For each `right`:

1. Let `ch = text[right]`. If `ch` was last seen at an index `≥ left`, it's inside the window, so move `left` to `lastSeen + 1`, jumping past the old copy.
2. Record `lastSeen.set(ch, right)`.
3. Update `best = max(best, right - left + 1)`.

The `≥ left` check matters: a character seen **before** the window started is irrelevant. Without it, `left` can move backwards. Try `"abba"`: at the final `a`, its last index (0) is behind `left` (2).

`left` only moves forward, so the total work is linear. A version with a `Set` that removes characters from the left one at a time is also O(n) (each character enters and leaves the set at most once) and is just as good to present.

## Complexity

- **Time:** O(n).
- **Space:** O(min(n, alphabet)) for the map.

## Edge cases

- Empty string → 0; one character → 1.
- All characters the same → 1.
- All distinct → n.
- `"abba"`-style patterns, where a stale index sits behind the window.
- Case sensitivity: `'A' !== 'a'`.
- Characters outside the Basic Multilingual Plane (emoji) are two UTF-16 code units. Indexing `text[i]` treats them as two characters. Ask whether you should iterate by code points with `Array.from(text)` or `for…of`.

## Talking through it in an interview

Name the pattern: "longest contiguous range with a property that stays valid when you shrink it" means a sliding window. Draw the window on `"abcabd"`, show `left` jumping, then show `"abba"` to justify the `≥ left` guard.

## Follow-ups

- **Return the substring:** track `bestStart` whenever `best` improves and return `text.slice(bestStart, bestStart + best)`.
- **Up to k repeats per character:** keep a count map; while the count of the new character exceeds k, shrink from the left. Still O(n).
- **Same pattern in UI work:** rate limiting over a time window, "longest streak" stats, and de-duplicating events in a rolling buffer.
