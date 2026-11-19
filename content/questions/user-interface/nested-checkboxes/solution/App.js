import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import './styles.css';

const PERMISSIONS = [
  {
    id: 'billing',
    label: 'Billing',
    children: [
      { id: 'billing.view', label: 'View invoices' },
      { id: 'billing.pay', label: 'Pay invoices' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    children: [
      { id: 'projects.create', label: 'Create projects' },
      {
        id: 'projects.members',
        label: 'Members',
        children: [
          { id: 'projects.members.invite', label: 'Invite members' },
          { id: 'projects.members.remove', label: 'Remove members' },
        ],
      },
    ],
  },
  { id: 'audit', label: 'View audit log' },
];

const isGroup = (node) => Array.isArray(node.children) && node.children.length > 0;

// id -> array of leaf ids underneath (a leaf maps to [itself]). One O(n) post-order pass.
function buildLeafIndex(nodes, index = new Map()) {
  for (const node of nodes) {
    if (isGroup(node)) {
      buildLeafIndex(node.children, index);
      index.set(node.id, node.children.flatMap((c) => index.get(c.id)));
    } else {
      index.set(node.id, [node.id]);
    }
  }
  return index;
}

// Native checkbox with support for the JS-only `indeterminate` property.
function TriStateCheckbox({ checked, indeterminate, onChange, label }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <span className="option">
      <input ref={ref} id={id} type="checkbox" checked={checked} onChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </span>
  );
}

const Node = React.memo(function Node({ node, leafIndex, checked, onToggle }) {
  const leaves = leafIndex.get(node.id);
  let count = 0;
  for (const leaf of leaves) if (checked.has(leaf)) count++;
  const all = count === leaves.length;

  return (
    <li>
      <TriStateCheckbox
        label={node.label}
        checked={all}
        indeterminate={count > 0 && !all}
        onChange={() => onToggle(node.id, !all)}
      />
      {isGroup(node) && (
        <ul className="tree">
          {node.children.map((child) => (
            <Node key={child.id} node={child} leafIndex={leafIndex} checked={checked} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  );
});

export function CheckboxTree({ data, legend = 'Permissions' }) {
  const leafIndex = useMemo(() => buildLeafIndex(data), [data]);
  const totalLeaves = useMemo(() => data.reduce((n, node) => n + leafIndex.get(node.id).length, 0), [data, leafIndex]);

  // Single source of truth: the set of checked LEAF ids. Group state is always derived.
  const [checked, setChecked] = useState(() => new Set());

  const onToggle = useCallback(
    (id, value) => {
      setChecked((prev) => {
        const next = new Set(prev);
        for (const leaf of leafIndex.get(id)) value ? next.add(leaf) : next.delete(leaf);
        return next;
      });
    },
    [leafIndex]
  );

  return (
    <fieldset className="checkbox-tree">
      <legend>{legend}</legend>
      <ul className="tree tree--root">
        {data.map((node) => (
          <Node key={node.id} node={node} leafIndex={leafIndex} checked={checked} onToggle={onToggle} />
        ))}
      </ul>
      <p className="summary" aria-live="polite">
        {checked.size} of {totalLeaves} permissions selected
      </p>
    </fieldset>
  );
}

export default function App() {
  return <CheckboxTree data={PERMISSIONS} />;
}
