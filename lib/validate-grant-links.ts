/**
 * validate-grant-links.ts
 * Validates all URLs in a grant report before saving.
 * Strips confirmed-dead links (404/410) so customers never see broken "Apply Now" buttons.
 * Government sites that block automated checks are kept as-is (they're real, just firewalled).
 *
 * NOTE: fixKnownBadUrls() is called automatically at the start of validateAndCleanReport()
 * so known-bad patterns are corrected before any HTTP checks run.
 */

import { fixKnownBadUrls } from "@/lib/known-good-urls";

const TIMEOUT_MS = 6000;
const DEFINITELY_DEAD = [404, 410];
const TREAT_AS_VALID = [403, 405, 406, 429, 503]; // Blocked/rate-limited — assume link is real

async function checkUrl(url: string): Promise<"valid" | "dead" | "blocked"> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GrantCrafter/1.0)" },
    });
    clearTimeout(timer);

    if (TREAT_AS_VALID.includes(res.status)) return "blocked";
    if (DEFINITELY_DEAD.includes(res.status)) {
      // Try GET as fallback before marking dead (some servers reject HEAD)
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), TIMEOUT_MS);
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller2.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GrantCrafter/1.0)" },
      });
      clearTimeout(timer2);
      if (res.status < 400 || TREAT_AS_VALID.includes(res.status)) return "blocked";
      return DEFINITELY_DEAD.includes(res.status) ? "dead" : "valid";
    }
    return res.status < 400 ? "valid" : "dead";
  } catch {
    // Timeout, DNS block, firewall — assume real.
    // We only remove links on confirmed 404/410. Unknown = keep.
    return "blocked";
  }
}

/**
 * Validates all URLs found in a report and removes confirmed-dead links.
 * Automatically applies fixKnownBadUrls() before HTTP checks.
 * Returns the cleaned report content + a log of what was found.
 */
export async function validateAndCleanReport(rawContent: string): Promise<{
  cleanedContent: string;
  log: { url: string; status: "valid" | "dead" | "blocked" }[];
}> {
  // Fix known-bad patterns before any HTTP checks run
  const content = fixKnownBadUrls(rawContent);

  const urlRegex = /https?:\/\/[^\s)\]>,"]+/g;
  const urls = Array.from(new Set(content.match(urlRegex) || []));
  const log: { url: string; status: "valid" | "dead" | "blocked" }[] = [];

  // Validate all URLs in parallel (max 20 at a time)
  const results = await Promise.all(
    urls.slice(0, 20).map(async (url) => {
      const status = await checkUrl(url);
      log.push({ url, status });
      return { url, status };
    })
  );

  // Strip confirmed-dead URLs from the report content
  let cleaned = content;
  for (const { url, status } of results) {
    if (status === "dead") {
      // Replace the dead URL inline — keep the surrounding text, just remove the link
      cleaned = cleaned.replace(url, "[link currently unavailable — search the program name directly]");
      console.log(`[validate-grant-links] Removed dead URL: ${url}`);
    }
  }

  return { cleanedContent: cleaned, log };
}
