import React, { useCallback, useMemo, useState } from 'react';
import './styles.css';

const DATA = [
  { id: 1, name: 'README.md' },
  {
    id: 2,
    name: 'src',
    children: [
      { id: 3, name: 'index.js' },
      {
        id: 4,
        name: 'components',
        children: [
          { id: 5, name: 'Header.js' },
          { id: 6, name: 'Button.js' },
        ],
      },
      { id: 7, name: 'App.js' },
      { id: 8, name: 'utils', children: [] },
    ],
  },
  { id: 9, name: 'package.json' },
  {
    id: 10,
    name: 'public',
    children: [
      { id: 11, name: 'index.html' },
      { id: 12, name: 'favicon.ico' },
    ],
  },
];

const isFolder = (node) => Array.isArray(node.children);
const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

// Folders first, then files; each group alphabetical. Returns a new tree (never mutates props).
function sortTree(nodes) {
  return [...nodes]
    .sort((a, b) => {
      const af = isFolder(a);
      const bf = isFolder(b);
      if (af !== bf) return af ? -1 : 1;
      return collator.compare(a.name, b.name);
    })
    .map((node) => (isFolder(node) ? { ...node, children: sortTree(node.children) } : node));
}

function TreeList({ nodes, expanded, onToggle, level }) {
  return (
    <ul className="tree" role={level === 1 ? undefined : 'group'}>
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} expanded={expanded} onToggle={onToggle} level={level} />
      ))}
    </ul>
  );
}

function TreeNode({ node, expanded, onToggle, level }) {
  if (!isFolder(node)) {
    return (
      <li className="tree-item">
        <span className="tree-row tree-file">
          <span aria-hidden="true" className="icon">📄</span>
          {node.name}
        </span>
      </li>
    );
  }

  const isOpen = expanded.has(node.id);
  return (
    <li className="tree-item">
      <button type="button" className="tree-row tree-folder" aria-expanded={isOpen} onClick={() => onToggle(node.id)}>
        <span aria-hidden="true" className={`caret${isOpen ? ' caret--open' : ''}`} />
        <span aria-hidden="true" className="icon">{isOpen ? '📂' : '📁'}</span>
        {node.name}
      </button>
      {isOpen &&
        (node.children.length ? (
          <TreeList nodes={node.children} expanded={expanded} onToggle={onToggle} level={level + 1} />
        ) : (
          <p className="tree-empty">Empty</p>
        ))}
    </li>
  );
}

export function FileExplorer({ data }) {
  // Lifted to the root so a nested folder remembers being open even after its parent unmounts it.
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
    <nav aria-label="Files" className="explorer">
      <TreeList nodes={sorted} expanded={expanded} onToggle={onToggle} level={1} />
    </nav>
  );
}

export default function App() {
  return <FileExplorer data={DATA} />;
}
