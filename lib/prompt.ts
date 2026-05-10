export interface BusinessProfile {
  businessName: string;
  businessType: string; // nonprofit | small_business | startup | solo
  industry: string;
  city: string;
  state: string;
  employeeCount: string;
  annualRevenue: string;
  yearsInBusiness: string;
  qualifiers: string[]; // woman-owned, minority-owned, veteran-owned, etc.
  additionalContext: string;
}

export function buildGrantPrompt(profile: BusinessProfile): string {
  const qualifierList =
    profile.qualifiers.length > 0
      ? profile.qualifiers.join(", ")
      : "No special ownership qualifiers";

  const today = new Date();
  const currentDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `You are an expert grant research specialist with deep knowledge of federal, state, local, and private grant programs available to small businesses and nonprofits in the United States.

Today's date is ${currentDate}. Based on the following business profile, identify 8–10 real, currently active or recurring grant opportunities this business may qualify for. Research across all relevant categories: federal programs (Grants.gov, SBA, USDA, EDA, HHS, DOE, DOT), state programs (economic development, SBDC, workforce), local programs (city/county), and private foundations.

BUSINESS PROFILE:
- Business Name: ${profile.businessName}
- Type: ${profile.businessType}
- Industry: ${profile.industry}
- Location: ${profile.city}, ${profile.state}
- Employees: ${profile.employeeCount}
- Annual Revenue: ${profile.annualRevenue}
- Years in Business: ${profile.yearsInBusiness}
- Ownership Qualifiers: ${qualifierList}
- Additional Context: ${profile.additionalContext || "None provided"}

FORMAT YOUR RESPONSE as a structured grant report with the following sections. Do NOT add any header lines like "Generated:" or dates — the system handles that automatically.

## 🏆 Top Opportunities This Week
[List the 3–5 best matches — highest funding, best eligibility fit, soonest deadline. Numbered list.]

## 📋 All Grant Opportunities

For each grant, use this exact format:

**[Grant/Program Name]**
- Organization: [Granting organization]
- Type: [Federal / State / Local / Private Foundation]
- Award Amount: [Dollar range or maximum]
- Deadline: [Specific date, "Rolling," or "Annual — typically [Month]"]
- Match Score: [High / Medium]
- Who Qualifies: [Key eligibility requirements in plain English]
- What It Funds: [2–3 sentences on what the money covers]
- How to Apply: [MUST include the direct official URL, e.g. https://www.grants.gov/... — if no single URL exists, provide the closest official program page URL]
- Pro Tip: [One specific, actionable tip for this exact business]

---

## 📅 Upcoming Deadlines

List grants with deadlines in the next 60 days as bullet points — one per line in this format:
- **[Grant Name]** — Deadline: [Date] — [One-line action to take]

(If no firm deadlines are known, list the 3–5 most time-sensitive rolling programs instead.)

## 💡 Tips to Strengthen Eligibility
[3–5 specific, actionable tips based on this business's exact profile — not generic advice]

---

IMPORTANT COMPLIANCE REQUIREMENTS:
1. Only list real, legitimate grant programs. Do not fabricate or invent grants.
2. Be accurate about eligibility — do not overstate the likelihood of qualification.
3. Use hedging language throughout: "may qualify," "appears eligible," "worth investigating."
4. For private foundation grants, clearly note they require a full application review process.
5. This report is for informational purposes only — awards are determined solely by the granting organization.
6. If a grant's current status is uncertain, say so and direct to the official source.
7. Do not use markdown tables anywhere in the report — use bullet points and bold text only.
8. Do not use single-hash headings (# Heading). Use ## for section headers only.
9. Do not add any introductory header or title line at the very top of the report.

Make this report genuinely useful. This person is counting on accurate, current information to decide where to invest their application time.`;
}
