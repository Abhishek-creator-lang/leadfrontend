## TL;DR

The **Command pattern** **turns an action into an object** that contains everything needed to perform it (and often to undo it). The code that *triggers* an action (a button, shortcut or menu) is decoupled from the code that *performs* it. Because commands are data, you can **queue, log, replay, serialise, batch and undo** them. Front-end examples: **undo/redo in editors**, **keyboard shortcuts and command palettes**, **Redux actions** (commands described as plain objects), and **offline action queues**.

## Basic shape

```js
function createAddItemCommand(list, item) {
  return {
    name: 'add-item',
    execute() { list.push(item); },
    undo() { list.splice(list.lastIndexOf(item), 1); },
  };
}
```

## Undo/redo manager

```js
class History {
  #done = [];
  #undone = [];

  run(command) {
    command.execute();
    this.#done.push(command);
    this.#undone.length = 0;        // a new action clears the redo stack
  }
  undo() {
    const cmd = this.#done.pop();
    if (!cmd) return;
    cmd.undo();
    this.#undone.push(cmd);
  }
  redo() {
    const cmd = this.#undone.pop();
    if (!cmd) return;
    cmd.execute();
    this.#done.push(cmd);
  }
  get canUndo() { return this.#done.length > 0; }
  get canRedo() { return this.#undone.length > 0; }
}

const todos = [];
const history = new History();
history.run(createAddItemCommand(todos, 'Write tests'));
history.run(createAddItemCommand(todos, 'Ship'));
history.undo();   // todos: ['Write tests']
history.redo();   // todos: ['Write tests', 'Ship']
```

Real editors also **merge** consecutive commands (typing a word is one undo step, not one per character) and cap history length.

## Command registry: shortcuts and command palettes

```js
const commands = new Map([
  ['file.save', { title: 'Save', shortcut: 'Mod+S', run: () => saveDocument() }],
  ['view.toggleSidebar', { title: 'Toggle sidebar', shortcut: 'Mod+B', run: () => toggleSidebar() }],
]);

function runCommand(id) {
  const cmd = commands.get(id);
  if (!cmd) throw new Error(`Unknown command ${id}`);
  analytics.track('command', { id });   // logging comes for free
  return cmd.run();
}

// the same command, triggered from different invokers
saveButton.addEventListener('click', () => runCommand('file.save'));
keymap.bind('Mod+S', () => runCommand('file.save'));
palette.onSelect((id) => runCommand(id));
```

This is how editors like VS Code structure extensibility: menus, keybindings and the palette all reference command IDs.

## Commands as data (Redux, queues)

```js
// a serialisable command (an "action")
dispatch({ type: 'cart/itemAdded', payload: { sku: 'A1', qty: 1 } });
```

Because actions are plain data, Redux DevTools can log, inspect and replay them ("time travel"). The same idea powers **offline queues**: store pending commands in IndexedDB while offline and replay them against the API when connectivity returns. Collaborative editors send operations (commands) to peers.

## Benefits

- **Decoupling** invokers (UI) from receivers (business logic).
- **Undo/redo**, replay, macros (a command composed of commands).
- **Auditing/analytics** in one place.
- **Deferred or remote execution**: queue, schedule, retry, send to a worker or server.

## Pitfalls

- **Undo correctness**: commands must capture enough state to reverse themselves; with complex state, storing **snapshots** or using immutable data/patches (Immer patches) can be simpler than hand-written `undo`.
- **Non-reversible side effects** (sending an email, charging a card) can't be undone locally; model them as compensating actions or exclude them from history.
- **Ceremony**: wrapping every function call in a command object is overkill for simple apps.
- **Serialisation**: commands holding functions or object references can't be persisted; keep queued commands as plain data plus a handler registry.

## In an interview, mention…

- Action-as-object decoupling invoker and receiver.
- Undo/redo stacks (and clearing redo on a new action), registries for shortcuts and palettes.
- Redux actions and offline queues as data-only commands, and the limits of undo for side effects.
