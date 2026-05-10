export interface ParsedGrant {
  name: string;
  slug: string;
  organization: string;
  type: string;
  amount: string;
  deadline: string;
  matchScore: string;
  whatItFunds: string;
  howToApply: string;
  applyUrl: string | null;
  proTip: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function parseGrantsFromReport(content: string): ParsedGrant[] {
  const grants: ParsedGrant[] = [];
  const lines = content.split("\n");
  let inAllOpportunities = false;
  let current: Partial<ParsedGrant> | null = null;

  function finalize(g: Partial<ParsedGrant>) {
    if (g.name) {
      grants.push({
        name: g.name,
        slug: g.slug || slugify(g.name),
        organization: g.organization || "",
        type: g.type || "",
        amount: g.amount || "",
        deadline: g.deadline || "",
        matchScore: g.matchScore || "",
        whatItFunds: g.whatItFunds || "",
        howToApply: g.howToApply || "",
        applyUrl: g.applyUrl || null,
        proTip: g.proTip || "",
      });
    }
  }

  for (const line of lines) {
    // Section detection
    if (/^## /.test(line)) {
      const lower = line.toLowerCase();
      if (lower.includes("all") && lower.includes("opportunit")) {
        inAllOpportunities = true;
        if (current) { finalize(current); current = null; }
      } else {
        if (inAllOpportunities && current) { finalize(current); current = null; }
        inAllOpportunities = false;
      }
      continue;
    }

    if (!inAllOpportunities) continue;

    // Grant name: standalone **Name** line (may have leading number like "1. ")
    if (/^\*\*([^*]+)\*\*$/.test(line)) {
      if (current) finalize(current);
      let name = line.replace(/\*\*/g, "").trim();
      name = name.replace(/^\d+\.\s*/, ""); // strip "1. "
      current = { name, slug: slugify(name) };
      continue;
    }

    // Bullet field
    if (current && /^- /.test(line)) {
      const body = line.slice(2);
      const colon = body.indexOf(":");
      if (colon < 1) continue;
      const field = body.slice(0, colon).toLowerCase().trim();
      const value = body.slice(colon + 1).trim().replace(/\*\*(.+?)\*\*/g, "$1");

      if (field.includes("organization")) current.organization = value;
      else if (field === "type") current.type = value;
      else if (field.includes("amount") || field.includes("award")) current.amount = value;
      else if (field.includes("deadline")) current.deadline = value;
      else if (field.includes("match")) current.matchScore = value;
      else if (field.includes("funds") || field.includes("what it")) current.whatItFunds = value;
      else if (field.includes("apply")) {
        current.howToApply = value;
        const m = value.match(/https?:\/\/[^\s)>\]]+/);
        if (m) current.applyUrl = m[0];
      }
      else if (field.includes("tip")) current.proTip = value;
    }
  }

  if (current) finalize(current);
  return grants;
}
