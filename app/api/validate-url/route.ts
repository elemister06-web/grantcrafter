import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

// Validates a list of URLs by sending HEAD requests.
// Returns { results: Record<url, boolean> }
export async function POST(req: NextRequest) {
  const { urls } = await req.json() as { urls: string[] };

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ results: {} });
  }

  // Limit to 20 URLs per call
  const limited = urls.slice(0, 20);

  const results: Record<string, boolean> = {};

  await Promise.all(
    limited.map(async (url) => {
      try {
        const res = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(5000),
          headers: { "User-Agent": "GrantCrafter-LinkChecker/1.0" },
        });
        // 200-399 = valid; 404, 410 = definitely dead; 5xx = treat as uncertain (keep link)
        results[url] = res.status < 400 || (res.status >= 500 && res.status < 600);
      } catch {
        results[url] = false;
      }
    })
  );

  return NextResponse.json({ results });
}
