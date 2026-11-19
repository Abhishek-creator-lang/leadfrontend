import React, { useCallback, useMemo, useState } from 'react';
import './styles.css';

const DATA = [
  { id: 'readme', name: 'README.md' },
  {
    id: 'src',
    name: 'src',
    children: [
      { id: 'index', name: 'index.js' },
      {
        id: 'components',
        name: 'components',
        children: [
          { id: 'header', name: 'Header.js' },
          { id: 'button', name: 'Button.js' },
        ],
      },
      { id: 'app', name: 'App.js' },
    ],
  },
  { id: 'pkg', name: 'package.json' },
  {
    id: 'public',
    name: 'public',
    children: [
      { id: 'html', name: 'index.html' },
      { id: 'favicon', name: 'favicon.ico' },
    ],
  },
];

const isFolder = (node) => Array.isArray(node.children);
const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

function sortTree(nodes) {
  return [...nodes]
    .sort((a, b) => {
      if (isFolder(a) !== isFolder(b)) return isFolder(a) ? -1 : 1;
      return collator.compare(a.name, b.name);
    })
    .map((n) => (isFolder(n) ? { ...n, children: sortTree(n.children) } : n));
}

function TreeNode({ node, expanded, onToggle }) {
  if (!isFolder(node)) return <li className="row file">{node.name}</li>;
  const isOpen = expanded.has(node.id);
  return (
    <li>
      <button type="button" className="row folder" aria-expanded={isOpen} onClick={() => onToggle(node.id)}>
        {isOpen ? '▾' : '▸'} {node.name}
      </button>
      {isOpen && (
        <ul className="tree">
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} expanded={expanded} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

// TODO: convert to the WAI-ARIA tree pattern: role="tree"/"treeitem"/"group",
// roving tabindex, arrow/Home/End/Enter keys, type-ahead and file selection.
export function FileTree({ data }) {
  const [expanded, setExpanded] = useState(() => new Set());
  const sorted = useMemo(() => sortTree(data), [data]);
  const onToggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <ul className="tree">
      {sorted.map((n) => (
        <TreeNode key={n.id} node={n} expanded={expanded} onToggle={onToggle} />
      ))}
    </ul>
  );
}

export default function App() {
  return <FileTree data={DATA} />;
}
