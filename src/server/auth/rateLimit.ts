import 'server-only';
import { headers } from 'next/headers';

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

/**
 * Fixed-window in-memory limiter (per server instance). Enough to slow down credential stuffing on a
 * single node; use a shared store (e.g. Redis) when running several instances.
 */
export async function rateLimit(
  action: string,
  key: string,
  limit = 10,
  windowMs = 15 * 60 * 1000
) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const id = `${action}:${ip}:${key.toLowerCase()}`;
  const now = Date.now();
  const current = buckets.get(id);
  const window = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };
  window.count += 1;
  buckets.set(id, window);

  if (buckets.size > 10_000) {
    for (const [k, w] of buckets) if (w.resetAt <= now) buckets.delete(k);
  }
  return { ok: window.count <= limit };
}
