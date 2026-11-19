## TL;DR

In **classical inheritance** (Java, C#, C++), **classes are blueprints** and objects are instances created from them. The class hierarchy is fixed at compile time and instance structure is copied from the class definition. In **prototypal inheritance** (JavaScript), **objects inherit directly from other objects**: each object has a live **`[[Prototype]]` link**, and property lookups **delegate** up that chain at runtime. JavaScript's `class` syntax is a **classical-looking layer over prototypes**, not a different model.

## Classical model in brief

- A class declares fields and methods; an instance gets its own copy of the fields.
- Inheritance is a relationship **between classes** (`Dog extends Animal`), established when the code is compiled.
- You generally can't change a class's methods at runtime, or change which class an instance belongs to.

## Prototypal model in brief

```js
const animal = {
  speak() { return `${this.name} makes a sound`; },
};
const dog = Object.create(animal); // dog's prototype IS the animal object
dog.name = 'Rex';
dog.speak();                         // 'Rex makes a sound', found on animal via delegation

animal.speak = function () { return `${this.name} speaks!`; };
dog.speak();                         // 'Rex speaks!', the link is live, not a copy
Object.getPrototypeOf(dog) === animal; // true
```

Lookups walk `dog → animal → Object.prototype → null`. Assigning `dog.speak = …` creates an **own property that shadows** the inherited one, without affecting `animal`.

## Where JS classes fit

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}
class Dog extends Animal {
  speak() { return `${super.speak()} (woof)`; }
}

typeof Animal;                                         // 'function'
Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true
```

Under the hood, methods live on `Animal.prototype`, `Dog.prototype` delegates to it, and instances delegate to `Dog.prototype`. The syntax adds real features (`super`, `#private` fields, `static` blocks, mandatory `new`), but the inheritance mechanism is still prototype delegation.

## Key differences

| | Classical | Prototypal (JS) |
|---|---|---|
| Inherits from | Classes | Objects |
| Mechanism | Copy structure from the class | Delegate lookups along a live chain |
| Changeable at runtime | Generally no | Yes (add methods to a prototype, `Object.setPrototypeOf`) |
| Multiple inheritance | Sometimes (C++) or interfaces | Single prototype chain; mix-ins via `Object.assign` |
| Memory | Methods in a class table | Methods shared on the prototype object |

## Practical consequences

- **Shared methods are cheap:** one function on the prototype serves every instance.
- **Monkey-patching is possible** (and dangerous). Modifying `Array.prototype` affects every array in the page.
- **Composition is natural:** you can assemble behaviour with mix-ins or factory functions rather than deep hierarchies, which is the "favour composition over inheritance" advice applied to JS.
- **`instanceof` checks the prototype chain**, not a class identity, so it fails across realms (iframes) and can be fooled by `Symbol.hasInstance`.

## Pitfalls

- Treating JS classes like Java classes: methods aren't auto-bound to instances, so passing `obj.method` as a callback loses `this`.
- Mutating shared state on a prototype (e.g. an array defined on the prototype) makes it shared by all instances.
- `Object.setPrototypeOf` on existing objects deoptimises them in engines. Set the prototype at creation time instead.

## In an interview, mention…

- Blueprint copying vs live delegation is the core distinction.
- `class` in JS is syntax over prototypes, with a few genuine additions.
- Prefer shallow hierarchies and composition; deep inheritance trees are brittle in either model.
