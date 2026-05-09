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

  return `You are an expert grant research specialist with deep knowledge of federal, state, local, and private grant programs available to small businesses and nonprofits in the United States.

Based on the following business profile, identify 12–18 real, currently active or recurring grant opportunities this business may qualify for this month. Research across all relevant categories: federal programs (Grants.gov, SBA, USDA, EDA, HHS, DOE, DOT), state programs (economic development, SBDC, workforce), local programs (city/county), and private foundations.

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

FORMAT YOUR RESPONSE as a structured grant report with the following sections:

## 🏆 Top Opportunities This Month
[List the 3-5 best matches first — highest funding, best eligibility fit, soonest deadline]

## 📋 All Opportunities

For each grant, provide:
**[Grant/Program Name]**
- Organization: [Granting organization]
- Type: [Federal / State / Local / Private Foundation]
- Award Amount: [Dollar range or maximum]
- Eligibility Deadline: [Date or "Rolling" or "Annual — typically [month]"]
- Match Score: [High / Medium — based on this business's profile]
- Who Qualifies: [Key eligibility requirements in plain English]
- What It Funds: [2-3 sentences on what the money is for]
- How to Apply: [Where to find the application — official URL when known]
- Pro Tip: [One specific tip for this business to strengthen their application]

---

## 📅 Upcoming Deadlines to Watch
[List any grants with deadlines in the next 60 days]

## 💡 Qualification Tips for This Business
[3-5 specific tips to improve grant eligibility, based on their profile]

---

IMPORTANT COMPLIANCE REQUIREMENTS:
1. Only list real, legitimate grant programs. Do not fabricate grants.
2. Be accurate about eligibility — do not overstate qualification likelihood.
3. Use hedging language: "may qualify," "appears eligible," "worth investigating."
4. For private foundation grants, clearly note they require a full application review.
5. This report is informational only — awards are determined by the granting organization.
6. If a grant's current status is uncertain, say so and direct to the official source.

Make this report genuinely useful. This person is counting on accurate information to make decisions about where to invest their time applying for grants.`;
}
