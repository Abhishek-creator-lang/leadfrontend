import React from 'react';
import './styles.css';

const SECTIONS = [
  {
    value: 'html',
    title: 'HTML',
    contents: 'The HyperText Markup Language is the standard markup language for documents designed to be displayed in a web browser.',
  },
  {
    value: 'css',
    title: 'CSS',
    contents: 'Cascading Style Sheets is a style sheet language used for describing the presentation of a document written in HTML.',
  },
  {
    value: 'javascript',
    title: 'JavaScript',
    contents: 'JavaScript is a programming language that, along with HTML and CSS, is one of the core technologies of the Web.',
  },
];

// TODO: make sections expandable/collapsible, accessible and keyboard navigable.
export function Accordion({ sections }) {
  return (
    <div className="accordion">
      {sections.map(({ value, title, contents }) => (
        <div className="accordion-item" key={value}>
          <button className="accordion-header">{title}</button>
          <div className="accordion-panel">{contents}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return <Accordion sections={SECTIONS} />;
}
