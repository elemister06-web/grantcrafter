/**
 * known-good-urls.ts
 * Verified working URLs for known grant programs.
 * Use these exact URLs in prompts and reports — never guess alternatives.
 * Updated: 2026-05-10
 */

// ─── Verified URL Registry ─────────────────────────────────────────────────

export const KNOWN_GOOD_URLS: Record<string, string> = {
  // ── Federal ──────────────────────────────────────────────────────────────
  "grants_gov_search":            "https://www.grants.gov/search-grants",
  "sba_sbir_sttr":                "https://www.sbir.gov/apply",
  "sba_grants_overview":          "https://www.sba.gov/funding-programs/grants",
  "nsf_seed_fund":                "https://seedfund.nsf.gov/apply/",
  "usda_rural_business_dev":      "https://www.rd.usda.gov/programs-services/business-programs",
  "usda_rbdg":                    "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grant-program",
  "eda_build_to_scale":           "https://www.eda.gov/funding/programs/build-to-scale",
  "eda_funding_programs":         "https://www.eda.gov/funding/programs",
  "doe_sbir":                     "https://science.osti.gov/sbir",
  "nih_sbir":                     "https://grants.nih.gov/grants/funding/sbir.htm",
  "mbda_grants":                  "https://www.mbda.gov/page/grants",
  "sba_8a_program":               "https://www.sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program",
  "sba_womens_business_centers":  "https://www.sba.gov/local-assistance/resource-partners/womens-business-centers",
  "sba_score_mentoring":          "https://www.score.org/find-mentor",

  // ── Ohio State ────────────────────────────────────────────────────────────
  "ohio_dept_of_development":     "https://development.ohio.gov/",
  "ohio_sbdc":                    "https://www.ohiosbdc.net/",
  "ohio_techcred":                "https://techcred.ohio.gov",
  "ohio_third_frontier":          "https://thirdfrontier.com/",
  "ohio_minority_micro":          "https://development.ohio.gov/business",

  // ── Cincinnati Local ──────────────────────────────────────────────────────
  "mortar_cincinnati":            "https://wearemortar.com/program-page/",
  "cincinnati_sbdc":              "https://www.cincinnatisbdc.org",
  "cincinnati_chamber_grants":    "https://www.cincinnatichamber.com",
  "redi_cincinnati":              "https://www.redicincinnati.com",
  "hamilton_county_dev":          "https://hcdc.com",

  // ── Corporate / Private ───────────────────────────────────────────────────
  "hello_alice_grants":           "https://helloalice.com/grants/",
  "amber_grant_women":            "https://ambergrantsforwomen.com/get-an-amber-grant/apply/",
  "ifundwomen_grants":            "https://ifundwomen.com/grants",
  "verizon_digital_ready":        "https://digitalready.verizonwireless.com/funding",
  "comcast_rise":                 "https://www.comcastrise.com",
  "google_for_startups":          "https://startup.google.com/programs/",
  "visa_shes_next":               "https://shesnext.visa.com",
  "tory_burch_fellows":           "https://www.toryburchfoundation.org/programs/fellows/",
  "accion_opportunity_fund":      "https://accionopportunityfund.org/small-business-grants/",
  "walmart_community_grants":     "https://walmart.org/how-we-give/local-community-grants",
  "lowes_hometowns":              "https://newsroom.lowes.com/brand-updates/lowes-hometowns/",
};

// ─── Auto-Correction Map ─────────────────────────────────────────────────────

/**
 * Patterns that are known-bad and their replacements.
 * Each entry: [regex or string to match, replacement URL or null to remove block]
 */
const KNOWN_BAD_PATTERNS: Array<{
  pattern: RegExp;
  replacement: string | null;
  description: string;
}> = [
  {
    pattern: /https?:\/\/(?:www\.)?mortarcincy\.org[^\s)\]>,"']*/g,
    replacement: "https://wearemortar.com/program-page/",
    description: "MORTAR Cincinnati old domain → new domain",
  },
  {
    pattern: /https?:\/\/(?:www\.)?sbir\.gov\/about-sttr[^\s)\]>,"']*/g,
    replacement: "https://www.sbir.gov/apply",
    description: "SBIR about-sttr path → apply page",
  },
  {
    pattern: /https?:\/\/(?:www\.)?sbir\.gov\/apply-for-sbir-funding[^\s)\]>,"']*/g,
    replacement: "https://www.sbir.gov/apply",
    description: "SBIR old apply path → canonical apply",
  },
  {
    pattern: /https?:\/\/(?:www\.)?development\.ohio\.gov\/business\/techcred[^\s)\]>,"']*/g,
    replacement: "https://techcred.ohio.gov",
    description: "Ohio TechCred old path → standalone site",
  },
  {
    pattern: /https?:\/\/(?:www\.)?development\.ohio\.gov\/business\/state-trade-expansion[^\s)\]>,"']*/g,
    replacement: "https://development.ohio.gov/",
    description: "Ohio state trade expansion (removed program) → dept homepage",
  },
  {
    pattern: /https?:\/\/(?:www\.)?verizon\.com\/business\/small-business\/digital-ready[^\s)\]>,"']*/g,
    replacement: "https://digitalready.verizonwireless.com/funding",
    description: "Verizon old Digital Ready path → dedicated landing page",
  },
  {
    // Ohio SBDC — cert error on ohiosbdc.ohio.gov; real site is ohiosbdc.net
    pattern: /https?:\/\/(?:www\.)?ohiosbdc\.ohio\.gov[^\s)\]>,"']*/g,
    replacement: "https://www.ohiosbdc.net/",
    description: "Ohio SBDC broken cert domain → correct domain",
  },
  {
    // Old Ohio SBDC path variant
    pattern: /https?:\/\/(?:www\.)?ohiosbdc\.net\/find-sbdc[^\s)\]>,"']*/g,
    replacement: "https://www.ohiosbdc.net/",
    description: "Ohio SBDC old path → homepage",
  },
];

// FedEx Small Business Grant — program retired; remove entire grant block
const FEDEX_BLOCK_PATTERN =
  /\*\*FedEx[^\n]*\*\*[\s\S]*?(?=\n\*\*|\n##|$)/gi;

// ─── Public Fix Function ──────────────────────────────────────────────────────

/**
 * Finds and replaces known-bad URL patterns in report content.
 * Also removes retired programs (e.g. FedEx Small Business Grant).
 * Safe to call multiple times — idempotent.
 */
export function fixKnownBadUrls(content: string): string {
  let fixed = content;

  // Apply each URL fix
  for (const { pattern, replacement, description } of KNOWN_BAD_PATTERNS) {
    if (replacement !== null) {
      const before = fixed;
      fixed = fixed.replace(pattern, replacement);
      if (fixed !== before) {
        console.log(`[known-good-urls] Fixed: ${description}`);
      }
    }
  }

  // Remove retired FedEx grant block
  const beforeFedEx = fixed;
  fixed = fixed.replace(FEDEX_BLOCK_PATTERN, "");
  if (fixed !== beforeFedEx) {
    console.log("[known-good-urls] Removed retired FedEx Small Business Grant block");
  }

  return fixed;
}
