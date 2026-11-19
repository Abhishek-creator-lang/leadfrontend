import React from 'react';
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

// TODO: render the tree recursively. Folders should be collapsible buttons,
// listed before files, each group sorted alphabetically.
export function FileExplorer({ data }) {
  return (
    <ul className="tree">
      {data.map((node) => (
        <li key={node.id}>{node.name}</li>
      ))}
    </ul>
  );
}

export default function App() {
  return <FileExplorer data={DATA} />;
}
