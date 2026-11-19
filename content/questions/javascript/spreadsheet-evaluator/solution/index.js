class SheetError {
  constructor(code) {
    this.code = code;
  }
}

const ERRORS = {
  parse: new SheetError('#ERROR!'),
  cycle: new SheetError('#CYCLE!'),
  div0: new SheetError('#DIV/0!'),
  value: new SheetError('#VALUE!'),
  name: new SheetError('#NAME?'),
};

const REF = /^([A-Z]+)([1-9]\d*)$/;

function normalizeRef(ref) {
  const upper = String(ref).trim().toUpperCase();
  if (!REF.test(upper)) throw new Error(`Invalid cell reference: ${ref}`);
  return upper;
}

function columnToIndex(letters) {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function indexToColumn(n) {
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

function expandRange(from, to) {
  const [, c1, r1] = REF.exec(from);
  const [, c2, r2] = REF.exec(to);
  const colStart = Math.min(columnToIndex(c1), columnToIndex(c2));
  const colEnd = Math.max(columnToIndex(c1), columnToIndex(c2));
  const rowStart = Math.min(Number(r1), Number(r2));
  const rowEnd = Math.max(Number(r1), Number(r2));
  const refs = [];
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) refs.push(indexToColumn(col) + row);
  }
  return refs;
}

// ---------- Tokenizer and recursive-descent parser ----------

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
    } else if (/[0-9.]/.test(c)) {
      const m = /^\d*\.?\d+/.exec(src.slice(i));
      if (!m) throw new SyntaxError('Bad number');
      tokens.push({ type: 'num', value: Number(m[0]) });
      i += m[0].length;
    } else if (/[A-Za-z]/.test(c)) {
      const word = /^[A-Za-z]+\d*/.exec(src.slice(i))[0].toUpperCase();
      tokens.push(REF.test(word) ? { type: 'ref', value: word } : { type: 'name', value: word });
      i += word.length;
    } else if ('+-*/(),:'.includes(c)) {
      tokens.push({ type: c });
      i++;
    } else {
      throw new SyntaxError(`Unexpected character ${c}`);
    }
  }
  return tokens;
}

function parseFormula(src) {
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (type) => {
    if (!peek() || peek().type !== type) throw new SyntaxError(`Expected ${type}`);
    return next();
  };

  function expression() {
    let node = term();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = next().type;
      node = { type: 'binary', op, left: node, right: term() };
    }
    return node;
  }

  function term() {
    let node = factor();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = next().type;
      node = { type: 'binary', op, left: node, right: factor() };
    }
    return node;
  }

  function factor() {
    const token = next();
    if (!token) throw new SyntaxError('Unexpected end of formula');
    switch (token.type) {
      case '-':
        return { type: 'negate', arg: factor() };
      case 'num':
        return { type: 'num', value: token.value };
      case 'ref':
        return { type: 'ref', ref: token.value };
      case '(': {
        const inner = expression();
        expect(')');
        return inner;
      }
      case 'name': {
        expect('(');
        const args = [argument()];
        while (peek() && peek().type === ',') {
          next();
          args.push(argument());
        }
        expect(')');
        return { type: 'call', name: token.value, args };
      }
      default:
        throw new SyntaxError('Unexpected token');
    }
  }

  function argument() {
    if (peek() && peek().type === 'ref' && tokens[pos + 1] && tokens[pos + 1].type === ':') {
      const from = next().value;
      next();
      const to = expect('ref').value;
      return { type: 'range', refs: expandRange(from, to) };
    }
    return expression();
  }

  const ast = expression();
  if (pos !== tokens.length) throw new SyntaxError('Unexpected trailing input');
  return ast;
}

function collectRefs(node, out) {
  switch (node.type) {
    case 'ref':
      out.add(node.ref);
      break;
    case 'range':
      node.refs.forEach((r) => out.add(r));
      break;
    case 'negate':
      collectRefs(node.arg, out);
      break;
    case 'binary':
      collectRefs(node.left, out);
      collectRefs(node.right, out);
      break;
    case 'call':
      node.args.forEach((a) => collectRefs(a, out));
      break;
    default:
      break;
  }
  return out;
}

// ---------- Evaluation ----------

function toNumber(value) {
  if (value instanceof SheetError) return value;
  if (value === null) return 0;
  if (typeof value === 'number') return value;
  return ERRORS.value;
}

function evaluateNode(node, lookup) {
  switch (node.type) {
    case 'num':
      return node.value;
    case 'ref': {
      const value = lookup(node.ref);
      return value === null ? 0 : value;
    }
    case 'negate': {
      const value = toNumber(evaluateNode(node.arg, lookup));
      return value instanceof SheetError ? value : -value;
    }
    case 'binary': {
      const left = toNumber(evaluateNode(node.left, lookup));
      if (left instanceof SheetError) return left;
      const right = toNumber(evaluateNode(node.right, lookup));
      if (right instanceof SheetError) return right;
      switch (node.op) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        default:
          return right === 0 ? ERRORS.div0 : left / right;
      }
    }
    case 'call': {
      const numbers = [];
      for (const arg of node.args) {
        if (arg.type === 'range') {
          for (const ref of arg.refs) {
            const value = lookup(ref);
            if (value instanceof SheetError) return value;
            if (typeof value === 'number') numbers.push(value);
          }
        } else {
          const value = toNumber(evaluateNode(arg, lookup));
          if (value instanceof SheetError) return value;
          numbers.push(value);
        }
      }
      switch (node.name) {
        case 'SUM':
          return numbers.reduce((a, b) => a + b, 0);
        case 'MIN':
          return numbers.length ? Math.min(...numbers) : 0;
        case 'MAX':
          return numbers.length ? Math.max(...numbers) : 0;
        default:
          return ERRORS.name;
      }
    }
    default:
      return ERRORS.parse;
  }
}

// ---------- Sheet ----------

export default function createSheet() {
  /** ref -> { raw, kind: 'literal' | 'formula' | 'invalid', value?, ast?, deps: Set<string> } */
  const cells = new Map();
  /** ref -> Set of refs whose formulas read it */
  const dependents = new Map();
  /** ref -> computed value of a formula cell */
  const cache = new Map();

  function invalidate(ref) {
    const stack = [ref];
    const seen = new Set();
    while (stack.length) {
      const current = stack.pop();
      if (seen.has(current)) continue;
      seen.add(current);
      cache.delete(current);
      const deps = dependents.get(current);
      if (deps) deps.forEach((d) => stack.push(d));
    }
  }

  function evaluate(ref, visiting) {
    const cell = cells.get(ref);
    if (!cell) return null;
    if (cell.kind === 'literal') return cell.value;
    if (cell.kind === 'invalid') return ERRORS.parse;
    if (cache.has(ref)) return cache.get(ref);
    // Reaching a cell that is already being evaluated means a circular reference.
    if (visiting.has(ref)) return ERRORS.cycle;

    visiting.add(ref);
    const value = evaluateNode(cell.ast, (r) => evaluate(r, visiting));
    visiting.delete(ref);
    cache.set(ref, value);
    return value;
  }

  return {
    set(ref, raw) {
      const key = normalizeRef(ref);
      const text = raw === undefined || raw === null ? '' : String(raw);

      const previous = cells.get(key);
      if (previous) {
        previous.deps.forEach((d) => dependents.get(d)?.delete(key));
      }

      if (text === '') {
        cells.delete(key);
      } else if (text.startsWith('=')) {
        let cell;
        try {
          const ast = parseFormula(text.slice(1));
          cell = { raw: text, kind: 'formula', ast, deps: collectRefs(ast, new Set()) };
        } catch {
          cell = { raw: text, kind: 'invalid', deps: new Set() };
        }
        cells.set(key, cell);
        cell.deps.forEach((d) => {
          if (!dependents.has(d)) dependents.set(d, new Set());
          dependents.get(d).add(key);
        });
      } else {
        const num = text.trim() === '' ? NaN : Number(text);
        cells.set(key, {
          raw: text,
          kind: 'literal',
          value: Number.isFinite(num) ? num : text,
          deps: new Set(),
        });
      }

      invalidate(key);
    },

    get(ref) {
      const value = evaluate(normalizeRef(ref), new Set());
      return value instanceof SheetError ? value.code : value;
    },

    getRaw(ref) {
      const cell = cells.get(normalizeRef(ref));
      return cell ? cell.raw : '';
    },
  };
}
