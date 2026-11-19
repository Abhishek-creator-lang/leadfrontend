import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
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

// id -> { node, parentId }. Built once per data change.
function indexTree(nodes, parentId = null, map = new Map()) {
  for (const node of nodes) {
    map.set(node.id, { node, parentId });
    if (isFolder(node)) indexTree(node.children, node.id, map);
  }
  return map;
}

// Depth-first list of the ids a user can currently see (children of collapsed folders are skipped).
function visibleIds(nodes, expanded, out = []) {
  for (const node of nodes) {
    out.push(node.id);
    if (isFolder(node) && expanded.has(node.id)) visibleIds(node.children, expanded, out);
  }
  return out;
}

function TreeItem({ node, level, posinset, setsize, ctx }) {
  const { expanded, tabStopId, selectedId, baseId, registerRef, onRowClick } = ctx;
  const folder = isFolder(node);
  const isOpen = folder && expanded.has(node.id);
  const labelId = `${baseId}-${node.id}`;

  return (
    <li
      ref={(el) => registerRef(node.id, el)}
      role="treeitem"
      data-id={node.id}
      aria-labelledby={labelId}
      aria-level={level}
      aria-posinset={posinset}
      aria-setsize={setsize}
      aria-expanded={folder ? isOpen : undefined}
      aria-selected={folder ? undefined : selectedId === node.id}
      tabIndex={tabStopId === node.id ? 0 : -1}
      className="treeitem"
    >
      <div
        className={`row${selectedId === node.id ? ' row--selected' : ''}`}
        style={{ paddingLeft: 6 + (level - 1) * 18 }}
        onClick={() => onRowClick(node)}
      >
        <span aria-hidden="true" className="icon">
          {folder ? (isOpen ? '▾' : '▸') : ''}
        </span>
        <span id={labelId}>{node.name}</span>
      </div>
      {isOpen && node.children.length > 0 && (
        <ul role="group" className="group">
          {node.children.map((child, i) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              posinset={i + 1}
              setsize={node.children.length}
              ctx={ctx}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({ data, label = 'Project files' }) {
  const baseId = useId();
  const sorted = useMemo(() => sortTree(data), [data]);
  const byId = useMemo(() => indexTree(sorted), [sorted]);

  const [expanded, setExpanded] = useState(() => new Set());
  const [focusedId, setFocusedId] = useState(() => sorted[0]?.id ?? null);
  const [selectedId, setSelectedId] = useState(null);
  const itemRefs = useRef(new Map());

  const visible = useMemo(() => visibleIds(sorted, expanded), [sorted, expanded]);

  // If the focused item got hidden (an ancestor was collapsed by mouse), hand the tab stop
  // to its nearest visible ancestor so the tree always has exactly one.
  const tabStopId = useMemo(() => {
    const visibleSet = new Set(visible);
    let id = focusedId;
    while (id != null && !visibleSet.has(id)) id = byId.get(id)?.parentId ?? null;
    return id ?? visible[0];
  }, [focusedId, visible, byId]);

  const registerRef = useCallback((id, el) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  const setOpen = (id, open) =>
    setExpanded((prev) => {
      if (prev.has(id) === open) return prev;
      const next = new Set(prev);
      open ? next.add(id) : next.delete(id);
      return next;
    });

  const focusItem = (id) => {
    if (id == null) return;
    setFocusedId(id);
    itemRefs.current.get(id)?.focus();
  };

  const activate = (node) => {
    if (isFolder(node)) setOpen(node.id, !expanded.has(node.id));
    else setSelectedId(node.id);
  };

  const onRowClick = (node) => {
    focusItem(node.id);
    activate(node);
  };

  const onKeyDown = (event) => {
    const li = event.target.closest('[role="treeitem"]');
    if (!li) return;
    const id = li.dataset.id;
    const { node, parentId } = byId.get(id);
    const index = visible.indexOf(id);
    const folder = isFolder(node);
    const isOpen = folder && expanded.has(id);

    switch (event.key) {
      case 'ArrowDown':
        focusItem(visible[Math.min(index + 1, visible.length - 1)]);
        break;
      case 'ArrowUp':
        focusItem(visible[Math.max(index - 1, 0)]);
        break;
      case 'ArrowRight':
        if (!folder) break;
        if (!isOpen) setOpen(id, true);
        else if (node.children.length) focusItem(node.children[0].id);
        break;
      case 'ArrowLeft':
        if (isOpen) setOpen(id, false);
        else focusItem(parentId);
        break;
      case 'Home':
        focusItem(visible[0]);
        break;
      case 'End':
        focusItem(visible[visible.length - 1]);
        break;
      case 'Enter':
        activate(node);
        break;
      default: {
        // Type-ahead: single printable character, no modifiers.
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || !/\S/.test(event.key)) return;
        const ch = event.key.toLowerCase();
        for (let step = 1; step <= visible.length; step++) {
          const candidate = visible[(index + step) % visible.length];
          if (byId.get(candidate).node.name.toLowerCase().startsWith(ch)) {
            focusItem(candidate);
            break;
          }
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const onFocus = (event) => {
    const li = event.target.closest('[role="treeitem"]');
    if (li && li === event.target) setFocusedId(li.dataset.id);
  };

  const ctx = { expanded, tabStopId, selectedId, baseId, registerRef, onRowClick };
  const selected = selectedId != null ? byId.get(selectedId)?.node : null;

  return (
    <div className="explorer">
      <ul role="tree" aria-label={label} className="tree" onKeyDown={onKeyDown} onFocus={onFocus}>
        {sorted.map((node, i) => (
          <TreeItem key={node.id} node={node} level={1} posinset={i + 1} setsize={sorted.length} ctx={ctx} />
        ))}
      </ul>
      <p className="status" aria-live="polite">
        {selected ? `Selected: ${selected.name}` : 'No file selected'}
      </p>
    </div>
  );
}

export default function App() {
  return <FileTree data={DATA} />;
}
