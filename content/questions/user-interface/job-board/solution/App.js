import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchJobIds, fetchJob } from './api';
import './styles.css';

const PAGE_SIZE = 6;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function JobCard({ job }) {
  const titleId = `job-${job.id}-title`;
  return (
    <article className="job" aria-labelledby={titleId}>
      <h2 id={titleId}>
        {job.url ? (
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            {job.title}
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          job.title
        )}
      </h2>
      <p className="meta">
        By {job.by} · <time dateTime={new Date(job.time * 1000).toISOString()}>{dateFormat.format(job.time * 1000)}</time>
      </p>
    </article>
  );
}

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'idle' | 'error'
  const [hasMore, setHasMore] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Values async code needs synchronously, without re-creating the loader.
  const idsRef = useRef(null); // fetched once, then reused
  const offsetRef = useRef(0); // index into ids of the next page
  const busyRef = useRef(false); // guards against overlapping loads (double clicks, Strict Mode)
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadNextPage = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setStatus('loading');
    try {
      if (!idsRef.current) idsRef.current = await fetchJobIds();
      const ids = idsRef.current;
      const pageIds = ids.slice(offsetRef.current, offsetRef.current + PAGE_SIZE);
      // Parallel requests; the page renders only once all of them resolve, in id order.
      const page = (await Promise.all(pageIds.map((id) => fetchJob(id)))).filter(Boolean);
      if (!mountedRef.current) return;
      offsetRef.current += pageIds.length;
      setJobs((prev) => [...prev, ...page]);
      setHasMore(offsetRef.current < ids.length);
      setStatus('idle');
      setAnnouncement(`Loaded ${page.length} more jobs`);
    } catch {
      // The offset only advances on success, so Retry repeats exactly the step that failed.
      if (mountedRef.current) setStatus('error');
    } finally {
      busyRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadNextPage();
  }, [loadNextPage]);

  const isLoading = status === 'loading';
  const isInitial = jobs.length === 0;

  return (
    <main className="board">
      <h1>Hacker News Jobs</h1>

      {isInitial && isLoading && <p className="loading">Loading jobs…</p>}

      {jobs.length > 0 && (
        <ul className="jobs" aria-label="Job postings">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      )}

      {status === 'error' && (
        <div role="alert" className="error">
          <p>Something went wrong while loading jobs.</p>
          <button type="button" onClick={loadNextPage}>
            Retry
          </button>
        </div>
      )}

      {!isInitial && hasMore && status !== 'error' && (
        <button
          type="button"
          className="load-more"
          // aria-disabled (not disabled) so the focused button keeps focus while the page loads.
          aria-disabled={isLoading}
          onClick={() => {
            if (!isLoading) loadNextPage();
          }}
        >
          {isLoading ? 'Loading…' : 'Load more jobs'}
        </button>
      )}

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </main>
  );
}
