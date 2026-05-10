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
          headers: { "User-Agent": "Mozilla/5.0 (compatible; GrantCrafter/1.0)" },
        });

        if (res.status === 404 || res.status === 410) {
          // Confirm with a GET before marking dead — some servers reject HEAD
          try {
            const res2 = await fetch(url, {
              method: "GET",
              redirect: "follow",
              signal: AbortSignal.timeout(5000),
              headers: { "User-Agent": "Mozilla/5.0 (compatible; GrantCrafter/1.0)" },
            });
            results[url] = res2.status !== 404 && res2.status !== 410;
          } catch {
            // GET also failed — assume valid (timeout/block, not dead)
            results[url] = true;
          }
        } else {
          // 2xx/3xx = valid; 4xx (not 404/410) = blocked but real; 5xx = uncertain but real
          results[url] = true;
        }
      } catch {
        // Timeout, DNS error, firewall block — assume the link is valid
        // Only confirmed 404/410 responses should hide a link
        results[url] = true;
      }
    })
  );

  return NextResponse.json({ results });
}
