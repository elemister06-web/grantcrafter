export function detectSource(): string {
  if (typeof window === "undefined") return "Direct";
  const params = new URLSearchParams(window.location.search);
  const gclid = params.get("gclid");
  const utmMedium = params.get("utm_medium");
  const utmSource = params.get("utm_source");

  if (gclid || utmMedium === "cpc" || utmMedium === "paid") return "Google Ads";
  if (utmSource === "facebook" || utmSource === "instagram" || utmMedium === "social") return "Social";
  if (utmSource === "bing" || utmMedium === "bing") return "Bing";
  if (utmSource) return utmSource.charAt(0).toUpperCase() + utmSource.slice(1);

  const ref = document.referrer;
  if (!ref) return "Direct";
  try {
    const domain = new URL(ref).hostname.replace("www.", "");
    if (domain.includes("google.")) return "Google Organic";
    if (domain.includes("facebook.") || domain.includes("instagram.")) return "Social";
    if (domain.includes("twitter.") || domain.includes("x.com")) return "Social";
    if (domain.includes("tiktok.")) return "Social";
    if (domain.includes("bing.")) return "Bing";
    return "Referral: " + domain;
  } catch {
    return "Direct";
  }
}
