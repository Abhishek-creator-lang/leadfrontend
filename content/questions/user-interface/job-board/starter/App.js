import React, { useState } from 'react';
import { fetchJobIds, fetchJob } from './api';
import './styles.css';

const PAGE_SIZE = 6;

// TODO:
// - fetch ids once, then the first page of job details in parallel
// - "Load more jobs" fetches the next page; disabled while loading; hidden at the end
// - loading / error (+ Retry) states, no updates after unmount, no duplicate pages
// - accessible list of articles, link vs plain title, localised date, announcements
export default function App() {
  const [jobs] = useState([]);

  return (
    <main className="board">
      <h1>Hacker News Jobs</h1>
      <ul className="jobs">
        {jobs.map((job) => (
          <li key={job.id}>
            <article className="job">
              <h2>{job.title}</h2>
            </article>
          </li>
        ))}
      </ul>
      <button type="button" className="load-more">
        Load more jobs
      </button>
    </main>
  );
}
