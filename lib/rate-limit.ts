interface Entry {
  count: number;
  resetAt: number;
}

// In-memory per-IP rate limit. Resets on server restart.
// For production multi-instance deploys, replace with Upstash Redis or Vercel KV.
const store = new Map<string, Entry>();

const MAX_REQUESTS = 5;
const WINDOW_MS    = 10 * 60 * 1000; // 10 minutes

// Purge expired entries every 5 minutes to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store) {
    if (now >= entry.resetAt) store.delete(ip);
  }
}, 5 * 60 * 1000);

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfter: number } {
  const now   = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfter: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, retryAfter: 0 };
}
