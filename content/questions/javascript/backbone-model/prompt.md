Before React, Backbone.js models were how many web apps held state: a `Model` wraps a set of attributes and emits events when they change, and views listen to re-render. Implement a `Model` class with that behaviour.

```js
class Todo extends Model {
  defaults() {
    return { title: '', done: false };
  }
}

const todo = new Todo({ title: 'Write tests' });
todo.get('done'); // false (from defaults)

todo.on('change:done', (model, value) => console.log('done ->', value));
todo.on('change', (model) => console.log('changed:', model.changed));

todo.set('done', true);
// logs "done -> true", then "changed: { done: true }"

todo.previous('done'); // false
todo.set('done', true); // same value: no events
todo.set({ title: 'Ship it' }, { silent: true }); // updates without events
todo.toJSON(); // { title: 'Ship it', done: true }
```

## API

| Member | Behaviour |
|---|---|
| `constructor(attributes = {})` | Starts from the subclass's defaults (if it defines a `defaults()` method), then applies `attributes`. Fires **no** events. |
| `get(key)` | Returns the attribute value. |
| `has(key)` | `true` if the value is neither `null` nor `undefined`. |
| `set(key, value, options?)` / `set(attrs, options?)` | Updates attributes. Returns `this`. |
| `unset(key, options?)` | Removes the attribute (it becomes `undefined` and disappears from `toJSON`), firing events like a change. Does nothing if the key isn't present. Returns `this`. |
| `previous(key)` | The value before the most recent `set`/`unset` that changed something. |
| `changed` | An object of the attributes changed by that most recent change (`{}` initially). |
| `toJSON()` | A shallow copy of the attributes. |
| `on(event, callback)` / `off(event, callback)` | Subscribe / unsubscribe. `off` with no callback removes all callbacks for that event. |

## Event rules

- A value counts as changed if `!Object.is(oldValue, newValue)`.
- For each changed key, in the order given, fire `change:<key>` with `(model, newValue)`.
- After those, fire a single `change` event with `(model)` if at least one key changed.
- All attribute updates in one `set` are applied **before** any event fires, so listeners always see the final state.
- `{ silent: true }` updates attributes, `changed` and `previous` but fires no events.
- A `set` that changes nothing fires nothing and leaves `changed` and `previous` as they were.

## Follow-up

- How is this different from how React handles state?
- How would you add validation that can reject a `set`?
- What problems did two-way data binding with observable models cause in large apps?
