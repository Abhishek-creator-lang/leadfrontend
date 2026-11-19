## TL;DR

Type props with an **interface or type alias** and annotate the destructured parameter: `function Button({ label }: ButtonProps)`. Use **`React.ReactNode`** for `children` and other renderable slots, **function types** for callbacks, **union literals** for variants, and **discriminated unions** for mutually exclusive prop sets. For wrapper components, **reuse native element props** with `React.ComponentProps<'button'>` (or `ComponentPropsWithoutRef` / `ComponentPropsWithRef`) instead of redeclaring them. Defaults come from **destructuring defaults**. `React.FC` is optional and no longer injects `children` (since `@types/react` 18), so most teams just type the props parameter.

## Basics

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  onAction: (id: string) => void;
  children: React.ReactNode;
};

export function Button({ variant = 'primary', size = 'md', icon, onAction, children }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} onClick={() => onAction('x')}>
      {icon}
      {children}
    </button>
  );
}
```

- `ReactNode` accepts elements, strings, numbers, arrays, `null` and more. `ReactElement` or `JSX.Element` is narrower: only one element.
- Optional props with destructuring defaults are typed as non-optional inside the component.

## Extending native elements

```tsx
type InputProps = React.ComponentProps<'input'> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, ...rest }: InputProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={!!error} {...rest} />
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
```

Consumers get every valid `<input>` attribute (`type`, `placeholder`, `onChange`, ARIA). Use `Omit<React.ComponentProps<'button'>, 'type'>` to remove props you control. In React 19 types, `ComponentProps<'input'>` includes `ref`, since `ref` is now a regular prop.

To mirror another component's props: `React.ComponentProps<typeof Select>`.

## Mutually exclusive props

```tsx
type LinkOrButtonProps =
  | ({ as: 'a'; href: string } & React.ComponentPropsWithoutRef<'a'>)
  | ({ as?: 'button'; href?: never } & React.ComponentPropsWithoutRef<'button'>);
```

`href?: never` prevents passing `href` to the button variant. Narrow on `props.as` inside the component.

## Callbacks and render props

```tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onSelect?: (item: T) => void;
};
```

(See generic components for the `<List<T>>` pattern.)

## Style and className

`className?: string` and `style?: React.CSSProperties`. CSS custom properties need a cast or an augmented type: `{ '--gap': '8px' } as React.CSSProperties`.

## React.FC?

```tsx
const Card: React.FC<CardProps> = ({ title, children }) => …
```

Since `@types/react` 18, `FC` no longer adds implicit `children`. It works, but it prevents generic components and adds little, so many style guides prefer plain function declarations. Either is acceptable if consistent.

## Pitfalls

- Typing `children` as `JSX.Element` rejects strings and arrays.
- Spreading `...rest` onto a DOM element without excluding custom props leaks unknown attributes to the DOM (and React warns).
- Overly wide `any`/`object` props lose autocomplete. Overly clever conditional types slow the editor.
- Default props on function components (`Comp.defaultProps`) were removed for function components in React 19. Use destructuring defaults.

## In an interview, mention…

- Typed props objects, `ReactNode` children, union variants, and discriminated unions for exclusive props.
- `ComponentProps<'button'>` / `WithoutRef` / `WithRef` for wrappers, and `ref` in props in React 19.
- The `React.FC` trade-offs and that implicit `children` was removed.
- `defaultProps` removal for function components in React 19, in favour of destructuring defaults.
