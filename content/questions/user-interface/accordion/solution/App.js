import React, { useId, useRef, useState } from 'react';
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

export function Accordion({ sections }) {
  const [open, setOpen] = useState(() => new Set());
  const baseId = useId();
  const headerRefs = useRef([]);

  const toggle = (value) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  const onKeyDown = (event, index) => {
    const last = sections.length - 1;
    let target;
    switch (event.key) {
      case 'ArrowDown':
        target = index === last ? 0 : index + 1;
        break;
      case 'ArrowUp':
        target = index === 0 ? last : index - 1;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    headerRefs.current[target]?.focus();
  };

  return (
    <div className="accordion">
      {sections.map(({ value, title, contents }, index) => {
        const isOpen = open.has(value);
        const headerId = `${baseId}-header-${value}`;
        const panelId = `${baseId}-panel-${value}`;
        return (
          <div className="accordion-item" key={value}>
            <h3 style={{ margin: 0 }}>
              <button
                ref={(el) => (headerRefs.current[index] = el)}
                id={headerId}
                type="button"
                className="accordion-header"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(value)}
                onKeyDown={(e) => onKeyDown(e, index)}
              >
                {title}
                <span aria-hidden="true" className={`chevron${isOpen ? ' chevron--open' : ''}`} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={headerId} className="accordion-panel" hidden={!isOpen}>
              {contents}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  return <Accordion sections={SECTIONS} />;
}
