import React from 'react';
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

// TODO: make group checkboxes control their descendants, and derive each group's
// checked / unchecked / indeterminate state from its leaves. Show "N of M permissions selected".
function Node({ node }) {
  return (
    <li>
      <label className="option">
        <input type="checkbox" /> {node.label}
      </label>
      {node.children && (
        <ul className="tree">
          {node.children.map((child) => (
            <Node key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CheckboxTree({ data }) {
  return (
    <ul className="tree tree--root">
      {data.map((node) => (
        <Node key={node.id} node={node} />
      ))}
    </ul>
  );
}

export default function App() {
  return <CheckboxTree data={PERMISSIONS} />;
}
