## Approach

A recursive function `write(node, depth)` appends lines to an array; the result is `lines.join('\n')`.

- **String node:** push `indent + escapeText(node)`.
- **Element:** build the opening tag with its attributes, then:
  - void element: push only the opening tag;
  - no children: push `<tag ...></tag>` on one line;
  - otherwise: push the opening tag, recurse into each child at `depth + 1`, push the closing tag.

Collecting lines in an array and joining once avoids repeated string concatenation in deep trees and makes "no trailing newline" automatic.

### Escaping

```js
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
```

`&` must be replaced first. If `<` became `&lt;` first, the `&` replacement would turn it into `&amp;lt;`, which renders as the literal text `&lt;`.

Text only needs `&`, `<` and `>` escaped (strictly `<` and `&`, but escaping `>` is conventional). Double-quoted attribute values only need `&` and `"`. Always quoting attributes removes a whole class of bugs: unquoted values can be broken out of with a space.

### Attributes

Iterate `Object.entries(attributes)`, skip `false`/`null`/`undefined`, write `name` alone for `true`, and `name="escaped value"` otherwise with `String(value)`.

## Complexity

O(total size of the output). Each node is visited once.

## Edge cases

- Missing `attributes` or `children` keys.
- Void elements with children: ignored, because the HTML parser would close them anyway.
- Numbers as attribute values (`tabindex: 0`) must not be dropped as falsy: check for `false`/`null`/`undefined` explicitly instead of truthiness.
- Empty string text nodes still produce an (indented) empty line; that's acceptable and consistent.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Escaping `&` last | Double-escaped entities like `&amp;lt;` |
| `if (!value) continue` for attributes | `tabindex="0"` and `value=""` disappear |
| Not escaping attribute quotes | `title='" onmouseover="alert(1)'` injects an event handler |
| Writing `<img></img>` | Invalid HTML; parsers ignore `</img>` but it's a correctness bug |
| String concatenation with manual `\n` | Off-by-one trailing newlines |

## Security: why escaping matters

If user data is concatenated into HTML without escaping, a comment containing `<script>` or `<img src=x onerror=...>` becomes executable: a stored XSS. React escapes text children and attribute values for exactly this reason, and makes you type `dangerouslySetInnerHTML` to opt out. Server renderers (`react-dom/server`'s `renderToString`, template engines) all implement functions very close to `escapeText` and `escapeAttr`.

Escaping isn't enough in every context: values inside `href` still need URL-scheme checks (`javascript:` URLs), and content inside `<script>` or `<style>` needs different rules.

## Pretty-printing caveat

Adding newlines and indentation **changes the rendered output** in whitespace-sensitive places: inside `<pre>` and `<textarea>`, and between inline elements (`<b>a</b><i>b</i>` gains a visible space). Real formatters such as Prettier treat inline elements carefully for this reason. A production serializer would print compactly by default.

## Follow-ups

- **Streaming:** turn `write` into a generator that `yield`s chunks, so a server can flush HTML progressively (React 18's `renderToPipeableStream` does this).
- **Raw text elements:** `script` and `style` content must not be entity-escaped, but must not contain `</script`.
- **Configurable indent / compact mode.**
