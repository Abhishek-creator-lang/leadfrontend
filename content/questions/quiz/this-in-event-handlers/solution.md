## TL;DR

When a **regular function** is registered with `addEventListener`, the browser calls it with **`this` set to the element the listener is attached to**, i.e. **`event.currentTarget`** (not necessarily `event.target`, the element that was actually clicked). **Arrow functions** ignore that and keep the `this` of their surrounding code, which is what you want inside class or component methods. When you pass a method, **bind it** (and keep the bound reference so you can remove it) or use the **`handleEvent` object** pattern.

## Regular function vs arrow

```html
<ul id="menu">
  <li><button>Save</button></li>
</ul>
```

```js
menu.addEventListener('click', function (event) {
  console.log(this === menu);                 // true: this === event.currentTarget
  console.log(event.target.tagName);          // 'BUTTON': where the click happened
});

menu.addEventListener('click', (event) => {
  console.log(this);                          // outer this (undefined in a module)
  console.log(event.currentTarget === menu);  // true: use this instead
});
```

Prefer `event.currentTarget` in all styles. It's explicit and doesn't depend on how the function was written. Note it's only set **during** dispatch; it becomes `null` afterwards, so read it synchronously (not after an `await`).

## Methods as handlers

```js
class Dropdown {
  open = false;
  constructor(button) {
    this.button = button;
    // ❌ button.addEventListener('click', this.toggle) → `this` would be the button
    this.toggle = this.toggle.bind(this);     // bind once, keep the reference
    button.addEventListener('click', this.toggle);
  }
  toggle() { this.open = !this.open; }
  destroy() { this.button.removeEventListener('click', this.toggle); }
}
```

Alternatives:

```js
class Dropdown2 {
  open = false;
  toggle = () => { this.open = !this.open; }; // class-field arrow: bound per instance
}

// Or remove everything with one signal
const ac = new AbortController();
button.addEventListener('click', () => dropdown.toggle(), { signal: ac.signal });
ac.abort();
```

## The `handleEvent` pattern

Any object with a `handleEvent` method can be a listener, and `this` is the object itself:

```js
const tracker = {
  clicks: 0,
  handleEvent(e) {
    if (e.type === 'click') this.clicks++;
  },
};
document.addEventListener('click', tracker);
document.removeEventListener('click', tracker); // same reference, easy removal
```

This avoids `bind` entirely and lets one object handle several event types.

## Inline handlers (legacy)

```html
<button onclick="console.log(this)">Go</button> <!-- this is the button -->
<button onclick="handle()">Go</button>           <!-- inside handle(), this is undefined/window -->
```

Inline attributes run with the element as `this` only in the attribute's own code, not in functions it calls. They also require `unsafe-inline` in a Content Security Policy, so avoid them.

## Frameworks

- **React:** handlers are called without a meaningful `this`. Class components needed binding or class-field arrows; function components don't use `this` at all. Read `e.currentTarget` from the synthetic event.
- **Vue/Angular:** templates call methods on the component instance, so `this` is the component.

## Pitfalls

- Using `this` inside a delegated handler expecting the clicked child. It's the container; use `event.target.closest(selector)`.
- `removeEventListener(type, this.method.bind(this))` doesn't work: new function each time.
- Mixing arrows and `this` expecting the element.

## In an interview, mention…

- Regular listeners get `this === event.currentTarget`; arrows keep the outer `this`.
- `currentTarget` vs `target`, especially with delegation.
- Binding strategies (bind once, class-field arrows, `handleEvent`, `AbortSignal`) and the removal problem.
