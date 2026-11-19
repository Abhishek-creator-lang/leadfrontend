## TL;DR

A **design pattern** is a **named, reusable solution to a recurring design problem**: not code to copy, but a template you adapt. Patterns are useful because they give teams a **shared vocabulary** ("make it an observer", "use a strategy here"), capture **proven trade-offs**, and lead to code that's **easier to extend and test**. In JavaScript, many classic patterns are **simpler than their textbook form** thanks to first-class functions, closures and modules, and some are built into the language or frameworks.

## The classic categories (Gang of Four)

| Category | Problem | Examples |
|---|---|---|
| Creational | How objects get created | Factory, Singleton, Builder, Prototype |
| Structural | How objects are composed | Decorator, Adapter, Facade, Proxy, Composite |
| Behavioural | How objects communicate | Observer, Strategy, Command, Iterator, State, Mediator |

Plus JavaScript/front-end-specific patterns: **Module**, **Mixin**, **Pub/Sub**, **Provider**, **Hooks**, **Render props / compound components**, **Container/presentational**, **Flux/unidirectional data flow**, and architectural patterns like **MVC/MVVM** and **micro-frontends**.

## Patterns you use without naming them

```js
button.addEventListener('click', onClick);   // Observer
const sorted = items.toSorted(byPrice);      // Strategy (comparator function)
for (const x of new Set(list)) {}            // Iterator protocol
const p = new Proxy(target, handler);        // Proxy (built into the language)
export const config = loadConfig();          // Module + singleton instance
const withAuth = (Component) => (props) => …; // Decorator (higher-order component)
```

## Why they help

- **Communication**: one word conveys a whole design in reviews and design docs.
- **Proven solutions**: patterns come with known consequences, e.g. Observer decouples senders from receivers but can make data flow harder to trace.
- **Flexibility**: most patterns isolate the part that changes (an algorithm, a creation step, a notification target) so new cases don't require editing existing code (open/closed principle).
- **Testability**: patterns like Strategy and dependency injection make it easy to substitute fakes.
- **Reading frameworks**: React's context is a provider pattern, Redux is a command/observer combination, RxJS is observer + iterator. Knowing the patterns makes libraries easier to learn and to evaluate.

## Example: replacing conditionals with a strategy

```js
// before: every new payment method edits this function
function pay(method, amount) {
  if (method === 'card') return chargeCard(amount);
  if (method === 'paypal') return redirectToPaypal(amount);
  if (method === 'upi') return requestUpi(amount);
  throw new Error('Unknown method');
}

// after: register strategies; adding one doesn't touch existing code
const paymentStrategies = {
  card: chargeCard,
  paypal: redirectToPaypal,
  upi: requestUpi,
};
const pay = (method, amount) => {
  const strategy = paymentStrategies[method];
  if (!strategy) throw new Error(`Unknown payment method: ${method}`);
  return strategy(amount);
};
```

## Cautions

- **Don't force patterns**: adding a factory, an abstract base class and a registry for two cases is over-engineering. Start simple and introduce a pattern when the duplication or rigidity actually appears.
- **Language matters**: in JavaScript, a strategy is often just a function, a singleton is just a module, a command is an object literal. Don't port Java class hierarchies literally.
- **Anti-patterns exist too**: god objects, global mutable singletons, deep inheritance trees, event-bus spaghetti.
- **Patterns age**: mixins and HOCs gave way to hooks in React; the problem stays, the idiomatic solution changes.

## In an interview, mention…

- Definition, the three GoF categories, and front-end-specific patterns.
- Concrete places patterns appear in JS and in the frameworks you use.
- A real example where a pattern simplified extension or testing, and one where you deliberately avoided one.
