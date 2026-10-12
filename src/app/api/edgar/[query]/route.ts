import { NextResponse } from 'next/server';

// Server-side proxy to the Dataville API. Calling Dataville from here rather
// than from the browser keeps DATAVILLE_API_KEY out of client bundles.
// Without a key the request still works, at anonymous rate limits.
const DATAVILLE_API_BASE = process.env.DATAVILLE_API_BASE ?? 'https://api.dataville.com';

// The app lets visitors search any company, so this route can't be limited to
// a fixed list. If you deploy it publicly with your key, cap how many lookups
// one visitor can spend. This is per server instance and resets on restart:
// enough for a demo, not a substitute for real rate limiting.
const LOOKUPS_PER_WINDOW = Number(process.env.EDGAR_LOOKUPS_PER_WINDOW ?? 30);
const WINDOW_MS = 10 * 60 * 1000;
const lookupsByIp = new Map<string, { count: number; resetAt: number }>();

function overLimit(ip: string): boolean {
  const now = Date.now();
  const entry = lookupsByIp.get(ip);
  if (!entry || entry.resetAt <= now) {
    lookupsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LOOKUPS_PER_WINDOW;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(req: Request, { params }: { params: { query: string } }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (overLimit(ip)) {
    return NextResponse.json(
      {
        status: 'error',
        data: {
          code: 'DEMO_RATE_LIMITED',
          error:
            "You've looked up a lot of companies in a short time. Nothing went wrong; wait a few minutes and try again, or use the Dataville API directly with your own key.",
        },
      },
      { status: 429, headers: { 'Retry-After': String(WINDOW_MS / 1000) } },
    );
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.DATAVILLE_API_KEY) {
    headers.Authorization = `Bearer ${process.env.DATAVILLE_API_KEY}`;
  }

  try {
    const res = await fetch(`${DATAVILLE_API_BASE}/edgar/${encodeURIComponent(safeDecode(params.query))}`, {
      headers,
      // Dataville caches EDGAR for 30 minutes anyway; this saves repeat lookups
      // of the default companies from spending the key at all.
      next: { revalidate: 600 },
    });
    const body = await res.json();
    const retryAfter = res.headers.get('Retry-After');
    return NextResponse.json(body, {
      status: res.status,
      headers: retryAfter ? { 'Retry-After': retryAfter } : undefined,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        data: {
          code: 'DATAVILLE_UNREACHABLE',
          error:
            "Couldn't reach the Dataville API. Check your network connection and try again; if it keeps happening, contact support@dataville.com.",
        },
      },
      { status: 502 },
    );
  }
}
