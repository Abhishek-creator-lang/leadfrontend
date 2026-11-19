// Mock of a Hacker News-style jobs API. It stands in for two real endpoints:
//   GET https://hacker-news.firebaseio.com/v0/jobstories.json   → [id, id, …] (newest first, up to ~200)
//   GET https://hacker-news.firebaseio.com/v0/item/<id>.json     → { id, by, title, time, url?, text? }
// The real API is JSON over fetch: you'd check response.ok, handle `null` items (deleted posts) and
// variable latency. `time` is Unix seconds. Some jobs have no `url` (the details are in `text`).

export const mockOptions = { delay: 80, failIds: false, failItems: false };

const COMPANIES = ['Lumen', 'Orbitly', 'Quarry', 'Tandem Bio', 'Northwind', 'Pixelforge', 'Kelp', 'Arbor'];
const ROLES = [
  'is hiring a Senior Frontend Engineer (Remote)',
  'is hiring Staff Engineers to build our design system',
  'is hiring a Founding Engineer (React, TypeScript)',
  '(YC W24) is hiring a Product Engineer in Berlin',
  'is looking for an Accessibility Engineer',
  'is hiring a Platform Engineer (Kubernetes)',
];

const BASE_TIME = 1767225600; // 2026-01-01T00:00:00Z
const JOBS = Array.from({ length: 15 }, (_, i) => {
  const company = COMPANIES[i % COMPANIES.length];
  const job = {
    id: 9100 + i,
    by: company.toLowerCase().replace(/\s+/g, ''),
    title: `${company} ${ROLES[i % ROLES.length]}`,
    time: BASE_TIME + (15 - i) * 3600 * 7,
  };
  // Every third job has no external link, like real self-posts.
  if (i % 3 !== 2) job.url = `https://example.com/jobs/${job.id}`;
  return job;
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchJobIds() {
  await wait(mockOptions.delay);
  if (mockOptions.failIds) throw new Error('Failed to load job ids');
  return JOBS.map((job) => job.id);
}

export async function fetchJob(id) {
  // Items arrive with slightly different latencies, like independent requests do.
  await wait(mockOptions.delay + (id % 4) * 5);
  if (mockOptions.failItems) throw new Error(`Failed to load job ${id}`);
  const job = JOBS.find((j) => j.id === id);
  return job ? { ...job } : null;
}
